import React, { useState ,useEffect } from "react";
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
  { id: "quantity_cleared", label: "Quantity Cleared", type: "number", placeholder: "Enter cleared qty" },
  { id: "value", label: "Value", type: "number", width: 100, placeholder: "Enter value" },
  { id: "duty", label: "Duty", type: "number", width: 100, placeholder: "Enter duty" },
  { id: "interest", label: "Interest", type: "number", width: 100, placeholder: "Enter interest" },
  { id: "balance_quantity", label: "Balance Quantity", type: "number", placeholder: "Enter balance qty" },
  { id: "remarks", label: "Remarks", type: "text", placeholder: "Enter remarks" },
];


const Removals= () => {
  const [data, setData] = useState([{ id: Date.now() }]);
  const [billEntries, setBillEntries] = useState([]); // Store available Bill of Entry Numbers
  const [invoiceNumbers, setInvoiceNumbers] = useState({}); // Store Invoice Numbers
  const [invoiceSerials, setInvoiceSerials] = useState({}); // Store Invoice Serials
  const [formatImporter, setFormatImporter] = useState({}); 
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    const fetchBillEntries = async () => {
      const { data, error } = await supabase.from('reciept1').select('format_importer,bill_of_entry_number, invoice_no, invoice_serial');
      if (error) {
        console.error("Error fetching bill entries:", error);
      } else {
        const formattedEntries = data.map(entry => entry.bill_of_entry_number);
        const invoiceData = {};
        const serialData = {};
        const formateImporterData = {};
        data.forEach(entry => {
          formateImporterData[entry.bill_of_entry_number] = entry.format_importer;
          invoiceData[entry.bill_of_entry_number] = entry.invoice_no;
          serialData[entry.bill_of_entry_number] = entry.invoice_serial ? entry.invoice_serial.split(',') : [];
        });
        setBillEntries(formattedEntries);
        setFormatImporter(formateImporterData);
        setInvoiceNumbers(invoiceData);
        setInvoiceSerials(serialData);
      }
    };
    console.log("FormatImporter",formatImporter)

      useEffect(() => {
        fetchBillEntries();
      }, []);

        useEffect(() => {
          console.log("Fetched Bill Entries:", billEntries);
          console.log("Format Importer Data:", formatImporter);
        }, [billEntries, formatImporter]);

  const handleInputChange = (id, columnId, value) => {
    setData(prevData =>
      prevData.map(row => (row.id === id ? { ...row, [columnId]: value } : row))
    );
  };

  const handleBillOfEntryChange = (id, value) => {
    console.log("Selected Bill of Entry:", value);
    console.log("Mapped Format Importer:", formatImporter[value]);
    console.log("Mapped Format Importer:", invoiceNumbers[value]);
    setData(prevData =>
      prevData.map(row =>
        row.id === id
          ? { ...row, bill_of_entry_number: value, invoice_no: invoiceNumbers[value] || '', invoice_serial: [] ,format_importer : formatImporter[value] || ''}
          : row
      )
    );
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
    console.log("isValid data",data)
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
                            value={row.bill_of_entry_number}
                            onChange={(e) => handleBillOfEntryChange(row.id, e.target.value)}
                            fullWidth
                            placeholder={columns.placeholder} 
                             sx={{width:150}}
                          >
                            {billEntries.map(entry => (
                              <MenuItem key={entry} value={entry}>{entry}</MenuItem>
                            ))}
                          </Select>
                        </TableCell>
        
                        {/* Invoice Number (Auto-filled, Read-only) */}
                        <TableCell>
                          <TextField variant="outlined"  placeholder={columns.placeholder}   sx={{width:200}} size="small" fullWidth value={row.invoice_no} disabled />
                        </TableCell>
        
                        {/* Invoice Serial (Multi-Select) */}
                        <TableCell>
                        <Autocomplete
                          options={invoiceSerials[row.bill_of_entry_number] || []}
                          value={row.invoice_serial || null}
                          fullWidth
                          sx={{minWidth:150}}
                          placeholder="Enter Invoice No." 
                          onChange={(e, newValue) => handleInvoiceSerialChange(row.id, newValue)}
                          renderInput={(params) => <TextField {...params} variant="outlined" size="small" />} />
                          </TableCell>
        
                        {/* Other Data Fields */}
                        {columns.map(column => (
                          <TableCell key={column.id}>
                            <TextField
                              variant="outlined"
                              size="small"
                              type={column.type}
                              fullWidth
                              sx={{minWidth:150}}
                              placeholder={column.placeholder}
                              value={row[column.id] || ''}
                              onChange={(e) => handleInputChange(row.id, column.id, e.target.value)}
                            />
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
