import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, Typography, Box, TextField, MenuItem, Autocomplete
} from '@mui/material';

const columns = [
  { id: 'client_name', label: 'Client Name', type: 'text', placeholder: 'Client Name' },
  { id: 'format_importer', label: 'Format Importer', type: 'text', placeholder: 'Format Importer' },
  { id: 'bill_of_entry_number', label: 'Bill of Entry Number', type: 'number', placeholder: 'Bill Of Entry Number', rules: { min: 1 } },
  { id: 'bill_of_entry_date', label: 'Bill of Entry Date', type: 'date', placeholder: 'Bill Of Entry Date' },
  { id: 'invoice_no', label: 'Invoice No', type: 'text', placeholder: 'Invoice Number' },
  { id: 'invoice_serial', label: 'Invoice Serial', type: 'text', placeholder: 'Invoice Serial' },
  { id: 'customs_station', label: 'Customs Station', type: 'text', placeholder: 'Customs Station' },
  { id: 'bond_no', label: 'Bond No', type: 'number', placeholder: 'Bond Number', rules: { min: 1 } },
  { id: 'bond_date', label: 'Bond Date', type: 'date', placeholder: 'Bond Date' },
  { id: 'goods_description', label: 'Goods Description', type: 'text', placeholder: 'Goods Description', width: 250 },
  { id: 'packages_description', label: 'Packages', type: 'text', placeholder: 'Packages Description', width: 250 },
  { id: 'marks_numbers', label: 'Marks & No.', type: 'text', placeholder: 'Marks & No.' },
  { id: 'weight', label: 'Weight', type: 'number', placeholder: 'Weight', rules: { min: 0 }, width: 100 },
  { id: 'unit', label: 'Unit', type: 'select', options: ['kg', 'liter'], width: 100 },
  { id: 'quantity', label: 'Quantity', type: 'number', placeholder: 'Quantity', rules: { min: 1 }, width: 100 },
  { id: 'value_inr', label: 'Value (INR)', type: 'number', placeholder: 'Value (INR)', rules: { min: 1, format: 'currency' } },
  { id: 'duty_assessed', label: 'Duty (INR)', type: 'number', placeholder: 'Enter Duty (INR)', rules: { min: 1, format: 'currency' } },
  { id: 'order_date', label: 'Order Date', type: 'date', placeholder: 'Order Date' },
  { id: 'warehouse_code_address', label: 'Warehouse Code', type: 'text', placeholder: 'Warehouse Code' },
  { id: 'transport_registration', label: 'Transport Reg.', type: 'text', placeholder: 'Transport Registration' },
  { id: 'otl_no', label: 'OTL No.', type: 'text', placeholder: 'OTL Number' },
  { id: 'quantity_adviced', label: 'Qty Advised', type: 'number', placeholder: 'Quantity Advised', rules: { min: 1 } },
  { id: 'quantity_received', label: 'Qty Received', type: 'number', placeholder: 'Quantity Received', rules: { min: 1 } },
  { id: 'breakage_damage', label: 'Breakage', type: 'text', placeholder: 'Breakage' },
  { id: 'shortage', label: 'Shortage', type: 'text', placeholder: 'Shortage' }
];

const DataRetrieval = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('reciept1').select('*');
      if (!error) {
        setData(data);
        setFilteredData(data);
        const uniqueClients = [...new Set(data.map(row => row.client_name))];
        setClients(uniqueClients);
      }
    };
    fetchData();
  }, []);

  const handleSearch = () => {
    let filtered = data;
    
    if (selectedClient) {
      filtered = filtered.filter(row => row.client_name === selectedClient);
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
      
      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
        <Autocomplete
          options={clients}
          value={selectedClient}
          onChange={(event, newValue) => setSelectedClient(newValue)}
          renderInput={(params) => <TextField {...params} label="Client Name" variant="outlined" />}
          sx={{ width: 300 }}
        />
        
        <TextField
          label="Start Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          sx={{ width: 200 }}
        />

        <TextField
          label="End Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          sx={{ width: 200 }}
        />

        <Button variant="contained" color="primary" onClick={handleSearch}>Search</Button>
      </Box>

      <TableContainer sx={{ borderRadius:'7px'}}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} sx={{ fontWeight: 'bold', minWidth: column.width || 180, backgroundColor: '#1F618D', color: '#ffff' }}>{column.label}</TableCell>
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
    </Paper>
  );
};

export default DataRetrieval;
