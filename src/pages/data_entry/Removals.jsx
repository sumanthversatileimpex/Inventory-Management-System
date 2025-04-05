import React, { useState, useEffect } from "react";
import { supabase } from "../../context/supabaseClient";
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, TextField, Snackbar, Alert, Box, Typography, MenuItem, Select
} from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';

const columns = [
  { id: "date_and_time_of_removal", label: "Date and Time of Removal", type: "datetime-local", placeholder: "Select date & time" },
  { id: "purpose_of_removal", label: "Purpose of Removal", type: "text", placeholder: "Enter purpose" },
  { id: "bill_of_entry_no", label: "Shipping Bill No.", type: "text", placeholder: "Enter entry no." },
  { id: "bill_of_entry_date", label: "Shipping Bill Date", type: "date", placeholder: "Select entry date" },
  { id: "quantity_cleared", label: "Quantity Cleared", type: "number", placeholder: "Enter cleared qty", },
  { id: "value", label: "Value", type: "number", width: 100, placeholder: "Enter value" },
  { id: "duty", label: "Duty", type: "number", width: 100, placeholder: "Enter duty" },
  { id: "interest", label: "Interest", type: "number", width: 100, placeholder: "Enter interest" },
  { id: "balance_quantity", label: "Balance Quantity", type: "number", placeholder: "Enter balance qty", disabled: true, },
  { id: "remarks", label: "Remarks", type: "text", placeholder: "Enter remarks" },
];


