import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner/>; // Prevent redirection while checking auth state
  }

  return user ? children : <Navigate to="/auth-inventory" replace />;
};

export default PrivateRoute;
