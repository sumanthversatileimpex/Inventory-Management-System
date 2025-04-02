import React, { useState ,useEffect} from 'react';
import { supabase } from '../context/supabaseClient';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, TextField, Snackbar, Alert, Box, Typography, MenuItem, Select
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';

const columns = [
  { id: 'sample_drawn_by_government_agencies', label: 'Sample Drawn By Government Agencies', type: 'text', placeholder: 'Enter agency name' },
  { id: 'activities_under_section_65', label: 'Activities Undertaken Under Section n64', type: 'text', placeholder: 'Enter activities' },
  { id: 'expiry_of_initial_bonding_period', label: 'Date Of Expiry Of Initial Bonding Period', type: 'date', placeholder: 'Select expiry date' },
  { id: 'period_extended_upto', label: 'Period Extended Upto', type: 'date', placeholder: 'Select extended period' },
  { id: 'bank_guarantee_details', label: 'Details Of Bank Guarantee', type: 'text', placeholder: 'Enter bank guarantee details' },
  { id: 'relinquishment', label: 'Relinquishment', type: 'text', placeholder: 'Enter relinquishment details' },
];


const HandlingAndStorageTable = () => {
  const [data, setData] = useState([{ id: Date.now(), bill_of_entry_number: '', invoice_no: '', invoice_serial: [] }]);
  const [billEntries, setBillEntries] = useState([]); // Store available Bill of Entry Numbers
  const [invoiceNumbers, setInvoiceNumbers] = useState({}); // Store Invoice Numbers
  const [invoiceSerials, setInvoiceSerials] = useState({}); // Store Invoice Serials
  const [formatImporter, setFormatImporter] = useState({}); 
  const [orderDateData, setorderDateData] = useState(null); 
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const fetchBillEntries = async () => {
    const { data, error } = await supabase.from('reciept1').select('format_importer,bill_of_entry_number, invoice_no, invoice_serial,order_date');
    if (error) {
      console.error("Error fetching bill entries:", error);
    } else {
      const formattedEntries = data.map(entry => entry.bill_of_entry_number);
      const invoiceData = {};
      const serialData = {};
      const formateImporterData = {};
      const orderData = {};
      data.forEach(entry => {
        formateImporterData[entry.bill_of_entry_number] = entry.format_importer
        invoiceData[entry.bill_of_entry_number] = entry.invoice_no;
        serialData[entry.bill_of_entry_number] = entry.invoice_serial ? entry.invoice_serial.split(',') : [];
        orderData[entry.bill_of_entry_number] = entry.order_date;
      });
      setBillEntries(formattedEntries);
      setFormatImporter(formateImporterData);
      setInvoiceNumbers(invoiceData);
      setInvoiceSerials(serialData);
      setorderDateData(orderData);
    }
  };

  useEffect(() => {
    fetchBillEntries();
  }, []);

  useEffect(() => {
    console.log("Fetched Bill Entries:", billEntries);
    console.log("Format Importer Data:", formatImporter);
    console.log("Order Date Data:", orderDateData);
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
  console.log("Mapped Format Importer:", orderDateData[value]);
    setData(prevData =>
      prevData.map(row =>
        row.id === id
          ? { 
              ...row, 
              bill_of_entry_number: value, 
              invoice_no: invoiceNumbers[value] || '', 
              invoice_serial: [], 
              format_importer: formatImporter[value] || '' ,
              order_date: orderDateData[value] || null ,
            }
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
    // Get the latest data state to ensure validation runs correctly
    const latestData = [...data];
  
    // Check if all required fields are filled
    const isValid = latestData.every(row =>
      row.bill_of_entry_number &&
      row.invoice_no &&
      row.invoice_serial &&
      row.format_importer &&
      columns.every(col => row[col.id])
    );
  
    console.log("Validating data:", latestData); // Debugging log
  
    if (!isValid) {
      setSnackbarMessage('Please fill all fields before submitting!');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
  
    try {
      const { error } = await supabase.from('handling_and_storage').insert(
        latestData.map(({ id, ...row }) => row)
      );
  
      if (error) {
        console.error("Supabase Error:", error);
        setSnackbarMessage('Submission failed!');
        setSnackbarSeverity('error');
      } else {
        setSnackbarMessage('Data submitted successfully!');
        setSnackbarSeverity('success');
        setData([{ id: Date.now() }]); // Reset form
      }
    } catch (err) {
      console.error("Unexpected Submission Error:", err);
      setSnackbarMessage("An unexpected error occurred.");
      setSnackbarSeverity("error");
    }
  
    setOpenSnackbar(true);
  };
  

  return (
    <Paper sx={{ width: '100%', padding: 2, overflowX: 'auto' }}>
      <Box sx={{ textAlign: 'center', marginBottom: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1F618D' }}>
          Handling & Storage
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
                <TableCell key={column.id} sx={{ fontWeight: 'bold', backgroundColor: '#1F618D', color: '#FFFFFF' }}>
                  {column.label}
                </TableCell>
              ))}
              <TableCell sx={{ backgroundColor: '#1F618D', color: '#FFFFFF' }}>Actions</TableCell>
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
                     sx={{width:150}}
                  >
                    {billEntries.map(entry => (
                      <MenuItem key={entry} value={entry}>{entry}</MenuItem>
                    ))}
                  </Select>
                </TableCell>

                {/* Invoice Number (Auto-filled, Read-only) */}
                <TableCell>
                  <TextField variant="outlined"    sx={{width:200}} size="small" fullWidth value={row.invoice_no} disabled />
                </TableCell>
                
                {/* Invoice Serial (Multi-Select) */}
                <TableCell>
                <Autocomplete
                  options={invoiceSerials[row.bill_of_entry_number] || []}
                  value={row.invoice_serial || null}
                  fullWidth
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

      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
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

export default HandlingAndStorageTable;

