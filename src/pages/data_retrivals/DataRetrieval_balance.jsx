import React, { useState, useEffect } from 'react';
import { supabase } from '../../context/supabaseClient';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, Typography, Box, TextField, MenuItem, Autocomplete,
  Stack, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const columns = [
  { id: "initial_bonding_expiry", label: "Date Of Expiry Of Initial Bonding Period", type: "date" },
  { id: 'format_importer', label: 'Importer', type: 'select', placeholder: 'Select Client' },
  { id: "bill_of_entry_number", label: "Bill of Entry No.", type: "select" },
  { id: "bill_of_entry_date", label: "Bill of Entry Date", type: "date" },
  { id: "bond_no", label: "Bond No.", type: "number" },
  { id: "bond_date", label: "Bond Date", type: "date" },
  { id: "order_date", label: "Date of Order (Sec 60(1))", type: "date" },
  { id: "invoice_no", label: "Invoice No.", type: "text" },
  { id: "invoice_serial", label: "Invoice Serial", type: "select" },
  { id: "goods_description", label: "Description of Goods", type: "text" },
  { id: "quantity", label: "Quantity", type: "number" },
  { id: "extensions", label: "Details Of Extensions", type: "text" },
  { id: "bank_guarantee", label: "Details Of Bank Guarantee", type: "text" },
  { id: "bonding_expiry", label: "Date Of Expiry Of Bonding Period", type: "date" },
  { id: "remarks", label: "Remarks", type: "text" },
];

const DataRetrieval_balance = () => {
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
      const { data, error } = await supabase.from('balance_and_extensions').select('*');
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
        new Date(row.order_date) >= new Date(startDate) &&
        new Date(row.order_date) <= new Date(endDate)
      );
    }
    console.log("filtered",filtered)
    setFilteredData(filtered);
  };

  return (
    <Paper sx={{ padding: 2, overflowX: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2 , color:"#2C3E50" }}> Balance & Extensions Data</Typography>

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

export default DataRetrieval_balance;
