import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "../../context/supabaseClient";
import { Button, Box , Paper, Typography, MenuItem, Select, FormControl, InputLabel, Grid, TextField, Tooltip } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const MTR_Information = () => {
  const [data, setData] = useState([]);
  const [formatImporter, setFormatImporter] = useState("");
  const [handlingData, setHandlingData] = useState([]);
  const [removalData, setRemovalData] = useState([]);
  const [importers, setImporters] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const isMobile = useMediaQuery("(max-width:600px)");
  const [balanceData,setBalanceData] = useState([]);

  useEffect(() => {
    fetchImporters();
    fetchData();
    fetchHandlingData();
    fetchRemovalData();
    fetchBalanceData();
  }, [formatImporter, startDate, endDate]);

  const fetchImporters = async () => {
    const { data, error } = await supabase.from("reciept1").select("format_importer");
    if (error) {
      console.error("Error fetching importers:", error);
    } else {
      const uniqueImporters = [...new Set(data.map(d => d.format_importer))];
      setImporters(uniqueImporters);
    }
  };


  const fetchData = async () => {
    let query = supabase.from("reciept1").select("*");

    if (formatImporter) {
      query = query.eq("format_importer", formatImporter);
    }
    if (startDate) {
      query = query.gte("order_date", startDate);
    }

    if (endDate) {
      query = query.lte("order_date", endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching data:", error);
    } else {
      console.log("recipt-----------",data)
      setData(data);
    }
  };

  console.log("data", data)
  // console.log("formatImporter",formatImporter)
  const fetchHandlingData = async () => {
    let query = supabase.from("handling_and_storage").select("*");
    if (formatImporter) {
      query = query.eq("format_importer", formatImporter);
    }
    if (startDate && endDate) {
      query = query.gte("order_date", startDate).lte("order_date", endDate);
    }
    const { data, error } = await query;
    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setHandlingData(data);
    }
  };

  const fetchRemovalData = async () => {
    let query = supabase.from("removal").select("*");
    if (formatImporter) {
      query = query.eq("format_importer", formatImporter);
    }
    if (startDate && endDate) {
      query = query.gte("order_date", startDate).lte("order_date", endDate);
    }
    const { data, error } = await query;
    if (error) {
      console.error("Error fetching data:", error);
    } else {
      console.log("removal-----------",data)
      setRemovalData(data);
    }
  };

  console.log("Handling Data:", handlingData);
  console.log("Removal Data:", removalData);

  const fetchClientDetails = async () => {
    try {
      const { data, error } = await supabase.from("client_details").select("*");

      if (error) {
        console.error("Error fetching client details:", error);
        return;
      }

      // Find the client whose client_name matches the selected format_importer
      const client = data.find(client => client.client_name === formatImporter);

      if (client) {
        // Format the date range
        let dateRangeString = '';
        
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          
          dateRangeString = `${start.toLocaleDateString()} to ${end.toLocaleDateString()}`;
        } else if (startDate) {
          dateRangeString = `from ${new Date(startDate).toLocaleDateString()}`;
        } else if (endDate) {
          dateRangeString = `to ${new Date(endDate).toLocaleDateString()}`;
        }
      
        // Format the required fields
        const formattedString = `F. No. ${client.file_no} / BOND DT. ${client.file_date} / WAREHOUSE CODE: ${client.warehouse_code} - ${client.client_name}, Unit: ${client.address}${dateRangeString ? ` (${dateRangeString})` : ''}`;
      
        console.log("Formatted String:", formattedString);
        return formattedString;
      } else {
        console.log("No matching client found for format_importer:", formatImporter);
        return "";
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const fetchBalanceData = async () => {
    const today = new Date();
  const elevenMonthsAgo = new Date(today.setMonth(today.getMonth() - 11));

  // Fetch all relevant tables
  const [
    { data: balanceData, error: balanceError },
    { data: receiptData, error: receiptError },
    { data: removalData, error: removalError },
  ] = await Promise.all([
    supabase.from('balance_and_extensions').select('*'),
    supabase.from('reciept1').select('*'),
    supabase.from('removal').select('*'),
  ]);

  if (balanceError || receiptError || removalError) {
    console.error('Error fetching data:', { balanceError, receiptError, removalError });
    return;
  }

  // Step 1: Filter receipt1 - must be 'Non 65' and order_date older than 11 months
  const validReceiptBOEs = receiptData
    .filter(row => row.activity === 'Non 65')
    .filter(row => new Date(row.order_date) <= elevenMonthsAgo)
    .map(row => ({
      boe: Number(row.bill_of_entry_number),
      importer: row.format_importer,
    }));

  // Step 2: Filter removal - balance_quantity must be > 0
  const validRemovalBOEs = removalData
    .filter(row => parseFloat(row.balance_quantity) > 0)
    .map(row => ({
      boe: Number(row.bill_of_entry_number),
      importer: row.format_importer,
    }));

  // Step 3: Get only matching importer + BOE combinations in both
  const validBOEKeys = validReceiptBOEs
    .filter(receipt =>
      validRemovalBOEs.some(removal =>
        removal.boe === receipt.boe &&
        removal.importer === receipt.importer
      )
    )
    .map(item => `${item.importer}__${item.boe}`);

  // Step 4: Apply this filter to balanceData
  let filtered = balanceData.filter(row =>
    validBOEKeys.includes(`${row.format_importer}__${Number(row.bill_of_entry_number)}`)
  );

  // Step 5: Further filter based on user search input (if any)
  if (formatImporter) {
    filtered = filtered.filter(row => row.format_importer === formatImporter);
  }

  if (startDate && endDate) {
    filtered = filtered.filter(row =>
      new Date(row.order_date) >= new Date(startDate) &&
      new Date(row.order_date) <= new Date(endDate)
    );
  }

  setBalanceData(filtered); 
    // let query = supabase.from("balance_and_extensions").select("*");
  
    // if (formatImporter) {
    //   query = query.eq("format_importer", formatImporter);
    // }
  
    // if (startDate && endDate) {
    //   query = query.gte("order_date", startDate).lte("order_date", endDate);
    // }
  
    // const { data, error } = await query;
    // if (error) {
    //   console.error("Error fetching balance data:", error);
    // } else {
    //   setBalanceData(data); // or use this to generate PDF directly
    // }
  };
  
  console.log("Balance Data:", balanceData);

  const generatePDF = async () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const clientInfo = await fetchClientDetails();
    const tableBody = balanceData.length > 0
  ? balanceData.map(row => [
      `${row.bill_of_entry_number || "N/A"} (${row.bill_of_entry_date || "N/A"})`,
      `${row.bond_no || "N/A"} (${row.bond_date || "N/A"})`,
      row.order_date || "N/A",

      row.invoice_no || "N/A",
      row.invoice_serial || "N/A",
      row.goods_description || "N/A",
      row.quantity || "0",

      row.initial_bonding_expiry || "N/A",
      row.extensions || "N/A",
      row.bank_guarantee || "N/A",
      row.remarks || "N/A",
    ])
  : [[
      "N/A", "N/A", "N/A", 
      "N/A", "N/A", "N/A", "N/A", 
      "N/A", "N/A", "N/A", "N/A"
    ]];

    
    // First Table (Header) page 1
    autoTable(doc, {
      startY: 10,
      head: [["FORM-A"]],
      body: [
        ["Form To Be Maintained By The Warehouse Licensee Of The Receipt, Handling, Storing And Removal Of The Warehoused Goods."],
        ["(In Term of Circular No. 25/2016-customs Dated 08.06.2016)"],
        [clientInfo || "Client information not available"],
        ["Receipts"]
      ],
      styles: { fontSize: 7, cellPadding: 3, valign: "middle", halign: "center", textColor: 0 },
      headStyles: { fillColor: [255, 255, 255], textColor: 0, fontSize: 11, fontStyle: "bold", lineWidth: 0.2, lineColor: [0, 0, 0] },
      bodyStyles: { lineWidth: 0.2, lineColor: [0, 0, 0], fillColor: [255, 255, 255], textColor: 0 },
      alternateRowStyles: { fillColor: [255, 255, 255] },

      didParseCell: function (data) {
        if (data.section === "body") {
          if (data.row.index === 0 || data.row.index === 1) {
            data.cell.styles.fontSize = 11;
          } else if (data.row.index === 2) {
            data.cell.styles.fontSize = 7;
          } else if (data.row.index === 3) {
            data.cell.styles.fontSize = 7;
            data.cell.styles.fontStyle = "bold";
          }
        }
      }
    });


    // Second Table (Data) page 1
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY,
      head: [[
        "Bill of Entry No. and Date", "Customs Section Of Import", "Bond No. & Date", "Description Of Goods",
        "Description And No. Of Packages", "Marks And Number On Package", "Unit, Weight & Quantity", "Value",
        "Duty Assessed", "Date Of Order Under Section 60(1)", "Warehouse Code And Address (In Case Of Bond To Bond Transfer)", "Registration No. Of Means of Transport", "OTL No.",
        "Quantity Advised", "Quantity Received", "Breakage/Damage", "Shortage"
      ]],
      body: [
        // Add extra row with numbers 1 to 17
        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17"],
        // Actual data rows
        ...data.map(row => [
          ` ${row.bill_of_entry_number} ${row.bill_of_entry_date}`, row.customs_station, `${row.bond_no} ${row.bond_date}`, row.goods_description,
          row.packages_description, row.marks_numbers, `${row.weight}, ${row.unit}, ${row.quantity} Qty`,
          row.value_inr, row.duty_assessed, row.order_date, row.warehouse_code_address,
          row.transport_registration, row.otl_no, row.quantity_adviced,
          row.quantity_received, row.breakage_damage, row.shortage
        ])
      ],
      styles: { fontSize: 6, cellPadding: 1, valign: "middle", halign: "center", textColor: 0 },
      headStyles: { fillColor: [255, 255, 255], textColor: 0, fontSize: 6, lineWidth: 0.2, lineColor: [0, 0, 0] },
      bodyStyles: { fillColor: [255, 255, 255], textColor: 0, lineWidth: 0.2, lineColor: [0, 0, 0] },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      // columnStyles: {  // Ensures columns maintain their width
      //   0: { cellWidth: 30 }, 1: { cellWidth: 20 }, 2: { cellWidth: 30 }, 3: { cellWidth: 40 },
      //   4: { cellWidth: 30 }, 5: { cellWidth: 25 }, 6: { cellWidth: 30 }, 7: { cellWidth: 25 },
      //   8: { cellWidth: 25 }, 9: { cellWidth: 25 }, 10: { cellWidth: 40 }, 11: { cellWidth: 25 },
      //   12: { cellWidth: 20 }, 13: { cellWidth: 20 }, 14: { cellWidth: 20 }, 15: { cellWidth: 20 },
      //   16: { cellWidth: 20 }
      // }
    });

    doc.addPage();

      // First Table (Data) page 2
    autoTable(doc, {
      startY: 10,
      head: [["FORM-A"]],
      body: [
        ["Form To Be Maintained By The Warehouse Licensee Of The Receipt, Handling, Storing And Removal Of The Warehoused Goods."],
        ["(In Term of Circular No. 25/2016-customs Dated 08.06.2016)"],
        [clientInfo || "Client information not available"],
      ],
      styles: { fontSize: 7, cellPadding: 3, valign: "middle", halign: "center", textColor: 0 },
      headStyles: { fillColor: [255, 255, 255], textColor: 0, fontSize: 11, fontStyle: "bold", lineWidth: 0.2, lineColor: [0, 0, 0] },
      bodyStyles: { lineWidth: 0.2, lineColor: [0, 0, 0], fillColor: [255, 255, 255], textColor: 0 },
      alternateRowStyles: { fillColor: [255, 255, 255] },

      didParseCell: function (data) {
        if (data.section === "body") {
          if (data.row.index === 0 || data.row.index === 1) {
            data.cell.styles.fontSize = 11;
          } else if (data.row.index === 2) {
            data.cell.styles.fontSize = 7;
          } else if (data.row.index === 3) {
            data.cell.styles.fontSize = 11;
            data.cell.styles.fontStyle = "bold";
          }
        }
      }
    });

    const maxRows = Math.max(handlingData.length, removalData.length);
    const removalMap = new Map();
    removalData.forEach(row => {
      removalMap.set(row.bill_of_entry_no, row);
    });
    
     // Second Table (Data) page 2
  
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY,
      head: [[
        { content: "Handling And Storage", colSpan: 6, styles: { halign: "center", fontStyle: "bold" } },
        { content: "Removal", colSpan: 9, styles: { halign: "center", fontStyle: "bold" } }
      ], [
        "Sample Drawn By Govt Agencies", "Activities Under Section 65", "Date Of Expiry Of Initial Bonding",
        "Period Extended Upto", "Details Of Bank Guarantee", "Relinquishment", "Date And Time Of Removal",
        "Purpose Of Removal", "Ey-BOnd Bill 0f Enlry No. ard date/ Shipping 8iI x  . and date", "Quantity Cleared", "Value (INR)", "Duty (INR)", "Interest", "Balance Quantity", "Remarks",
      ]],
      body: [
        ["18", "19", "20", "21", "22", "23", "24", "25", "25A", "26", "27", "28", "29", "30", "31"], // Number row
        ...Array.from({ length: maxRows }, (_, index) => [
          handlingData[index]?.sample_drawn_by_government_agencies || "NILL",
          handlingData[index]?.activities_under_section_65 || "NILL",
          handlingData[index]?.expiry_of_initial_bonding_period || "NILL",
          handlingData[index]?.period_extended_upto || "NILL",
          handlingData[index]?.bank_guarantee_details || "NILL",
          handlingData[index]?.relinquishment || "NILL",

          removalData[index]?.date_and_time_of_removal || "NILL",
          removalData[index]?.purpose_of_removal || "NILL",
          // "25A" - Merging bill_of_entry_no and bill_of_entry_date
          `${removalData[index]?.bill_of_entry_no || "NILL"} (${removalData[index]?.bill_of_entry_date || "NILL"})`,
          removalData[index]?.quantity_cleared || "0",
          removalData[index]?.value || "0",
          removalData[index]?.duty || "0",
          removalData[index]?.interest || "0",
          removalData[index]?.balance_quantity || "0",
          removalData[index]?.remarks || "NILL",
        ])
      ],

      styles: { fontSize: 6, cellPadding: 2, valign: "middle", halign: "center", textColor: 0 },
      headStyles: { fillColor: [255, 255, 255], textColor: 0, fontSize: 6, fontStyle: "bold", lineWidth: 0.2, lineColor: [0, 0, 0] },
      bodyStyles: { lineWidth: 0.2, lineColor: [0, 0, 0], fillColor: [255, 255, 255], textColor: 0 },
      alternateRowStyles: { fillColor: [255, 255, 255] },
    });

    doc.addPage();

      // First Table (Data) page 3

    autoTable(doc, {
      startY: 10,
      head: [["FORM-B"]],
      body: [
        ["(see Para3 Of Circular No.25/2016-customs Dated 08.06.2016)"],
        ["Details of goods stored in the warehouse where the period for which they may remain warehoused under section 61 is expiring in the following Month."],
        [clientInfo || "Client information not available"],
      ],
      styles: { fontSize: 7, cellPadding: 3, valign: "middle", halign: "center", textColor: 0 },
      headStyles: { fillColor: [255, 255, 255], textColor: 0, fontSize: 11, fontStyle: "bold", lineWidth: 0.2, lineColor: [0, 0, 0] },
      bodyStyles: { lineWidth: 0.2, lineColor: [0, 0, 0], fillColor: [255, 255, 255], textColor: 0 },
      alternateRowStyles: { fillColor: [255, 255, 255] },

      didParseCell: function (data) {
        if (data.section === "body") {
          if (data.row.index === 0 || data.row.index === 1) {
            data.cell.styles.fontSize = 11;
          } else if (data.row.index === 2) {
            data.cell.styles.fontSize = 7;
          } else if (data.row.index === 3) {
            data.cell.styles.fontSize = 11;
            data.cell.styles.fontStyle = "bold";
          }
        }
      }
    });

    // Second Table (Data) page 3
 
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY,
      head: [
        [
          { content: "Bill of Entry No. & Date", rowSpan: 2, styles: { halign: "center" } },
          { content: "Bond No. & Date", rowSpan: 2, styles: { halign: "center" } },
          { content: "Order Date", rowSpan: 2, styles: { halign: "center" } },
    
          { content: "Balance goods in the warehouse", colSpan: 4, styles: { halign: "center" } },
    
          { content: "Date Of Expiry Of Initial Bonding Period", rowSpan: 2, styles: { halign: "center" } },
          { content: "Extensions (Period Extended Upto)", rowSpan: 2, styles: { halign: "center" } },
          { content: "Bank Guarantee", rowSpan: 2, styles: { halign: "center" } },
          { content: "Remarks", rowSpan: 2, styles: { halign: "center" } },
        ],
        [
          { content: "Invoice No.", styles: { halign: "center" } },
          { content: "Sl No.", styles: { halign: "center" } },
          { content: "Description of Goods", styles: { halign: "center" } },
          { content: "Quantity", styles: { halign: "center" } },
        ],
      ],
    
      body: tableBody,
    
      styles: { fontSize: 6, cellPadding: 2, valign: "middle", halign: "center", textColor: 0 },
      headStyles: { fillColor: [255, 255, 255], textColor: 0, fontSize: 6, fontStyle: "bold", lineWidth: 0.2, lineColor: [0, 0, 0] },
      bodyStyles: { lineWidth: 0.2, lineColor: [0, 0, 0], fillColor: [255, 255, 255], textColor: 0 },
      alternateRowStyles: { fillColor: [255, 255, 255] },
    });
    

    doc.save("FORM_A.pdf");
    setFormatImporter("");
    setStartDate("");
    setEndDate("");
  };


  return (
    <Box sx={{ p: 2, overflowX: "auto" }}> 
      <Typography variant="h5" sx={{ color: "#2C3E50", fontWeight: 'bold', marginBottom: 2 }}> MTR </Typography>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={3} alignItems="center" sx={{ marginBottom: 2 }}>
        
        <Grid item xs={12} sm={6} md={4}>
          <FormControl sx={{ width: "auto" }}>
            <InputLabel>Importer Name</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={formatImporter}
              label="Importer Name"
              onChange={(e) => setFormatImporter(e.target.value)}
              MenuProps={{
                PaperProps: {
                  sx: { width: isMobile ? 300 : 450 },
                },
              }}
              sx={{ width: isMobile ? 300 : 450 }}
            >
              {importers.map((importer, index) => (
                <MenuItem key={index} value={importer} sx={{ width: "100%" }}>
                  {importer}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <DatePicker
            label="Start Date"
            value={startDate ? dayjs(startDate) : null} // Convert to dayjs
            onChange={(newValue) => setStartDate(newValue ? newValue.format("YYYY-MM-DD") : "")} 
            format="YYYY-MM-DD"
            sx={{ width: isMobile ? 300 : 450 }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <DatePicker
            label="End Date"
            value={endDate ? dayjs(endDate) : null} 
            onChange={(newValue) => setEndDate(newValue ? newValue.format("YYYY-MM-DD") : "")}
            format="YYYY-MM-DD"
            sx={{ width: isMobile ? 300 : 450 }}
          />
        </Grid>

      </Grid>
    </LocalizationProvider>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center", // Centers horizontally
          pt: { xs: "5%", md: "2%" }, // Responsive padding top (5% on mobile, 2% on larger screens)
        }}
      >
        <Tooltip title={!formatImporter ? "Select Format Importer" : ""}>
          <span> {/* Required for Tooltip to work on a disabled button */}
            <Button
              variant="contained"
              color="primary"
              disabled={!formatImporter}
              onClick={generatePDF}
            >
              Download PDF
            </Button>
          </span>
        </Tooltip>
      </Box>
    </Box>

  );
};

export default MTR_Information;


      {/* <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
            <TableCell>Order Date</TableCell>
            <TableCell>Formate Importer</TableCell>
              <TableCell>Bill of Entry No.</TableCell>
              <TableCell>Customs Section</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Quantity</TableCell>
           
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                 <TableCell>{row.order_date}</TableCell>
                 <TableCell>{row.format_importer}</TableCell>
                <TableCell>{row.bill_of_entry_number}</TableCell>
                <TableCell>{row.customs_station}</TableCell>
                <TableCell>{row.goods_description}</TableCell>
                <TableCell>{row.quantity}</TableCell>
               
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer> */}

      {/* <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
      <Table>
        <TableHead sx={{ backgroundColor: "#1F618D" }}>
          <TableRow>
            {["Bill of Entry No. & Date", "Customs Section", "Bond No. & Date", "Goods Description",
              "Packages Description", "Marks & Numbers", "Unit, Weight & Quantity", "Value (INR)",
              "Duty Assessed (INR)", "Order Date", "Warehouse Code & Address", "Transport Reg. No.", "OTL No.",
              "Quantity Advised", "Quantity Received", "Breakage/Damage", "Shortage"].map((header, index) => (
              <TableCell key={index} sx={{ color: "white", fontWeight: "bold", border: "1px solid black" }}>
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              {[row.bill_of_entry_number, row.customs_station, row.bond_no, row.goods_description,
                row.packages_description, row.marks_numbers, `${row.weight} ${row.unit}, ${row.quantity} Qty`,
                row.value_inr, row.duty_assessed, row.order_date, row.warehouse_code_address,
                row.transport_registration, row.otl_no, row.quantity_adviced,
                row.quantity_received, row.breakage_damage, row.shortage].map((cell, cellIndex) => (
                <TableCell key={cellIndex} sx={{ color: "black", border: "1px solid black" }}>
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>  */}