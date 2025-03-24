import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, Typography, Box, TextField, MenuItem, Autocomplete,
  Stack, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

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

function DataRetrieval_clientsInfo() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [clients, setClients] = useState([]);
    const [formatImporter, setformatImporter] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
  
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); 
    useEffect(() => {
      const fetchData = async () => {
        const { data, error } = await supabase.from('client_details').select('*');
        if (!error) {
          setData(data);
          setFilteredData(data);
          const uniqueClients = [...new Set(data.map(row => row.format_importer))];
          setClients(uniqueClients);
        }
      };
      fetchData();
    }, []);
  
    const handleSearch = () => {
      let filtered = data;
      
      if (formatImporter) {
        filtered = filtered.filter(row => row.format_importer === formatImporter);
      }
  
      if (startDate && endDate) {
        filtered = filtered.filter(row => 
          new Date(row.bill_of_entry_date) >= new Date(startDate) &&
          new Date(row.bill_of_entry_date) <= new Date(endDate)
        );
      }
      console.log("filtered",filtered)
      setFilteredData(filtered);
    };
  
  return (
     <Paper sx={{ padding: 2, overflowX: 'auto' }}>
         <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2 }}>Clients Data</Typography>
   
         {/* <Stack 
           direction={isMobile ? 'column' : 'row'} 
           spacing={2} 
           sx={{ marginBottom: 2 }}
         >
           <Autocomplete
             options={clients}
             value={formatImporter}
             onChange={(event, newValue) => setformatImporter(newValue)}
             renderInput={(params) => <TextField {...params} label="Format Importer Name" variant="outlined" />}
             sx={{ width: isMobile ? '100%' : 300 }}
           />
   
           <TextField
             label="Start Date"
             type="date"
             InputLabelProps={{ shrink: true }}
             value={startDate}
             onChange={(e) => setStartDate(e.target.value)}
             sx={{ width: isMobile ? '100%' : 200 }}
           />
   
           <TextField
             label="End Date"
             type="date"
             InputLabelProps={{ shrink: true }}
             value={endDate}
             onChange={(e) => setEndDate(e.target.value)}
             sx={{ width: isMobile ? '100%' : 200 }}
           />
   
           <Button variant="contained" color="primary" onClick={handleSearch} sx={{ width: isMobile ? '100%' : 'auto' }}>
             Search
           </Button>
         </Stack> */}
   
         <Box sx={{ overflowX: 'auto' }}>
           <TableContainer sx={{ borderRadius: '7px', minWidth: '900px' }}>
             <Table>
               <TableHead>
                 <TableRow>
                   {columns.map((column) => (
                     <TableCell 
                       key={column.id} 
                       sx={{ fontWeight: 'bold', minWidth: column.width || 180, backgroundColor: '#1F618D', color: '#ffffff' }}
                     >
                       {column.label}
                     </TableCell>
                   ))}
                 </TableRow>
               </TableHead>
               <TableBody>
                 {filteredData.map((row, index) => (
                   <TableRow key={row.id} sx={{ backgroundColor: index % 2 === 0 ? 'white' : '#D3D3D3' }}>
                     {columns.map((column) => (
                       <TableCell key={column.id}>{row[column.id]}</TableCell>
                     ))}
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           </TableContainer>
         </Box>
       </Paper>
  )
}

export default DataRetrieval_clientsInfo

