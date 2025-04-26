"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  idToken: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [idToken, setIdToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("idToken");
    }
    return null;
  });

  const login = (token: string) => {
    setIdToken(token);
    localStorage.setItem("idToken", token); // Save token to localStorage
  };

  const logout = () => {
    setIdToken(null);
    localStorage.removeItem("idToken"); // Clear token from localStorage
  };

  const value = {
    idToken,
    login,
    logout,
    isLoggedIn: !!idToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
