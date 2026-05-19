import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, signInWithGoogle } from "@/src/lib/firebase";
import { UserProfile } from "@/src/types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
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
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = () => auth.signOut();

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
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
