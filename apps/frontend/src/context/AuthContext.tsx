"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback, // Added useCallback
} from "react";
import {
  getAuth,
  onAuthStateChanged,
  User, // Import User type
  signOut as firebaseSignOut, // Import signOut
  // You might also need signInWithEmailAndPassword, createUserWithEmailAndPassword, etc.
  // depending on how your LoginModal.tsx actually performs the Firebase login.
} from "firebase/auth";
import { app } from "@/lib/firebase"; // Your Firebase app instance

interface AuthContextType {
  currentUser: User | null; // Expose the Firebase User object
  idToken: string | null;
  // login function might need to be re-thought if Firebase handles actual login
  // For now, let's assume login in your UI triggers Firebase login, then onAuthStateChanged handles the rest.
  // If 'login' was just for setting a token from somewhere else, its purpose changes.
  // Let's keep a way to manually trigger token refresh if needed.
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

  // Auto-refresh ID token periodically (Firebase SDK handles this automatically for current user)
  // The user.getIdToken(true) in fetchAndSetIdToken is for explicit refresh.
  // Firebase itself will try to keep the token fresh internally.
  // However, if you want an explicit periodic refresh on top of Firebase's internal handling:
  useEffect(() => {
    if (currentUser) {
      // Only run interval if there's a user
      const interval = setInterval(async () => {
        console.log("Attempting periodic token refresh...");
        await refreshIdToken();
      }, 240000); // e.g., every 4 minutes (Firebase tokens expire in 1 hr)
      // Adjust interval as needed, but Firebase is usually good about this.
      // 55 minutes is often suggested: 55 * 60 * 1000

      return () => clearInterval(interval);
    }
  }, [currentUser, refreshIdToken]);

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth); // Sign out from Firebase
      // onAuthStateChanged will handle setting currentUser and idToken to null
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      // onAuthStateChanged will set loading to false after state update
      // If immediate UI feedback is needed, you can set idToken and currentUser to null here too,
      // but onAuthStateChanged is the source of truth.
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
