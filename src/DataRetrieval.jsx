import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, Typography, Box, TextField, MenuItem, Autocomplete,
  Stack, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const columns = [
  // { id: 'client_name', label: 'Client Name', type: 'text' },
  { id: 'format_importer', label: 'Format Importer', type: 'text' },
  { id: 'bill_of_entry_number', label: 'Bill of Entry Number', type: 'number' },
  { id: 'bill_of_entry_date', label: 'Bill of Entry Date', type: 'date' },
  { id: 'invoice_no', label: 'Invoice No', type: 'text' },
  { id: 'invoice_serial', label: 'Invoice Serial', type: 'text' },
  { id: 'customs_station', label: 'Customs Station', type: 'text' },
  { id: 'bond_no', label: 'Bond No', type: 'number' },
  { id: 'bond_date', label: 'Bond Date', type: 'date' },
  { id: 'goods_description', label: 'Goods Description', type: 'text' },
  { id: 'packages_description', label: 'Packages', type: 'text' },
  { id: 'marks_numbers', label: 'Marks & No.', type: 'text' },
  { id: 'weight', label: 'Weight', type: 'number' },
  { id: 'unit', label: 'Unit', type: 'select', options: ['kg', 'liter'] },
  { id: 'quantity', label: 'Quantity', type: 'number' },
  { id: 'value_inr', label: 'Value (INR)', type: 'number' },
  { id: 'duty_assessed', label: 'Duty (INR)', type: 'number' },
  { id: 'order_date', label: 'Order Date', type: 'date' },
  { id: 'warehouse_code_address', label: 'Warehouse Code', type: 'text' },
  { id: 'transport_registration', label: 'Transport Reg.', type: 'text' },
  { id: 'otl_no', label: 'OTL No.', type: 'text' },
  { id: 'quantity_adviced', label: 'Qty Advised', type: 'number' },
  { id: 'quantity_received', label: 'Qty Received', type: 'number' },
  { id: 'breakage_damage', label: 'Breakage', type: 'text' },
  { id: 'shortage', label: 'Shortage', type: 'text' }
];

const DataRetrieval = () => {
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
      const { data, error } = await supabase.from('reciept1').select('*');
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
      filtered = filtered.filter(row => row.client_name === formatImporter);
    }

    if (startDate && endDate) {
      filtered = filtered.filter(row => 
        new Date(row.bill_of_entry_date) >= new Date(startDate) &&
        new Date(row.bill_of_entry_date) <= new Date(endDate)
      );
    }

    setFilteredData(filtered);
  };

  return (
    <Paper sx={{ padding: 2, overflowX: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2 }}>Receipts Data</Typography>

      <Stack 
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
  );
};

export default DataRetrieval;
