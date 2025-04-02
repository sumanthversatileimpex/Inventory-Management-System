import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser , faRightFromBracket} from "@fortawesome/free-solid-svg-icons";

import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import itlLogo from "/images/ITL Logo.jpg";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [dataEntryAnchor, setDataEntryAnchor] = useState(null);
  const [dataRetrievalAnchor, setDataRetrievalAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { logout, user, userData } = useAuth();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const handleMenuOpen = (event, setAnchor) => {
    setAnchor(event.currentTarget);
  };

  const handleMenuClose = (setAnchor) => {
    setAnchor(null);
  };

  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth-inventory");
  };

  return (
    <>
      {user && (<>
        <AppBar position="sticky" sx={{ bgcolor: "#2C3E50" }}>
          <Toolbar>
            {isMobile && (
              <IconButton edge="start" color="inherit" onClick={() => toggleDrawer(true)}>
                <MenuIcon />
              </IconButton>
            )}

            {!isMobile && (
              <Box sx={{ marginRight: 2 }}>
                <img src={itlLogo} alt="Logo" width="35" height="35" />
              </Box>
            )}

            <Typography
              variant="h6"
              sx={{
                flexGrow: 1,
                textAlign: isMobile ? "center" : "left",
                fontSize: isMobile ? "1rem" : "1.1rem",
                fontWeight: "bold",
                color: "white",
              }}>
              Inventory Management System
            </Typography>

            {!isMobile && (
              <>
                <Button color="inherit" component={Link} to="/home" sx={{ color: "white" }}>
                  Home
                </Button>

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
                  <MenuItem component={Link} onClick={() => handleMenuClose(setDataEntryAnchor)} to="/receipts">Receipts</MenuItem>
                  <MenuItem component={Link} onClick={() => handleMenuClose(setDataEntryAnchor)} to="/handling_and_storage">Handling & Storage</MenuItem>
                  <MenuItem component={Link} onClick={() => handleMenuClose(setDataEntryAnchor)} to="/removals">Removals</MenuItem>
                  <MenuItem component={Link} onClick={() => handleMenuClose(setDataEntryAnchor)} to="/clients_info">Clients Info</MenuItem>
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
                  <MenuItem component={Link} onClick={() => handleMenuClose(setDataRetrievalAnchor)} to="/retrieve">Receipts Data</MenuItem>
                  <MenuItem component={Link} onClick={() => handleMenuClose(setDataRetrievalAnchor)} to="/retrieve_handling">Handling & Storage Data</MenuItem>
                  <MenuItem component={Link} onClick={() => handleMenuClose(setDataRetrievalAnchor)} to="/retrieve_removals">Removals Data</MenuItem>
                  <MenuItem component={Link} onClick={() => handleMenuClose(setDataRetrievalAnchor)} to="/retrieve_clients">Clients Data</MenuItem>
                </Menu>

                {/* MTR Information */}
                <Button color="inherit" component={Link} to="/mtr_info" sx={{ color: "white" }}>
                  MTR
                </Button>
              </>
            )}

            {/* Avatar and User Menu */}
            <IconButton onClick={(event) => handleMenuOpen(event, setAnchorEl)} sx={{ marginLeft: 2 }}>
              <Avatar sx={{ bgcolor: "#FDFAF6", color: "#2C3E50" }}>
                <FontAwesomeIcon icon={faUser} />
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => handleMenuClose(setAnchorEl)}>
              <MenuItem sx={{ color: "#2C3E50" }} onClick={() => handleMenuClose(setAnchorEl)}>{userData.name}</MenuItem>
              <MenuItem sx={{ color: "#2C3E50" }} onClick={() => handleMenuClose(setAnchorEl)}>{userData.phone}</MenuItem>
              <MenuItem
              sx={{ color: "#2C3E50" }}
                onClick={() => {
                  handleMenuClose(setAnchorEl); 
                  handleLogout(); 
                }}
              >
               Logout <FontAwesomeIcon icon={faRightFromBracket} style={{ marginLeft: "10px", color: "2C3E50" }} /> 
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Mobile Side Drawer */}
        <Drawer anchor="left" open={drawerOpen} onClose={() => toggleDrawer(false)}>
          <Box sx={{ width: 250 }} role="presentation" onClick={() => toggleDrawer(false)}>
            <List>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/home">
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
                  <ListItemText primary="MTR" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Drawer>
      </>)}
    </>


  );
};

export default NavBar;
