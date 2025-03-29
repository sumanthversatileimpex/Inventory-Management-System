import React, { useState } from 'react';
import { supabase } from './lib/supabaseClient';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, TextField, Snackbar, Alert, Box, Typography,
  Select, MenuItem
} from '@mui/material';

const columns = [
    { id: 'client_name', label: 'Client Name', type: 'text', placeholder: 'Enter Client Name', required: true },
    { id: 'address', label: 'Address', type: 'text', placeholder: 'Enter Address' },
    { id: 'warehouse_code', label: 'Warehouse Code', type: 'text', placeholder: 'Enter Warehouse Code' },
    { id: 'file_no', label: 'File No', type: 'text', placeholder: 'Enter File No', unique: true },
    { id: 'file_date', label: 'File Date', type: 'date', placeholder: 'Select File Date' },
    { id: 'license_date', label: 'License Date', type: 'date', placeholder: 'Select License Date' },
    { id: 'mobile_no', label: 'Mobile No', type: 'text', placeholder: 'Enter 10-digit Mobile No', validation: /^\d{10}$/ },
    { id: 'contact_person', label: 'Contact Person', type: 'text', placeholder: 'Enter Contact Person Name' },
    { id: 'email_id', label: 'Email ID', type: 'email', placeholder: 'Enter Email ID', validation: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
  ];
  

function ClientsInfo() {
     const [data, setData] = useState([{ id: Date.now() }]);
      const [staticValues, setStaticValues] = useState({});
      const [openSnackbar, setOpenSnackbar] = useState(false);
      const [snackbarMessage, setSnackbarMessage] = useState('');
      const [snackbarSeverity, setSnackbarSeverity] = useState('success');

      const handleInputChange = (id, columnId, value) => {
        const updatedData = data.map(row =>
          row.id === id ? { ...row, [columnId]: value } : row
        );
      
        setData(updatedData);
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
      
        console.log("Updated Data Before Submission:", updatedData);
      
        // Ensure UI updates with error highlights
        setData(updatedData);
      
        if (!isValid) {
          setSnackbarMessage('Please fill all fields before submitting!');
          setSnackbarSeverity('error');
          setOpenSnackbar(true);
          return;
        }
      
        // **Remove `_error` fields before submission**
        const filteredData = updatedData.map(({ id, ...row }) => {
          let cleanedRow = {};
          Object.keys(row).forEach(key => {
            if (!key.endsWith('_error')) {
              cleanedRow[key] = row[key];
            }
          });
          return cleanedRow;
        });
      
        // **Insert only valid columns into Supabase**
        const { error } = await supabase.from('client_details').insert(filteredData);
      
        if (error) {
          console.error("Supabase Error:", error);
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
           <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1F618D' }}>Clients Info</Typography>
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
  )
}

export default ClientsInfo
