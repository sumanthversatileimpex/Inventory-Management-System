import React , { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link ,Navigate } from "react-router-dom";
import {Box} from "@mui/material";
import { supabase } from "./context/supabaseClient";

import { AuthProvider } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import ReceiptsTable from "./pages/data_entry/ReceiptsTable";
import Handling_And_Storage from "./pages/data_entry/Handling_And_Storage";
import Removals from "./pages/data_entry/Removals";
import ClientsInfo from "./pages/data_entry/ClientsInfo";
import DataRetrieval from "./pages/data_retrivals/DataRetrieval";
import DataRetrieval_handling from "./pages/data_retrivals/DataRetrieval_handling";
import DataRetrieval_removals from "./pages/data_retrivals/DataRetrieval_removals";
import DataRetrieval_clientsInfo from "./pages/data_retrivals/DataRetrieval_clientsInfo";
import MTR_Information from "./pages/data_entry/MTR_Information";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivateRoute from "./components/PrivateRoute";
import ForgotPassword from "./pages/ForgotPassword";
import AuthInventory from "./pages/AuthIventory";
import LoadingSpinner from "./components/LoadingSpinner";
import BalanceAndExtensions from "./pages/data_entry/Balance_And_Extensions";
import DataRetrieval_balance from "./pages/data_retrivals/DataRetrieval_balance";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Initially null to track loading state

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session); // Set true if session exists
    };
    checkUser();
  }, []);

  if (isAuthenticated === null) {
    return <LoadingSpinner/>;
    // return <div>loading...</div>;
  }
  
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
          <Route path="/" element={isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/auth-inventory" replace />} />
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
          <Route path="/balance_ext" element={<PrivateRoute><BalanceAndExtensions /></PrivateRoute>} />
          <Route path="/retrieve_balance" element={<PrivateRoute><DataRetrieval_balance /></PrivateRoute>} />
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
