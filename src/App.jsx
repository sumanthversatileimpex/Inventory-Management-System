import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
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
  Container,
  Paper,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

// Import Components
import ReceiptsTable from "./ReceiptsTable";
import Handling_And_Storage from "./Handling_And_Storage";
import Removals from "./Removals";
import ClientsInfo from "./ClientsInfo";
import DataRetrieval from "./DataRetrieval";
import DataRetrieval_handling from "./DataRetrieval_handling";
import DataRetrieval_removals from "./DataRetrieval_removals";
import DataRetrieval_clientsInfo from "./DataRetrieval_clientsInfo";
import MTR_Information from "./MTR_Information";
import itlLogo from "/images/ITL Logo.jpg";

const HomePage = () => {
  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          textAlign: "center",
          marginTop: 10,
        }}
      >
        {/* Logo at the Top */}
        <img
          src={itlLogo}
          alt="ITL Logo"
          style={{ width: "120px", height: "auto", marginBottom: "16px" }}
        />

        <Typography variant="h5" fontWeight="bold" color="#2C3E50">
          Welcome to Inventory Management System
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ marginTop: 2 }}>
          Manage your Receipts, Handling & Storage, Removals, and Client information efficiently.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ marginTop: 3 }}
          component={Link}
          to="/receipts"
        >
          Get Started
        </Button>
      </Paper>
    </Container>
  );
};



const App = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [dataEntryAnchor, setDataEntryAnchor] = useState(null);
  const [dataRetrievalAnchor, setDataRetrievalAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleMenuOpen = (event, setAnchor) => {
    setAnchor(event.currentTarget);
  };

  const handleMenuClose = (setAnchor) => {
    setAnchor(null);
  };

  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FDFAF6" }}>
      <Router>
        <AppBar position="static" sx={{ bgcolor: "#2C3E50" }}>
          <Toolbar>
            {isMobile && (
              <IconButton edge="start" color="inherit" onClick={() => toggleDrawer(true)}>
                <MenuIcon />
              </IconButton>
            )}

            <Typography
              variant="h6"
              sx={{
                flexGrow: 1,
                textAlign: isMobile ? "center" : "left",
                fontSize: isMobile ? "1.1rem" : "1.2rem",
                fontWeight: "bold",
                color: "white",
              }}>
              Inventory Management System
            </Typography>

            {!isMobile && (
              <>
                <Button color="inherit" component={Link} to="/" sx={{ color: "white" }}>
                  Home
                </Button>
                {/* <Button color="inherit" component={Link} to="/receipts" sx={{ color: "white" }}>
                Receipts
              </Button> */}

                {/* Data Entry Dropdown */}
                <Button
                  color="inherit"
                  endIcon={<ArrowDropDownIcon />}
                  onClick={(event) => handleMenuOpen(event, setDataEntryAnchor)}
                  sx={{ color: "white" }}
                >
                  Data Entry
                </Button>
                <Menu
                  anchorEl={dataEntryAnchor}
                  open={Boolean(dataEntryAnchor)}
                  onClose={() => handleMenuClose(setDataEntryAnchor)}
                >
                  <MenuItem component={Link} to="/receipts">Receipts</MenuItem>
                  <MenuItem component={Link} to="/handling_and_storage">Handling & Storage</MenuItem>
                  <MenuItem component={Link} to="/removals">Removals</MenuItem>
                  <MenuItem component={Link} to="/clients_info">Clients Info</MenuItem>
                </Menu>

                {/* Data Retrieval Dropdown */}
                <Button
                  color="inherit"
                  endIcon={<ArrowDropDownIcon />}
                  onClick={(event) => handleMenuOpen(event, setDataRetrievalAnchor)}
                  sx={{ color: "white" }}
                >
                  Data Retrieval
                </Button>
                <Menu
                  anchorEl={dataRetrievalAnchor}
                  open={Boolean(dataRetrievalAnchor)}
                  onClose={() => handleMenuClose(setDataRetrievalAnchor)}
                >
                  <MenuItem component={Link} to="/retrieve">Receipts Data</MenuItem>
                  <MenuItem component={Link} to="/retrieve_handling">Handling & Storage Data</MenuItem>
                  <MenuItem component={Link} to="/retrieve_removals">Removals Data</MenuItem>
                  <MenuItem component={Link} to="/retrieve_clients">Clients Data</MenuItem>
                </Menu>

                {/* MTR Information */}
                <Button color="inherit" component={Link} to="/mtr_info" sx={{ color: "white" }}>
                  MTR
                </Button>
              </>
            )}

            {/* Avatar and User Menu */}
            <IconButton onClick={(event) => handleMenuOpen(event, setAnchorEl)} sx={{ marginLeft: 2 }}>
              <Avatar alt="User" src="/avatar.png" />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => handleMenuClose(setAnchorEl)}>
              <MenuItem>User 123</MenuItem>
              <MenuItem>+1234567890</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Mobile Side Drawer */}
        <Drawer anchor="left" open={drawerOpen} onClose={() => toggleDrawer(false)}>
          <Box sx={{ width: 250 }} role="presentation" onClick={() => toggleDrawer(false)}>
            <List>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/">
                  <ListItemText primary="Home" />
                </ListItemButton>
              </ListItem>

              {/* Data Entry Dropdown */}
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText primary="Data Entry" />
                </ListItemButton>
              </ListItem>
              <List sx={{ pl: 4 }}>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/receipts">
                    <ListItemText primary="Receipts" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/handling_and_storage">
                    <ListItemText primary="Handling & Storage" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/removals">
                    <ListItemText primary="Removals" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/clients_info">
                    <ListItemText primary="Clients Info" />
                  </ListItemButton>
                </ListItem>
              </List>

              {/* Data Retrieval Dropdown */}
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText primary="Data Retrieval" />
                </ListItemButton>
              </ListItem>
              <List sx={{ pl: 4 }}>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/retrieve">
                    <ListItemText primary="Receipts Data" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/retrieve_handling">
                    <ListItemText primary="Handling & Storage Data" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/retrieve_removals">
                    <ListItemText primary="Removals Data" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/retrieve_clients">
                    <ListItemText primary="Clients Data" />
                  </ListItemButton>
                </ListItem>
              </List>

              <ListItem disablePadding>
                <ListItemButton component={Link} to="/mtr_info">
                  <ListItemText primary="MTR Information" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Drawer>


        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/receipts" element={<ReceiptsTable />} />
          <Route path="/handling_and_storage" element={<Handling_And_Storage />} />
          <Route path="/removals" element={<Removals />} />
          <Route path="/clients_info" element={<ClientsInfo />} />
          <Route path="/retrieve" element={<DataRetrieval />} />
          <Route path="/retrieve_handling" element={<DataRetrieval_handling />} />
          <Route path="/retrieve_removals" element={<DataRetrieval_removals />} />
          <Route path="/retrieve_clients" element={<DataRetrieval_clientsInfo />} />
          <Route path="/mtr_info" element={<MTR_Information></MTR_Information>} />
        </Routes>
      </Router>
    </Box>
  );
};

export default App;
