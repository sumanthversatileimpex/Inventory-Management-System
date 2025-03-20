import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
  AppBar, Toolbar, Typography, Button, Menu, MenuItem, Avatar,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Box, TextField, Autocomplete, IconButton
} from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ReceiptsTable from './ReceiptsTable';
import Handling_And_Storage from './Handling_And_Storage';
import Removals from './Removals';
import DataRetrieval from './DataRetrieval';
import MenuIcon from '@mui/icons-material/Menu';

const App = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1}}>Inventory Management System</Typography>
          <Button color="inherit" component={Link} to="/">Receipts</Button>
          {/* <Button color="inherit" component={Link} to="/handling_and_storage">Handling & Storage</Button>
          <Button color="inherit" component={Link} to="/removals">Removals</Button> */}
          <Button color="inherit" component={Link} to="/retrieve">Receipts Data</Button>
          <IconButton onClick={handleMenuOpen} sx={{ marginLeft: 2 }}>
            <Avatar alt="User" src="https://via.placeholder.com/40" />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem>User 123</MenuItem>
            <MenuItem>+1234567890</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/" element={<ReceiptsTable />} />
        <Route path="/handling_and_storage" element={<Handling_And_Storage />} />
        <Route path="/removals" element={<Removals />} />
        <Route path="/retrieve" element={<DataRetrieval />} />
      </Routes>
    </Router>
  );
};

export default App;
