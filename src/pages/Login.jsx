import { useState } from "react";
import { supabase } from "../context/supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { Container, TextField, Button, Typography, Box, Paper } from "@mui/material";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
    } else {
      navigate("/home");
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, textAlign: "center" }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" fullWidth variant="contained"  color="primary" sx={{ mt: 2 }}>
            Login
          </Button>
        </form>
        <Box mt={2}>
          <Typography variant="body2">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;