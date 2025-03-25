import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "./lib/supabaseClient";
import {  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, MenuItem, Select, FormControl, InputLabel, Grid } from "@mui/material";
import { useMediaQuery } from "@mui/material";


const MTR_Information = () => {
  const [data, setData] = useState([]);
  const [formatImporter, setFormatImporter] = useState("");
  const [handlingData, setHandlingData] = useState([]);
  const [removalData, setRemovalData] = useState([]);
  const [importers, setImporters] = useState([]);
  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    fetchImporters();
    fetchData();
    fetchHandlingData();
    fetchRemovalData();
  }, [formatImporter]);

  const fetchImporters = async () => {
    const { data, error } = await supabase.from("reciept1").select("format_importer");
    if (error) {
      console.error("Error fetching importers:", error);
    } else {
      const uniqueImporters = [...new Set(data.map(d => d.format_importer))]; // Remove duplicates
      setImporters(uniqueImporters);
    }
  };
  

  const fetchData = async () => {
    let query = supabase.from("reciept1").select("*");
    if (formatImporter) {
      query = query.eq("format_importer", formatImporter);
    }
    const { data, error } = await query;
    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setData(data);
    }
  };
  // console.log("formatImporter",formatImporter)
  const fetchHandlingData = async () => {
    let query = supabase.from("handling_and_storage").select("*");
    if (formatImporter) {
      query = query.eq("format_importer", formatImporter);
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
    const { data, error } = await query;
    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setRemovalData(data);
    }
  };

//   console.log("Handling Data:", handlingData);
// console.log("Removal Data:", removalData);


  const generatePDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  
    // First Table (Header) page 1
    autoTable(doc, {
      startY: 10,
      head: [["FORM-A"]],
      body: [
        ["Form To Be Maintained By The Warehouse Licensee Of The Receipt, Handling, Storing And Removal Of The Warehoused Goods."],
        ["(In Term of Circular No. 25/2016-customs Dated 08.06.2016)"],
        ["F. No. CUS/BDWH/W58/119/2024/BOND DT.17/04/2024/ PERMANENT CODE : BOM1R085-SARA ENTERPRISES, Unit: Godown No. D26 & D27, Ground Floor, Neo Logistics Park, Usatane Village, Taloja-Ambarnath Road, Dist-Thane, Maharashtra-421506 (September-2024)"],
        ["Receipts"]
      ],
      styles: { fontSize: 7, cellPadding: 3, valign: "middle", halign: "center", textColor: 0 },
      headStyles: { fillColor: [255, 255, 255], textColor: 0, fontSize: 11, fontStyle: "bold", lineWidth: 0.2, lineColor: [0, 0, 0] },
      bodyStyles: { lineWidth: 0.2, lineColor: [0, 0, 0], fillColor: [255, 255, 255], textColor: 0 },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      
      didParseCell: function (data) {
        if (data.section === "body") {
          if (data.row.index === 0 || data.row.index === 1) {
            data.cell.styles.fontSize = 11; // First two rows with font size 11
          } else if (data.row.index === 2) {
            data.cell.styles.fontSize = 7; // Third row with font size 7
          } else if (data.row.index === 3) {
            data.cell.styles.fontSize = 11;
            data.cell.styles.fontStyle = "bold"; // Last row "Receipts" bold with font size 11
          }
        }
      }
    });
    
  
    // Second Table (Data) page 1
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY, // No extra space added
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
         ` ${row.bill_of_entry_number} ${row.bill_of_entry_date}`, row.customs_station,`${row.bond_no} ${row.bond_date}`, row.goods_description,
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

        autoTable(doc, {
      startY: 10,
      head: [["FORM-A"]],
      body: [
        ["Form To Be Maintained By The Warehouse Licensee Of The Receipt, Handling, Storing And Removal Of The Warehoused Goods."],
        ["(In Term of Circular No. 25/2016-customs Dated 08.06.2016)"],
        ["F. No. CUS/BDWH/W58/119/2024/BOND DT.17/04/2024/ PERMANENT CODE : BOM1R085-SARA ENTERPRISES, Unit: Godown No. D26 & D27, Ground Floor, Neo Logistics Park, Usatane Village, Taloja-Ambarnath Road, Dist-Thane, Maharashtra-421506 (September-2024)"],
      ],
      styles: { fontSize: 7, cellPadding: 3, valign: "middle", halign: "center", textColor: 0 },
      headStyles: { fillColor: [255, 255, 255], textColor: 0, fontSize: 11, fontStyle: "bold", lineWidth: 0.2, lineColor: [0, 0, 0] },
      bodyStyles: { lineWidth: 0.2, lineColor: [0, 0, 0], fillColor: [255, 255, 255], textColor: 0 },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      
      didParseCell: function (data) {
        if (data.section === "body") {
          if (data.row.index === 0 || data.row.index === 1) {
            data.cell.styles.fontSize = 11; // First two rows with font size 11
          } else if (data.row.index === 2) {
            data.cell.styles.fontSize = 7; // Third row with font size 7
          } else if (data.row.index === 3) {
            data.cell.styles.fontSize = 11;
            data.cell.styles.fontStyle = "bold"; // Last row "Receipts" bold with font size 11
          }
        }
      }
    });
    
  
    // Second Table (Data) page 1
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 5,
      head: [[
        { content: "Handling And Storage", colSpan: 7, styles: { halign: "center", fontStyle: "bold" } },
        { content: "Removal", colSpan: 7, styles: { halign: "center", fontStyle: "bold" } }
      ], [
        "Sample Drawn By Govt Agencies", "Activities Under Section 65", "Date Of Expiry Of Initial Bonding", 
        "Period Extended Upto", "Details Of Bank Guarantee", "Relinquishment", "Date And Time Of Removal",
        "Purpose Of Removal", "Quantity Cleared", "Value (INR)", "Duty (INR)", "Interest", "Balance Quantity", "Remarks"
      ]],
      body: [
        // Number row (18-31)
        ["18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"],
        // Data row (assuming values are Nil for now)
        ["Nil", "Nil", "Nil", "Nil", "Nil", "Nil", "Nil", "Nil", "Nil", "Nil", "Nil", "Nil", "Nil", "Nil"]
      ],
      styles: { fontSize: 6, cellPadding: 2, valign: "middle", halign: "center", textColor: 0 },
      headStyles: { fillColor: [255, 255, 255], textColor: 0, fontSize: 6, fontStyle: "bold", lineWidth: 0.2, lineColor: [0, 0, 0] },
      bodyStyles: { lineWidth: 0.2, lineColor: [0, 0, 0], fillColor: [255, 255, 255], textColor: 0 },
      alternateRowStyles: { fillColor: [255, 255, 255] },
    });
    doc.save("FORM_A.pdf");
  };
  

  return (
    <div>
    <h2 style={{ color: "#FDFAF6" }}>MTR Information</h2>

    <Grid container spacing={1} alignItems="center" sx={{ marginBottom: 2 }}>
  <Grid item xs={12} sm={6} md={4}>
    <FormControl sx={{ width: "auto" }}>
      <InputLabel>Format Importer Name</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={formatImporter}
        label="Format Importer Name"
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
  <Grid item xs="auto" sx={{ marginLeft: 1 }}>
    <Button
      variant="contained"
      sx={{ backgroundColor: "#1F618D", color: "white", height: "40px" }}
      onClick={generatePDF}
    >
      Download PDF
    </Button>
  </Grid>
</Grid>


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
    </TableContainer> */}
  </div>
  
  );
};

export default MTR_Information;