const Removals = () => {
  const [data, setData] = useState([{ id: Date.now() }]);
  const [billEntries, setBillEntries] = useState([]); // Store available Bill of Entry Numbers
  const [invoiceNumbers, setInvoiceNumbers] = useState({}); // Store Invoice Numbers
  const [invoiceSerials, setInvoiceSerials] = useState({}); // Store Invoice Serials
  const [formatImporter, setFormatImporter] = useState({});
  const [orderDateData, setorderDateData] = useState(null);
  const [quantityReceived, setQuantityReceived] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [formatToBillEntries, setFormatToBillEntries] = useState({});

  const fetchRemovalData = async () => {
    const { data, error } = await supabase
      .from("removal")
      .select("bill_of_entry_number, invoice_no, invoice_serial, balance_quantity, format_importer, order_date, date_and_time_of_removal, purpose_of_removal, bill_of_entry_no, bill_of_entry_date, quantity_cleared, value, duty, interest, remarks"); // Removed original_balance_quantity

    if (error) {
      console.error("❌ Error fetching removal data:", error);
      return;
    }

    console.log("✅ Fetched Removal Data:", data);
  };

  fetchRemovalData();



  const fetchBillEntries = async () => {
    const { data, error } = await supabase
      .from('reciept1')
      .select('format_importer, bill_of_entry_number, invoice_no, invoice_serial, order_date, quantity_received');

    if (error) {
      console.error("Error fetching bill entries:", error);
      return;
    }

    const uniqueEntries = new Set();
    const invoiceData = {};
    const serialData = {};
    const formatImporterData = {};
    const orderData = {};
    const quantityData = {};
    const formatToBillEntries = {};

    data.forEach(entry => {
      const format = entry.format_importer;
      const boe = entry.bill_of_entry_number;

      if (format && boe) {
        // Format → Bill Mapping
        if (!formatToBillEntries[format]) {
          formatToBillEntries[format] = new Set();
        }
        formatToBillEntries[format].add(boe);

        // Store other mappings as before...
        formatImporterData[boe] = format;
        invoiceData[boe] = entry.invoice_no;
        orderData[boe] = entry.order_date;

        if (!serialData[boe]) serialData[boe] = [];
        if (entry.invoice_serial) {
          serialData[boe].push(...entry.invoice_serial.split(','));
        }

        const key = `${boe}_${entry.invoice_no}_${entry.invoice_serial}`;
        quantityData[key] = entry.quantity_received || 0;
      }
    });

    Object.keys(formatToBillEntries).forEach(format => {
      formatToBillEntries[format] = Array.from(formatToBillEntries[format]);
    });

    setFormatToBillEntries(formatToBillEntries); // new

    setBillEntries(Array.from(uniqueEntries));
    setFormatImporter(formatImporterData);
    setInvoiceNumbers(invoiceData);
    setInvoiceSerials(serialData);
    setorderDateData(orderData);
    setQuantityReceived(quantityData);
  };

  useEffect(() => {
    fetchBillEntries();
  }, []);


  // console.log("FormatImporter",formatImporter)
  // console.log("Order Date Data:", orderDateData);
  // console.log("quantityReceived", quantityReceived);
  // console.log("invoiceSerials", invoiceSerials)

  useEffect(() => {
    console.log("Fetched Bill Entries:", billEntries);
    console.log("Format Importer Data:", formatImporter);
    console.log("orderDateData", orderDateData);
  }, [billEntries, formatImporter]);
  console.log("quantityReceived", quantityReceived);

  const handleInputChange = (id, columnId, value) => {
    setData(prevData =>
      prevData.map(row => (row.id === id ? { ...row, [columnId]: value } : row))
    );
  };

  const handleFormatImporterChange = (rowId, newFormatImporter) => {
    setData(prevData =>
      prevData.map(row =>
        row.id === rowId
          ? {
            ...row,
            format_importer: newFormatImporter,
            bill_of_entry_number: "",  // reset
            invoice_no: "",
            invoice_serial: "",
            order_date: null,
            balance_quantity: ""
          }
          : row
      )
    );
  };


  const handleBillOfEntryChange = (rowId, billOfEntryNumber) => {
    // Find invoice_no from stored data
    const invoiceNo = invoiceNumbers[billOfEntryNumber] || "";
    const invoiceSerialsList = invoiceSerials[billOfEntryNumber] || [];
    console.log("Mapped Format Importer:", formatImporter[billOfEntryNumber]);
    console.log("Mapped Order Date:", orderDateData[billOfEntryNumber]);

    setData((prevData) =>
      prevData.map((row) =>
        row.id === rowId
          ? {
            ...row, bill_of_entry_number: billOfEntryNumber, invoice_no: invoiceNo, invoice_serial: "", balance_quantity: "", format_importer: formatImporter[billOfEntryNumber] || '',
            order_date: orderDateData[billOfEntryNumber] || null,
          }
          : row
      )
    );
    console.log("invoiceSerialsList----", invoiceSerialsList)
  };

  const handleInvoiceSerialChange = async (rowId, selectedSerial) => {
    if (Array.isArray(selectedSerial)) {
      selectedSerial = selectedSerial[0];
    }

    const row = data.find(r => r.id === rowId);
    if (!row || !row.bill_of_entry_number || !row.invoice_no || !selectedSerial) {
      console.log("❌ Missing required data:", { row, selectedSerial });
      return;
    }

    const key = `${row.bill_of_entry_number}_${row.invoice_no}_${selectedSerial}`;

    // Fetch the latest balance_quantity from removal table
    const { data: removalData, error } = await supabase
      .from("removal")
      .select("balance_quantity")
      .eq("bill_of_entry_number", row.bill_of_entry_number)
      .eq("invoice_no", row.invoice_no)
      .eq("invoice_serial", selectedSerial)
      .order("created_at", { ascending: false })
      .limit(1);

    let latestBalance = removalData?.length > 0 ? removalData[0].balance_quantity : null;

    if (latestBalance === null) {
      latestBalance = quantityReceived[key] || 0;
    }

    console.log("🔎 Searching with key:", key);
    console.log("✅ Latest Balance Quantity:", latestBalance);

    const previousRows = data.filter(r =>
      r.bill_of_entry_number === row.bill_of_entry_number &&
      r.invoice_no === row.invoice_no &&
      r.invoice_serial === selectedSerial
    );

    const totalClearedInPreviousRows = previousRows.reduce((sum, r) => sum + (r.quantity_cleared || 0), 0);
    const adjustedBalance = latestBalance - totalClearedInPreviousRows;

    console.log("🔢 Total Cleared in Previous Rows:", totalClearedInPreviousRows);
    console.log("🔄 Adjusted Balance:", adjustedBalance);

    // Update data state, ensuring initial_balance is reset
    setData(prevData =>
      prevData.map(r =>
        r.id === rowId
          ? {
            ...r,
            invoice_serial: selectedSerial,
            balance_quantity: adjustedBalance >= 0 ? adjustedBalance : 0,
            initial_balance: adjustedBalance >= 0 ? adjustedBalance : 0,
            quantity_cleared: 0
          }
          : r
      )
    );
  };


  const handleQuantityClearedChange = (rowId, value) => {
    setData(prevData =>
      prevData.map(row => {
        if (row.id === rowId) {
          const clearedQuantity = value !== "" ? parseFloat(value) : 0;
          const initialBalance = row.initial_balance ?? row.balance_quantity;

          let newBalance = initialBalance - clearedQuantity;
          if (newBalance < 0) newBalance = 0;

          console.log("newBalance", newBalance);
          console.log("value", value);

          return {
            ...row,
            quantity_cleared: clearedQuantity,
            balance_quantity: newBalance,
            initial_balance: initialBalance,
          };
        }
        return row;
      })
    );
  };



  const addRow = () => {
    setData([...data, { id: Date.now() }]);
  };

  const deleteRow = (id) => {
    if (data.length > 1) {
      setData(data.filter(row => row.id !== id));
    }
  };


  const submitData = async () => {
    const isValid = data.every(row =>
      row.bill_of_entry_number &&
      row.invoice_no &&
      row.invoice_serial &&
      row.format_importer &&
      columns.every(col => row[col.id] !== null && row[col.id] !== undefined)
    );


    console.log("Validating data:", data);

    if (!isValid) {
      setSnackbarMessage('Please fill all fields before submitting!');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const filteredData = data.map(({ initial_balance, ...rest }) => rest);

    try {
      const { error } = await supabase.from("removal").insert(filteredData);

      if (error) {
        console.error("Supabase Error:", error);
        setSnackbarMessage("Submission failed! " + error.message);
        setSnackbarSeverity("error");
      } else {
        setSnackbarMessage("Data submitted successfully!");
        setSnackbarSeverity("success");
        setData([{ id: Date.now() }]); // Reset form
      }
    } catch (err) {
      console.error("Submission Error:", err);
      setSnackbarMessage("An unexpected error occurred.");
      setSnackbarSeverity("error");
    }

    setOpenSnackbar(true);
    console.log("filteredData:", filteredData);
  };


  return (
    <Paper sx={{ width: "100%", padding: 2, overflowX: "auto" }}>
      <Box sx={{ textAlign: "center", marginBottom: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#2C3E50" }}>
          Removals
        </Typography>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#1F618D', color: '#FFFFFF' }}>Importer</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#1F618D', color: '#FFFFFF' }}>Bill of Entry Number</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#1F618D', color: '#FFFFFF' }}>Invoice No</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#1F618D', color: '#FFFFFF' }}>Invoice Serial</TableCell>
              {columns.map(column => (
                <TableCell key={column.id} sx={{ fontWeight: "bold", backgroundColor: "#1F618D", color: "#FFFFFF" }}>
                  {column.label}
                </TableCell>
              ))}
              <TableCell sx={{ backgroundColor: "#1F618D", color: "#FFFF" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>

                {/* Bill of Entry Dropdown */}
                <TableCell>
                  <Select
                    fullWidth
                    value={row.format_importer || ""}
                    onChange={(e) => handleFormatImporterChange(row.id, e.target.value)}
                    displayEmpty
                    size="small"
                  >
                    <MenuItem value="" disabled>Select Client</MenuItem>
                    {Object.keys(formatToBillEntries).map((format) => (
                      <MenuItem key={format} value={format}>
                        {format}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>

                <TableCell>
                  <Select
                    value={row.bill_of_entry_number || ""}
                    onChange={(e) => handleBillOfEntryChange(row.id, e.target.value)}
                    fullWidth
                    sx={{ width: 150 }}
                    disabled={!row.format_importer} // disable until format_importer selected
                  >
                    {(formatToBillEntries[row.format_importer] || []).map((entry) => (
                      <MenuItem key={entry} value={entry}>
                        {entry}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>


                {/* Invoice Number (Auto-filled, Read-only) */}
                <TableCell>
                  <TextField
                    variant="outlined"
                    sx={{ width: 200 }}
                    size="small"
                    fullWidth
                    value={row.invoice_no || ""}
                    disabled
                  />
                </TableCell>

                {/* Invoice Serial (Multi-Select) */}
                <TableCell>
                  <Autocomplete
                    options={invoiceSerials[row.bill_of_entry_number] || []}
                    value={row.invoice_serial || null}
                    fullWidth
                    sx={{ minWidth: 150 }}
                    onChange={(e, newValue) =>
                      handleInvoiceSerialChange(row.id, newValue)
                    }
                    renderInput={(params) => (
                      <TextField {...params} variant="outlined" size="small" />
                    )}
                  />
                </TableCell>

                {/* Other Columns with Conditional Rendering */}
                {columns.map(column => (
                  <TableCell key={column.id}>
                    {column.id === "quantity_cleared" ? (
                      <TextField
                        type="number"
                        value={row.quantity_cleared || null}
                        onChange={(e) => handleQuantityClearedChange(row.id, e.target.value)}
                        placeholder={column.placeholder}
                        fullWidth
                        sx={{ minWidth: 150 }}
                      />
                    ) : column.id === "balance_quantity" ? (
                      <TextField
                        type="number"
                        value={row.balance_quantity || 0}
                        disabled
                        fullWidth
                        sx={{ minWidth: 150 }}
                      />
                    ) : (
                      <TextField
                        variant="outlined"
                        size="small"
                        type={column.type}
                        fullWidth
                        sx={{ minWidth: 150 }}
                        placeholder={column.placeholder}
                        value={row[column.id] || ''}
                        onChange={(e) => handleInputChange(row.id, column.id, e.target.value)}
                      />
                    )}
                  </TableCell>
                ))}


                {/* Delete Button */}
                <TableCell>
                  <Button
                    onClick={() => deleteRow(row.id)}
                    color="error"
                    variant="contained"
                  >
                    Delete
                  </Button>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>

        </Table>
      </TableContainer>
      <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
        <Button onClick={addRow} color="primary" variant="contained" sx={{ mx: 1 }}>Add Row</Button>
        <Button onClick={submitData} color="success" variant="contained" sx={{ mx: 1 }}>Submit</Button>
      </Box>
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default Removals;