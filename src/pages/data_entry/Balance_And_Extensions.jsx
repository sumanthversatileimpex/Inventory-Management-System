import React, { useState, useEffect } from "react";
import { supabase } from "../../context/supabaseClient";
import {
  Paper,
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  TextField,
  Button,
  Snackbar,
  Alert,
  Autocomplete
} from "@mui/material";

const columns = [
  { id: "initial_bonding_expiry", label: "Date Of Expiry Of Initial Bonding Period", type: "date" },
  { id: 'format_importer', label: 'Importer', type: 'select', placeholder: 'Select Client' },
  { id: "bill_of_entry_number", label: "Bill of Entry No.", type: "select" },
  { id: "bill_of_entry_date", label: "Bill of Entry Date", type: "date" },
  { id: "bond_no", label: "Bond No.", type: "number" },
  { id: "bond_date", label: "Bond Date", type: "date" },
  { id: "order_date", label: "Date of Order (Sec 60(1))", type: "date" },
  { id: "invoice_no", label: "Invoice No.", type: "text" },
  { id: "invoice_serial", label: "Invoice Serial", type: "select" },
  { id: "goods_description", label: "Description of Goods", type: "text"},
  { id: "quantity", label: "Quantity", type: "number" },
  { id: "extensions", label: "Details Of Extensions", type: "text" , placeholder: 'Enter Details Of Extensions'},
  { id: "bank_guarantee", label: "Details Of Bank Guarantee", type: "text",placeholder: 'Enter Details Of Bank Guarantee' },
  { id: "bonding_expiry", label: "Date Of Expiry Of Bonding Period", type: "date", },
  { id: "remarks", label: "Remarks", type: "text", placeholder: 'Enter Remarks' },
];

