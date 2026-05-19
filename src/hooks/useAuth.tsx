import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, getDocFromServer } from "firebase/firestore";
import { auth, db, signInWithGoogle } from "@/src/lib/firebase";
import { UserProfile } from "@/src/types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Connection test
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, "_connection_test_", "ping"));
      } catch (error: any) {
        if (error.message?.includes("offline") || error.code === "unavailable") {
          console.error("Firebase is offline or unavailable:", error);
          setAuthError("Could not connect to Firebase. Please check your internet connection.");
        }
      }
    };
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthError(null);
      setUser(user);
      if (user) {
        try {
          // Fetch or create profile
          const userDoc = doc(db, "users", user.uid);
          const snapshot = await getDoc(userDoc);
          
          if (snapshot.exists()) {
            setProfile(snapshot.data() as UserProfile);
          } else {
            const newProfileData = {
              uid: user.uid,
              displayName: user.displayName || "GBC Student",
              email: user.email || "",
              photoURL: user.photoURL || "",
              role: "student",
              isVerified: false,
              createdAt: serverTimestamp(),
            };
            await setDoc(userDoc, newProfileData);
            setProfile({ ...newProfileData, createdAt: new Date().toISOString() } as UserProfile);
          }
        } catch (error) {
          console.error("Profile sync failed:", error);
          setAuthError("Failed to sync user profile. Check your internet connection or try again.");
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.code === "auth/popup-blocked") {
        setAuthError("Sign-in popup was blocked by your browser. Please allow popups for this site.");
      } else if (error.code === "auth/cancelled-popup-request") {
        // Ignore user cancellation
      } else {
        setAuthError(`Login failed: ${error.message || "Unknown error"}`);
      }
    }
  };

  const logout = () => auth.signOut();

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, authError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
