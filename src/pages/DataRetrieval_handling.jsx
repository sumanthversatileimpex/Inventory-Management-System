import React, { useState, useEffect } from 'react';
import { supabase } from '../context/supabaseClient';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, Typography, Box, FormControl, InputLabel, Select, MenuItem, Stack, TextField
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const columns = [
  { id: 'format_importer', label: 'Format Importer', type: 'text' },
  { id: 'order_date', label: 'Order Date', type: 'date', placeholder: 'Order Date' },
  // { id: 'bill_of_entry_number', label: 'Bill of Entry Number', type: 'number' },
  // { id: 'invoice_no', label: 'Invoice No', type: 'text' },
  // { id: 'invoice_serial', label: 'Invoice Serial', type: 'text' },
    { id: 'sample_drawn_by_government_agencies', label: 'Sample Drawn By Government Agencies', type: 'text', placeholder: 'Enter agency name' },
    { id: 'activities_under_section_65', label: 'Activities Undertaken Under Section n64', type: 'text', placeholder: 'Enter activities' },
    { id: 'expiry_of_initial_bonding_period', label: 'Date Of Expiry Of Initial Bonding Period', type: 'date', placeholder: 'Select expiry date' },
    { id: 'period_extended_upto', label: 'Period Extended Upto', type: 'date', placeholder: 'Select extended period' },
    { id: 'bank_guarantee_details', label: 'Details Of Bank Guarantee', type: 'text', placeholder: 'Enter bank guarantee details' },
    { id: 'relinquishment', label: 'Relinquishment', type: 'text', placeholder: 'Enter relinquishment details' },
  ];

function DataRetrieval_handling() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [clients, setClients] = useState([]);
    const [formatImporter, setFormatImporter] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
  
    // const theme = useTheme();
    useEffect(() => {
      const fetchData = async () => {
        const { data, error } = await supabase.from('handling_and_storage').select('*');
        if (!error) {
          setData(data);
          setFilteredData(data);
          const uniqueClients = [...new Set(data.map(row => row.format_importer))];
          setClients(uniqueClients);
        }
      };
      fetchData();
    }, []);
    // console.log("formatImporter",formatImporter);

    const handleSearch = () => {
      let filtered = data;
      
      if (formatImporter) {
        filtered = filtered.filter(row => row.format_importer === formatImporter);
      }
      if (startDate && endDate) {
        filtered = filtered.filter(row => 
          new Date(row.order_date) >= new Date(startDate) && new Date(row.order_date) <= new Date(endDate)
        );
      }

      setFilteredData(filtered);
    };
  
   return (
    <Paper sx={{ padding: 2, overflowX: 'auto' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2 }}>Handling & Storage Data</Typography>
  
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ marginBottom: 2 }}>
            <FormControl sx={{ minWidth: 300 }}>
                <InputLabel id="format-importer-label">Format Importer Name</InputLabel>
                <Select
                    labelId="format-importer-label"
                    id="format-importer"
                    value={formatImporter || ""}                    
                    label="Format Importer Name"
                    onChange={(e) => setFormatImporter(e.target.value)}
                    MenuProps={{
                      PaperProps: {
                        sx: { width: 300 }, 
                      },
                    }}
                    sx={{ width: 300 }}
                >
                    {clients.map((client, index) => (
                        <MenuItem key={index} value={client}>{client}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <TextField
                label="Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
            />
            <TextField
                label="End Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
            />
            <Button variant="contained" onClick={handleSearch}>Search</Button>
        </Stack>
        
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
    
    export default DataRetrieval_handling;