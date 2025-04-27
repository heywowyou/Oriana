"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";

interface AuthContextType {
  idToken: string | null;
  login: (token: string) => void;
  logout: () => void;
  refreshIdToken: () => Promise<void>;
  isLoggedIn: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("idToken");
    }
    return null;
  });

  useEffect(() => {
    const token = localStorage.getItem("idToken");
    if (token) {
      setIdToken(token);
    }
    setLoading(false);
  }, []);

  const login = (token: string) => {
    setIdToken(token);
    localStorage.setItem("idToken", token);
  };

  const logout = () => {
    setIdToken(null);
    localStorage.removeItem("idToken");
  };

  // RefreshIdToken function
  const refreshIdToken = async () => {
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken(true); // Force refresh
      setIdToken(token);
      localStorage.setItem("idToken", token); // Update localStorage
    }
  };

  const value = {
    idToken,
    login,
    logout,
    refreshIdToken,
    isLoggedIn: !!idToken,
    loading,
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
