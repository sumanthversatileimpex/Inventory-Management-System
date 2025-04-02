import React, { useState } from "react";
import { Container, TextField, Button, Typography, Box, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert("Forgot Password feature coming soon!");
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8, textAlign: "center" }}>
      <Typography variant="h5" gutterBottom>
        Forgot Password
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Enter your email to receive password reset instructions (Coming Soon).
      </Typography>
      <Box component="form" onSubmit={handleForgotPassword} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Email Address"
          variant="outlined"
          margin="normal"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" fullWidth variant="contained"  color="primary" sx={{ mt: 2 }}>
          Submit
        </Button>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Link href="/login" variant="body2" sx={{ mr: 2 }}>
          Back to Login
        </Link>
        <Link href="/signup" variant="body2">
          Create an Account
        </Link>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
