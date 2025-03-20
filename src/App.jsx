import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Box,
  useMediaQuery,
} from "@mui/material";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ReceiptsTable from "./ReceiptsTable";
import Handling_And_Storage from "./Handling_And_Storage";
import Removals from "./Removals";
import DataRetrieval from "./DataRetrieval";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";

const App = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Detect small screens

  useEffect(() => {
    document.title = "Inventory Management System";
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  const menuItems = [
    { text: "Receipts", path: "/" },
    { text: "Handling & Storage", path: "/handling_and_storage" },
    { text: "Removals", path: "/removals" },
    { text: "Receipts Data", path: "/retrieve" },
  ];

  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" color="inherit" onClick={() => toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Inventory Management System
          </Typography>

          {!isMobile && (
            <>
              {menuItems.map((item) => (
                <Button key={item.text} color="inherit" component={Link} to={item.path}>
                  {item.text}
                </Button>
              ))}
            </>
          )}

          <IconButton onClick={handleMenuOpen} sx={{ marginLeft: 2 }}>
            <Avatar alt="User" src="/avatar.png" />
          </IconButton>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem>User 123</MenuItem>
            <MenuItem>+1234567890</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Mobile Side Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => toggleDrawer(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={() => toggleDrawer(false)}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={Link} to={item.path}>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Routes */}
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
