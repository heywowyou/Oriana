"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  getAuth,
  onAuthStateChanged,
  User, // Import User type
  signOut as firebaseSignOut, // Import signOut
} from "firebase/auth";
import { app } from "@/lib/firebase";

interface AuthContextType {
  currentUser: User | null; // Expose the Firebase User object
  idToken: string | null;
  logout: () => Promise<void>; // Make logout async
  refreshIdToken: () => Promise<string | null>; // Allow returning the new token
  isLoggedIn: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const auth = getAuth(app); // Initialize Firebase Auth

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Start true until first auth check

  // Function to fetch and set ID token
  const fetchAndSetIdToken = useCallback(async (user: User | null) => {
    if (user) {
      try {
        const token = await user.getIdToken(true); // Force refresh
        setIdToken(token);
        localStorage.setItem("idToken", token); // Continue using localStorage if you like
        console.log("Fresh ID Token set in AuthContext:", token); // For testing
        return token;
      } catch (error) {
        console.error("Error refreshing ID token:", error);
        // If token refresh fails, user might be effectively logged out
        await firebaseSignOut(auth); // Sign out from Firebase
        setCurrentUser(null);
        setIdToken(null);
        localStorage.removeItem("idToken");
        return null;
      }
    } else {
      setCurrentUser(null);
      setIdToken(null);
      localStorage.removeItem("idToken");
      return null;
    }
  }, []);

  // Listener for Firebase auth state changes
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user); // Set the Firebase user object
      await fetchAndSetIdToken(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [fetchAndSetIdToken]);

  // Function to manually refresh ID token (e.g., for testing or specific needs)
  const refreshIdToken = useCallback(async () => {
    if (auth.currentUser) {
      return fetchAndSetIdToken(auth.currentUser);
    }
    console.log("No current user to refresh token for.");
    return null;
  }, [fetchAndSetIdToken]);

  useEffect(() => {
    if (currentUser) {
      // Only run interval if there's a user
      const interval = setInterval(async () => {
        console.log("Attempting periodic token refresh...");
        await refreshIdToken();
      }, 240000); // Interval length

      return () => clearInterval(interval);
    }
  }, [currentUser, refreshIdToken]);

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth); // Sign out from Firebase
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setCurrentUser(null); // Explicitly clear for immediate UI update if needed
      setIdToken(null);
      localStorage.removeItem("idToken");
      setLoading(false); // Ensure loading is false if onAuthStateChanged doesn't fire quickly enough
    }
  };

  const value = {
    currentUser, // Provide the full Firebase user object
    idToken,
    logout,
    refreshIdToken,
    isLoggedIn: !!currentUser && !!idToken, // isLoggedIn based on currentUser and token
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
