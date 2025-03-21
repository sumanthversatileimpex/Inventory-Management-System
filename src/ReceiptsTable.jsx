import React, { useState } from 'react';
import { supabase } from './lib/supabaseClient';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, TextField, Snackbar, Alert, Box, Typography,
  Select, MenuItem
} from '@mui/material';

const columns = [
  // { id: 'client_name', label: 'Client Name', type: 'text', placeholder: 'Client Name' },
  { id: 'format_importer', label: 'Format Importer', type: 'text', placeholder: 'Format Importer' },
  { id: 'bill_of_entry_number', label: 'Bill of Entry Number', type: 'number', placeholder: 'Bill Of Entry No.', rules: { min: 1 } },
  { id: 'bill_of_entry_date', label: 'Bill of Entry Date', type: 'date', placeholder: 'Bill Of Entry Date' },
  { id: 'invoice_no', label: 'Invoice Number', type: 'text', placeholder: 'Invoice No.' },
  { id: 'invoice_serial', label: 'Invoice Serial', type: 'text', placeholder: 'Invoice Serial' },
  { id: 'customs_station', label: 'Customs Station', type: 'text', placeholder: 'Customs Station' },
  { id: 'bond_no', label: 'Bond No', type: 'number', placeholder: 'Bond Number', rules: { min: 1 } },
  { id: 'bond_date', label: 'Bond Date', type: 'date', placeholder: 'Bond Date' },
  { id: 'goods_description', label: 'Goods Description', type: 'text', placeholder: 'Goods Description', width: 250 },
  { id: 'packages_description', label: 'Packages', type: 'text', placeholder: 'Packages Description', width: 250 },
  { id: 'marks_numbers', label: 'Marks & No.', type: 'text', placeholder: 'Marks & No.' },
  { id: 'weight', label: 'Weight', type: 'number', placeholder: 'Weight', rules: { min: 0 }, width: 100 },
  { id: 'unit', label: 'Unit', type: 'text', placeholder: 'kg/ltr',  options: ['kg', 'liter'], width: 100 },
  { id: 'quantity', label: 'Quantity', type: 'number', placeholder: 'Quantity', rules: { min: 1 }, width: 100 },
  { id: 'value_inr', label: 'Value', type: 'number', placeholder: 'Value (INR)', rules: { min: 1, format: 'currency' }, adornment: true },
  { id: 'duty_assessed', label: 'Duty Assessed ', type: 'number', placeholder: 'Enter Duty (INR)', rules: { min: 1, format: 'currency' }, adornment: true },
  { id: 'order_date', label: 'Order Date', type: 'date', placeholder: 'Order Date' },
  { id: 'warehouse_code_address', label: 'Warehouse Code', type: 'text', placeholder: 'Warehouse Code' },
  { id: 'transport_registration', label: 'Transport Reg.', type: 'text', placeholder: 'Transport Registration' },
  { id: 'otl_no', label: 'OTL No.', type: 'text', placeholder: 'OTL Number' },
  { id: 'quantity_adviced', label: 'Quantity Advised', type: 'number', placeholder: 'Quantity Advised', rules: { min: 1 } },
  { id: 'quantity_received', label: 'Quantity Received', type: 'number', placeholder: 'Quantity Received', rules: { min: 1 } },
  { id: 'breakage_damage', label: 'Breakage', type: 'text', placeholder: 'Breakage' },
  { id: 'shortage', label: 'Shortage', type: 'text', placeholder: 'Shortage' }
];

const ReceiptsTable = () => {
  const [data, setData] = useState([{ id: Date.now() }]);
  const [staticValues, setStaticValues] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const staticColumns = [
    'format_importer',
    'bill_of_entry_number',
    'bill_of_entry_date',
    'customs_station',
    'bond_no',
    'bond_date',
    'order_date',
    'warehouse_code_address'
  ];
  
  const handleInputChange = (id, columnId, value) => {
    const updatedData = data.map(row =>
      row.id === id ? { ...row, [columnId]: value } : row
    );
  
    setData(updatedData);
  
    if (staticColumns.includes(columnId)) {
      setStaticValues(prev => ({ ...prev, [columnId]: value }));
      setData(updatedData.map(row => ({ ...row, [columnId]: value }))); 
    }
  };
  
  const addRow = () => {
    setData([...data, { id: Date.now(), ...staticValues }]);
  };
  
  const deleteRow = (id) => {
    if (data.length > 1) {
      setData(data.filter(row => row.id !== id));
    }
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
    console.log("updatedData",updatedData)

    setData(updatedData);

    if (!isValid) {
      setSnackbarMessage('Please fill all fields before submitting!');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const { error } = await supabase.from('reciept1_duplicate').insert(data.map(({ id, ...row }) => row));

    if (error) {
      setSnackbarMessage('Submission failed!');
      setSnackbarSeverity('error');
    } else {
      setSnackbarMessage('Data submitted successfully!');
      setSnackbarSeverity('success');
      setData([{ id: Date.now(), ...staticValues }]); // Reset table with static values
    }

    setOpenSnackbar(true);
  };

  return (
    <Paper sx={{ width: '100%', padding: 2, overflowX: 'auto' }}>
      <Box sx={{ textAlign: 'center', marginBottom: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1F618D' }}>Receipts</Typography>
      </Box>

      <TableContainer sx={{ maxHeight: 500, overflow: 'auto', borderRadius: '7px' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell key={column.id} sx={{ fontWeight: 'bold', minWidth: column.width || 180, backgroundColor: '#1F618D', color: '#FFFFFF' }}>
                  {column.label}
                </TableCell>
              ))}
              <TableCell sx={{ backgroundColor: '#1F618D', color: '#FFFF' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(row => (
              <TableRow key={row.id}>
                {columns.map(column => (
                  <TableCell key={column.id}>
                      <TextField
                        variant="outlined"
                        size="small"
                        type={column.type}
                        placeholder={column.placeholder}
                        fullWidth
                        sx={{
                          minWidth: column.width || 180,
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: row[`${column.id}_error`] ? 'red' : undefined,
                            },
                            '&:hover fieldset': {
                              borderColor: row[`${column.id}_error`] ? 'red' : undefined,
                            },
                          },
                        }}
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
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ReceiptsTable;
