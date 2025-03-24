import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, Typography, Box, TextField, MenuItem, Autocomplete,
  Stack, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const columns = [ 
  // { id: 'format_importer', label: 'Format Importer', type: 'text' },
  // { id: 'bill_of_entry_number', label: 'Bill of Entry Number', type: 'number' },
  // { id: 'invoice_no', label: 'Invoice No', type: 'text' },
  // { id: 'invoice_serial', label: 'Invoice Serial', type: 'text' },
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

function DataRetrieval_removals() {
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
        const { data, error } = await supabase.from('removal').select('*');
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
         <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2 }}>Removal Data</Typography>
   
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

export default DataRetrieval_removals
