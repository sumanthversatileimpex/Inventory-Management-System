import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  Typography,
  Button,
  Container,
  Paper,
} from "@mui/material";
import itlLogo from "/images/ITL Logo.jpg";;

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

export default HomePage;