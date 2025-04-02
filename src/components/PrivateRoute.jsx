import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Prevent redirection while checking auth state
  }

  return user ? children : <Navigate to="/auth-inventory" replace />;
};

export default PrivateRoute;
