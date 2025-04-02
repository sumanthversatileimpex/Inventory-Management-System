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
    const [formatImporter, setFormatImporter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
  // console.log("data",data)

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
  // console.log("formatImporter",formatImporter)
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
        <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2 }}>Removal Data</Typography>
        
        {/* Filter Section */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ marginBottom: 2 }}>
          <FormControl sx={{ minWidth: 300 }}>
           <InputLabel id="demo-simple-select-label">Format Importer Name</InputLabel>
            <Select
             labelId="demo-simple-select-label"
             id="demo-simple-select"
              value={formatImporter}
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
  
        {/* Data Table */}
        <Box sx={{ overflowX: 'auto' }}>
          <TableContainer sx={{ borderRadius: '7px', minWidth: '900px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell 
                      key={column.id} 
                      sx={{ fontWeight: 'bold', minWidth: 150, backgroundColor: '#1F618D', color: '#ffffff' }}
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
    );
  }
  
  export default DataRetrieval_removals;
