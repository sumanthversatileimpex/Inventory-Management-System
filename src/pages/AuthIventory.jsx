import { useState } from "react";
import { supabase } from "../context/supabaseClient";
import { useNavigate } from "react-router-dom";
import { 
  Container, 
  TextField, 
  Button, 
  Paper, 
  Box, 
  Tabs, 
  Tab,
  Snackbar,
  Alert
} from "@mui/material";
import itlLogo from "/images/ITL Logo.jpg";

const AuthInventory = () => {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  // Toast notification state
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success", // 'success' or 'error'
  });

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
    // Clear form fields if it was a success
    if (toast.severity === 'success') {
      setEmail("");
      setPassword("");
      setUsername("");
      setPhone("");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setToast({
        open: true,
        message: error.message,
        severity: "error",
      });
    } else {
      navigate("/home");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // First check if user already exists
    const { data: existingUsers, error: lookupError } = await supabase
      .from('profiles')
      .select('*')
      .or(`email.eq.${email},username.eq.${username}`);

    if (lookupError) {
      setToast({
        open: true,
        message: "Error checking existing users",
        severity: "error",
      });
      return;
    }

    if (existingUsers && existingUsers.length > 0) {
      setToast({
        open: true,
        message: "User with this email or username already exists",
        severity: "error",
      });
      return;
    }

    // Proceed with signup if user doesn't exist
    const { data, error } = await supabase.auth.signUp({
      email, 
      password,
      options: { data: { full_name: username, phone } },
    });

    if (error) {
      setToast({
        open: true,
        message: error.message,
        severity: "error",
      });
    } else {
      try {
        await supabase.from("profiles").insert([{ id: data.user.id, username, phone, email }]);
        setToast({
          open: true,
          message: "Check your email for confirmation!",
          severity: "success",
        });
        setIsLogin(true);
      } catch (dbError) {
        setToast({
          open: true,
          message: dbError.message,
          severity: "error",
        });
      }
    }
  };

  return (
    <Box minHeight='100vh' sx={{ background: "linear-gradient(to right, #003366, #004080, #0059b3, #0073e6)" }}>
      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 6 }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toast.severity}
          sx={{
            backgroundColor: toast.severity === 'success' 
              ? 'rgba(46, 125, 50, 0.7)' 
              : 'rgba(211, 47, 47, 0.7)',
            color: 'white',
            width: '100%',
            '& .MuiAlert-icon': {
              color: 'white',
            },
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ p: 3, mt: 8, textAlign: "center" }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <img src={itlLogo} alt="Company Logo" style={{ width: "100px", height: "auto" }} />
          </Box>
          <Tabs value={tab} onChange={(e, newTab) => setTab(newTab)} centered>
            <Tab label="Login" />
            <Tab label="Sign Up" />
          </Tabs>
          {tab === 0 ? (
            <Box component="form" onSubmit={handleLogin}>
              <TextField fullWidth label="Email" type="email" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <TextField fullWidth label="Password" type="password" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 2 }}>Login</Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSignup}>
              <TextField fullWidth label="Username" margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} required />
              <TextField fullWidth label="Phone" type="tel" margin="normal" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              <TextField fullWidth label="Email" type="email" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <TextField fullWidth label="Password" type="password" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 2 }}>Sign Up</Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthInventory;