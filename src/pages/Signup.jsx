import { useState } from "react";
import { supabase } from "../context/supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { Container, TextField, Button, Typography, Paper, Box } from "@mui/material";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({ email, password ,
      options: {
      data: {
        full_name: username,
        phone: phone,
      },
    },
  });
    
    if (error) {
      alert(error.message);
    } else {
      const { user } = data;
      
      // Save additional user data
      await supabase.from("profiles").insert([{ id: user.id, username, phone, email }]);
      
      alert("Check your email for a confirmation link!");
      navigate("/login");
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 5, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>Sign Up</Typography>
        <Box component="form" onSubmit={handleSignup}>
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Sign Up</Button>
        </Box>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account? <Link to="/login">Login</Link>
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          <Link to="/forgot-password">Forgot Password?</Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default Signup;