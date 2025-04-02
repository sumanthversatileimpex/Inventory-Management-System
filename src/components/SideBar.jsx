import React, { useState } from "react";
import { Link } from "react-router-dom";
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
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";

const SideBar = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery("(max-width:600px)");

    const toggleDrawer = (open) => {
        setDrawerOpen(open);
    };

    return (
        <>

        </>
    );
};

export default SideBar;
