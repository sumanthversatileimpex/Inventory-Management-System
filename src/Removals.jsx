import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, TextField, Snackbar, Alert, Box, Typography, MenuItem, Select
} from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';

const columns = [
  { id: "date_and_time_of_removal", label: "Date and Time of Removal", type: "datetime-local", placeholder: "Select date & time" },
  { id: "purpose_of_removal", label: "Purpose of Removal", type: "text", placeholder: "Enter purpose" },
  { id: "bill_of_entry_no", label: "Shipping Bill of Entry No.", type: "text", placeholder: "Enter entry no." },
  { id: "bill_of_entry_date", label: "Shipping Bill of Entry Date", type: "date", placeholder: "Select entry date" },
  { id: "quantity_cleared", label: "Quantity Cleared", type: "number", placeholder: "Enter cleared qty", rules: { min: 1 } },
  { id: "value", label: "Value", type: "number", width: 100, placeholder: "Enter value" },
  { id: "duty", label: "Duty", type: "number", width: 100, placeholder: "Enter duty" },
  { id: "interest", label: "Interest", type: "number", width: 100, placeholder: "Enter interest" },
  { id: "balance_quantity", label: "Balance Quantity", type: "number", placeholder: "Enter balance qty", disabled: true, rules: { min: 0 } },
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

  const fetchBillEntries = async () => {
    const { data, error } = await supabase.from('reciept1').select('format_importer,bill_of_entry_number, invoice_no, invoice_serial,order_date,quantity_received');
    if (error) {
      console.error("Error fetching bill entries:", error);
    } else {
      const formattedEntries = data.map(entry => entry.bill_of_entry_number);
      const invoiceData = {};
      const serialData = {};
      const formateImporterData = {};
      const orderData = {};
      const quantityData = {};
      data.forEach(entry => {
        formateImporterData[entry.bill_of_entry_number] = entry.format_importer;
        invoiceData[entry.bill_of_entry_number] = entry.invoice_no;
        serialData[entry.bill_of_entry_number] = entry.invoice_serial ? entry.invoice_serial.split(',') : [];
        orderData[entry.bill_of_entry_number] = entry.order_date;
        quantityData[`${entry.bill_of_entry_number}_${entry.invoice_no}_${entry.invoice_serial}`] = entry.quantity_received;
      });
      setBillEntries(formattedEntries);
      setFormatImporter(formateImporterData);
      setInvoiceNumbers(invoiceData);
      setInvoiceSerials(serialData);
      setorderDateData(orderData);
      setQuantityReceived(quantityData);
    }
  };
  // console.log("FormatImporter",formatImporter)
  // console.log("Order Date Data:", orderDateData);

  useEffect(() => {
    fetchBillEntries();
  }, []);

  // useEffect(() => {
  //   console.log("Fetched Bill Entries:", billEntries);
  //   console.log("Format Importer Data:", formatImporter);
  // }, [billEntries, formatImporter]);
  // console.log("quantityReceived", quantityReceived);

  const handleInputChange = (id, columnId, value) => {
    setData(prevData =>
      prevData.map(row => (row.id === id ? { ...row, [columnId]: value } : row))
    );
  };

  const handleBillOfEntryChange = (id, value) => {
    console.log("Selected Bill of Entry:", value);
    console.log("Mapped Format Importer:", formatImporter[value]);
    console.log("Mapped Invoice Number:", invoiceNumbers[value]);
    console.log("Mapped Order Date:", orderDateData[value]);

    // Ensure invoice_serial is properly handled (since it's an array)
    const invoiceSerialKey = Array.isArray(invoiceSerials[value]) ? invoiceSerials[value].join(",") : invoiceSerials[value];

    // Compute balance_quantity based on stored data
    const balanceQuantity = quantityReceived[`${value}_${invoiceNumbers[value]}_${invoiceSerialKey}`] || 0;

    console.log("Computed Balance Quantity:", balanceQuantity);

    setData(prevData =>
      prevData.map(row =>
        row.id === id
          ? {
            ...row,
            bill_of_entry_number: value,
            invoice_no: invoiceNumbers[value] || '',
            invoice_serial: [],
            format_importer: formatImporter[value] || '',
            order_date: orderDateData[value] || null,
            balance_quantity: balanceQuantity,
          }
          : row
      )
    );
  };

// Function to update quantity_cleared and dynamically update balance_quantity
const handleQuantityClearedChange = (id, value) => {
  setData(prevData =>
    prevData.map(row => {
      if (row.id === id) {
        if (value === "") {
          // If input is cleared, fetch latest balance from DB
          resetBalanceQuantity(row.id, row.bill_of_entry_number, row.invoice_no, row.invoice_serial);
          return { ...row, quantity_cleared: "", balance_quantity: row.balance_quantity };
        }

        // Subtract from the last known balance
        const newBalance = (row.latest_balance || row.balance_quantity || 0) - Number(value);
        return { ...row, quantity_cleared: value, balance_quantity: Math.max(newBalance, 0) };
      }
      return row;
    })
  );
};

// Function to fetch the latest balance_quantity from DB and reset it
const resetBalanceQuantity = async (id, billEntry, invoiceNo, invoiceSerial) => {
  const latestBalance = await fetchLatestBalanceQuantity(billEntry, invoiceNo, invoiceSerial);

  if (latestBalance !== null) {
    setData(prevData =>
      prevData.map(row =>
        row.id === id
          ? { ...row, balance_quantity: latestBalance, quantity_cleared: "" }
          : row
      )
    );
  }
};

// Function to fetch latest balance_quantity from Supabase
const fetchLatestBalanceQuantity = async (billEntry, invoiceNo, invoiceSerial) => {
  const { data, error } = await supabase
    .from("removal")
    .select("balance_quantity")
    .eq("bill_of_entry_number", billEntry)
    .eq("invoice_no", invoiceNo)
    .eq("invoice_serial", invoiceSerial)
    .order("id", { ascending: false }) // Fetch the latest entry
    .limit(1);

  if (error) {
    console.error("Error fetching latest balance quantity:", error);
    return null;
  }
  console.log("Latest Balance Quantity:", data);
  return data.length > 0 ? data[0].balance_quantity : null;
};


  const handleInvoiceSerialChange = (id, value) => {
    setData(prevData =>
      prevData.map(row => (row.id === id ? { ...row, invoice_serial: value } : row))
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
      row.bill_of_entry_number && row.invoice_no && row.invoice_serial && row.format_importer &&
      columns.every(col => row[col.id])
    );
    console.log("isValid data", data)
    if (!isValid) {
      setSnackbarMessage('Please fill all fields before submitting!');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    // const { error } = await supabase.from("removal").insert(
    //   data.map(({ id, ...row }) => row)
    // );

    const { error } = await supabase.from("removal").insert(
      data.map(({ id, ...row }) => row)
    );

    if (error) {
      setSnackbarMessage("Submission failed!");
      setSnackbarSeverity("error");
    } else {
      setSnackbarMessage("Data submitted successfully!");
      setSnackbarSeverity("success");
      setData([{ id: Date.now() }]);
    }
    setOpenSnackbar(true);
  };

  return (
    <Paper sx={{ width: "100%", padding: 2, overflowX: "auto" }}>
      <Box sx={{ textAlign: "center", marginBottom: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1F618D" }}>
          Removals
        </Typography>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
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
            {data.map(row => (
              <TableRow key={row.id}>
                {/* Bill of Entry Dropdown */}
                <TableCell>
                  <Select
                    value={row.bill_of_entry_number || ""}
                    onChange={(e) => handleBillOfEntryChange(row.id, e.target.value)}
                    fullWidth
                    sx={{ width: 150 }}
                  >
                    {billEntries.map(entry => (
                      <MenuItem key={entry} value={entry}>{entry}</MenuItem>
                    ))}
                  </Select>
                </TableCell>

                {/* Invoice Number (Auto-filled, Read-only) */}
                <TableCell>
                  <TextField
                    variant="outlined"
                    fullWidth
                    sx={{ width: 200 }}
                    size="small"
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
          onChange={async (e, newValue) => {
            handleInvoiceSerialChange(row.id, newValue);

            // Fetch balance quantity when invoice serial changes
            const latestBalance = await fetchLatestBalanceQuantity(
              row.bill_of_entry_number,
              row.invoice_no,
              newValue
            );

            setData(prevData =>
              prevData.map(r =>
                r.id === row.id ? { ...r, balance_quantity: latestBalance || 0 } : r
              )
            );
          }}
          renderInput={(params) => <TextField {...params} variant="outlined" size="small" />}
        />
      </TableCell>

                {/* Other Data Fields */}
                {columns.map(column => (
                  <TableCell key={column.id}>
                    {column.id === "quantity_cleared" ? (
                      <TextField
                        type="number"
                        value={row.quantity_cleared || ""}
                        onChange={(e) => handleQuantityClearedChange(row.id, e.target.value)}
                        placeholder={column.placeholder}
                        fullWidth
                        sx={{ minWidth: 150 }}
                      />
                    ) : column.id === "balance_quantity" ? (
                      <TextField
                        type="number"
                        value={row.balance_quantity || ""}
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

                <TableCell>
                  <Button onClick={() => deleteRow(row.id)} color="error" variant="contained">Delete</Button>
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
