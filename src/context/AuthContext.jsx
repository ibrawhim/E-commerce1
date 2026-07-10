import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("bcommerce-user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  function login(userData, token) {
    localStorage.setItem("bcommerce-user", JSON.stringify(userData));
    localStorage.setItem("userId", userData._id);
    localStorage.setItem("token", token);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("bcommerce-user");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    setUser(null);
  }

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}