import React from "react";
import { BrowserRouter as Router, Routes, Route, Link ,Navigate } from "react-router-dom";
import {Box} from "@mui/material";

import { AuthProvider } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import ReceiptsTable from "./pages/ReceiptsTable";
import Handling_And_Storage from "./pages/Handling_And_Storage";
import Removals from "./pages/Removals";
import ClientsInfo from "./pages/ClientsInfo";
import DataRetrieval from "./pages/DataRetrieval";
import DataRetrieval_handling from "./pages/DataRetrieval_handling";
import DataRetrieval_removals from "./pages/DataRetrieval_removals";
import DataRetrieval_clientsInfo from "./pages/DataRetrieval_clientsInfo";
import MTR_Information from "./pages/MTR_Information";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivateRoute from "./components/PrivateRoute";
import ForgotPassword from "./pages/ForgotPassword";
import AuthInventory from "./pages/AuthIventory";

const App = () => {
  return (
    <AuthProvider>
    <Box sx={{ minHeight: "100vh", 
    display: "flex", 
    flexDirection: "column",  
    fontFamily: `'Poppins', 'Avenir', 'Helvetica', 'Arial', sans-serif` }}>
      <Router>
           <NavBar/>
      {/* <NavBar/> */}
        <Routes>
          <Route path='/' element={<Navigate to="/auth-inventory" replace />} />
          <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/receipts" element={<PrivateRoute><ReceiptsTable /> </PrivateRoute>} />
          <Route path="/handling_and_storage" element={<PrivateRoute><Handling_And_Storage /></PrivateRoute>} />
          <Route path="/removals" element={<PrivateRoute><Removals /></PrivateRoute>} />
          <Route path="/clients_info" element={<PrivateRoute><ClientsInfo /></PrivateRoute>} />
          <Route path="/retrieve" element={<PrivateRoute><DataRetrieval /></PrivateRoute>} />
          <Route path="/retrieve_handling" element={<PrivateRoute><DataRetrieval_handling /></PrivateRoute>} />
          <Route path="/retrieve_removals" element={<PrivateRoute><DataRetrieval_removals /></PrivateRoute>} />
          <Route path="/retrieve_clients" element={<PrivateRoute><DataRetrieval_clientsInfo /></PrivateRoute>} />
          <Route path="/mtr_info" element={<PrivateRoute><MTR_Information /></PrivateRoute>} />
          {/* <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} /> */}
          <Route path="/auth-inventory" element={<AuthInventory />} />
        </Routes>
      </Router>
    </Box>
    </AuthProvider>
  );
};

export default App;
