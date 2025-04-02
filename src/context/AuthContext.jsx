import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({ email: "", name: "", phone: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;

        if (data?.user) {
          setUser(data.user);
          setUserData({
            email: data.user.email,
            name: data.user.user_metadata?.full_name || "User",
            phone: data.user.user_metadata?.phone || "No Phone",
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setUserData({
          email: session.user.email,
          name: session.user.user_metadata?.full_name || "User",
          phone: session.user.user_metadata?.phone || "No Phone",
        });
      } else {
        setUser(null);
        setUserData({ email: "", name: "", phone: "" });
      }
    });

    return () => authListener?.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserData({ email: "", name: "", phone: "" });
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