const BalanceAndExtensions = () => {
  const [data, setData] = useState([{ id: Date.now() }]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [formatToBillEntries, setFormatToBillEntries] = useState({});
  const [billDetails, setBillDetails] = useState({});
  const [invoiceSerials, setInvoiceSerials] = useState({}); // Store Invoice Serial
  const [balanceQuantities, setBalanceQuantities] = useState({}); 

  const fetchBillEntries = async () => {
    const { data, error } = await supabase
      .from('reciept1')
      .select('format_importer, bill_of_entry_number, bill_of_entry_date, bond_no, bond_date, order_date, invoice_no, invoice_serial, goods_description');
    console.log("data", data)
    if (error) {
      console.error("Error fetching bill entries:", error);
      return;
    }

    const formatToBillEntries = {}; // { format_importer: [boe1, boe2] }
    const billDetails = {}; // { bill_of_entry_number: { details } }
    const serialData = {};

    data.forEach(entry => {
      const format = entry.format_importer;
      const boe = entry.bill_of_entry_number;

      if (format && boe) {
        // Format Importer → Bill of Entry Mapping
        if (!formatToBillEntries[format]) formatToBillEntries[format] = new Set();
        formatToBillEntries[format].add(boe);

        // Store Bill Entry Details
        billDetails[boe] = {
          bill_of_entry_date: entry.bill_of_entry_date || "",
          bond_no: entry.bond_no || "",
          bond_date: entry.bond_date || "",
          order_date: entry.order_date || "",
          invoice_no: entry.invoice_no || "",
          // invoice_serial: entry.invoice_serial ? entry.invoice_serial.split(',') : [],
          goods_description: entry.goods_description || "",
        };
      }

      if (!serialData[boe]) serialData[boe] = [];
      if (entry.invoice_serial) {
        serialData[boe].push(...entry.invoice_serial.split(','));
      }
    });


    // Convert sets to arrays
    Object.keys(formatToBillEntries).forEach(format => {
      formatToBillEntries[format] = Array.from(formatToBillEntries[format]);
    });

    // Set state
    setFormatToBillEntries(formatToBillEntries);
    setBillDetails(billDetails);
    setInvoiceSerials(serialData);
    fetchBalanceQuantities();
  };


  console.log("formatToBillEntries", formatToBillEntries)
  console.log("billDetails", billDetails);
  console.log("balanceQuantities", balanceQuantities);


  const fetchBalanceQuantities = async () => {
    const { data, error } = await supabase
      .from("removal")
      .select("format_importer, bill_of_entry_number, invoice_serial, balance_quantity");
  
    if (error) {
      console.error("Error fetching balance quantities:", error);
      return;
    }
  
    const quantities = {};
    data.forEach(entry => {
      const key = `${entry.format_importer}-${entry.bill_of_entry_number}-${entry.invoice_serial}`;
      quantities[key] = entry.balance_quantity || "";
    });
  
    setBalanceQuantities(quantities);
  };

  useEffect(() => {
    fetchBillEntries();
    fetchBalanceQuantities();  
  }, []);

  const handleInputChange = (id, field, value) => {
    setData((prevData) =>
      prevData.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleFormatImporterChange = (rowId, newFormatImporter) => {
    setData(prevData =>
      prevData.map(row =>
        row.id === rowId
          ? {
            ...row,
            format_importer: newFormatImporter,
            bill_of_entry_number: "", // Reset
            bill_of_entry_date: "",
            bond_no: "",
            bond_date: "",
            order_date: "",
            invoice_no: "",
            invoice_serial: "",
            goods_description: "",
          }
          : row
      )
    );
  };

  const handleBillOfEntryChange = (rowId, newBillOfEntry) => {
    const details = billDetails[newBillOfEntry] || {};
    const invoiceSerialsList = invoiceSerials[newBillOfEntry] || "";
    console.log("invoiceSerialsList", invoiceSerialsList)
    console.log("details", details)
    setData(prevData =>
      prevData.map(row =>
        row.id === rowId
          ? {
            ...row,
            bill_of_entry_number: newBillOfEntry,
            bill_of_entry_date: details.bill_of_entry_date,
            bond_no: details.bond_no,
            bond_date: details.bond_date,
            order_date: details.order_date,
            invoice_no: details.invoice_no,
            invoice_serial: "",
            goods_description: details.goods_description,
          }
          : row
      )
    );
  };

  const handleInvoiceSerialChange = (rowId, selectedSerials) => {
    setData(prevData =>
      prevData.map(row => {
        if (row.id === rowId) {
          const key = `${row.format_importer}-${row.bill_of_entry_number}-${selectedSerials}`;
          return {
            ...row,
            invoice_serial: selectedSerials,
            quantity: balanceQuantities[key] || "0", // Set quantity from fetched data
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
    setData(data.filter((row) => row.id !== id));
  };

  const submitData = async () => {
    let isValid = true;
    let updatedData = data.map(row => {
      let newRow = { ...row };
  
      columns.forEach(column => {
        if (!row[column.id] || row[column.id] === '') {
          newRow[`${column.id}_error`] = true;
          isValid = false;
        } else {
          newRow[`${column.id}_error`] = false;
        }
      });
  
      return newRow;
    });

    
  
    console.log("Updated Data Before Submission:", updatedData);
    setData(updatedData);
  
    if (!isValid) {
      setSnackbarMessage('Please fill all fields before submitting!');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
  
    // Remove error fields before inserting into Supabase
    const filteredData = updatedData.map(({ id, ...row }) => {
      let cleanedRow = {};
      Object.keys(row).forEach(key => {
        if (!key.endsWith('_error')) {
          cleanedRow[key] = row[key];
        }
      });
      return cleanedRow;
    });
     console.log("filteredData",filteredData)
    const { error } = await supabase.from('balance_and_extensions').insert(filteredData);
  
    if (error) {
      console.error("Supabase Error:", error);
      setSnackbarMessage('Submission failed!');
      setSnackbarSeverity('error');
    } else {
      setSnackbarMessage('Data submitted successfully!');
      setSnackbarSeverity('success');
  
      // **Reset all fields explicitly**
      const resetRow = columns.reduce((acc, col) => {
        acc[col.id] = col.type === 'select' ? '' : ''; // Reset selects & text fields
        return acc;
      }, { id: Date.now() });
  
      setData([resetRow]); // Reset table with blank row
    }
  
    setOpenSnackbar(true);
  };


  return (
    <Paper sx={{ width: "100%", padding: 2, overflowX: "auto" }}>
      <Box sx={{ textAlign: "center", marginBottom: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#2C3E50" }}>
          Balance & Extensions
        </Typography>
      </Box>

      <TableContainer sx={{ maxHeight: 500, overflow: "auto", borderRadius: "7px" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  sx={{ fontWeight: "bold", minWidth: 180, backgroundColor: "#1F618D", color: "#FFFFFF" }}
                >
                  {column.label}
                </TableCell>
              ))}
              <TableCell sx={{ backgroundColor: "#1F618D", color: "#FFFF" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    {/* Format Importer Dropdown */}
                    {column.id === "format_importer" ? (
                      <Select
                        fullWidth
                        value={row.format_importer || ""}
                        onChange={(e) => handleFormatImporterChange(row.id, e.target.value)}
                        displayEmpty
                        size="small"
                      >
                        <MenuItem value="" disabled>Select Importer</MenuItem>
                        {Object.keys(formatToBillEntries).map((format) => (
                          <MenuItem key={format} value={format}>
                            {format}
                          </MenuItem>
                        ))}
                      </Select>
                    ) :
                      /* Bill of Entry Dropdown */
                      column.id === "bill_of_entry_number" ? (
                        <Select
                          fullWidth
                          value={row.bill_of_entry_number || ""}
                          onChange={(e) => handleBillOfEntryChange(row.id, e.target.value)}
                          displayEmpty
                          size="small"
                          disabled={!row.format_importer} // Disable until format_importer is selected
                        >
                          <MenuItem value="" disabled>Select Bill of Entry</MenuItem>
                          {(formatToBillEntries[row.format_importer] || []).map((boe) => (
                            <MenuItem key={boe} value={boe}>
                              {boe}
                            </MenuItem>
                          ))}
                        </Select>
                      ) :
                        /* Invoice Serial Multi-Select */
                        column.id === "invoice_serial" ? (
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
                        ) :

                          /* Read-Only Fields: Auto-Filled */
                          ["bill_of_entry_date", "bond_no", "bond_date", "order_date", "invoice_no", "goods_description"].includes(column.id) ? (
                            <TextField
                              variant="outlined"
                              size="small"
                              fullWidth
                              value={row[column.id] || ""}
                              disabled // Read-only
                            />
                          ) :  column.id === "quantity" ? (
                            <TextField
                              variant="outlined"
                              size="small"
                              fullWidth
                              value={row.quantity  || "0"}
                              disabled // Read-only field
                            />
                          )   :
                            /* General Input Fields */
                            (
                              <TextField
                                variant="outlined"
                                size="small"
                                type={column.type}
                                fullWidth
                                value={row[column.id] || ""}
                                placeholder={column.placeholder}
                                onChange={(e) => handleInputChange(row.id, column.id, e.target.value)}
                              />
                            )}
                  </TableCell>
                ))}

                {/* Delete Button */}
                <TableCell>
                  <Button onClick={() => deleteRow(row.id)} color="error" variant="contained">
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

export default BalanceAndExtensions;
