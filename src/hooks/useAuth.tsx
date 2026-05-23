import React, { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { supabase, hasSupabaseKeys } from "@/src/lib/supabase";
import { UserProfile } from "@/src/types";

export const normalizePhone = (phone: string): string => {
  const cleaned = phone.replace(/[^0-9]/g, "");
  // For Bangladesh: e.g. 8801700000000 or +8801700000000 or 01700000000
  if (cleaned.startsWith("880") && cleaned.length === 13) {
    return "0" + cleaned.slice(3);
  }
  if (cleaned.startsWith("8r") || (cleaned.startsWith("88") && cleaned.length === 13)) {
    return "0" + cleaned.slice(2);
  }
  if (cleaned.length === 10 && cleaned.startsWith("1")) {
    return "0" + cleaned;
  }
  return cleaned;
};

interface ActiveUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

interface AuthContextType {
  user: ActiveUser | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loginWithPhone: (phone: string, password: string) => Promise<void>;
  registerWithPhone: (name: string, phone: string, email: string, password: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  sendPasswordReset: (input: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ActiveUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const syncProfileFromFirestore = async (uid: string, fallbackEmail: string, fallbackName: string, fallbackPhoto: string) => {
      try {
        const userDoc = doc(db, "users", uid);
        const snapshot = await getDoc(userDoc);
        if (!active) return;

        if (snapshot.exists()) {
          setProfile(snapshot.data() as UserProfile);
        } else {
          // Create user profile in Firestore so it remains searchable and syncs with chatting/academic modules
          const newProfileData = {
            uid,
            displayName: fallbackName || "GBC Student",
            email: fallbackEmail || "",
            photoURL: fallbackPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(uid)}`,
            role: "student",
            isVerified: false,
            createdAt: serverTimestamp(),
          };
          await setDoc(userDoc, newProfileData);
          if (active) {
            setProfile({ ...newProfileData, createdAt: new Date().toISOString() } as any);
          }
        }
      } catch (err) {
        console.error("Firestore user profile sync failed:", err);
        if (active) {
          setAuthError("Auth synced, but profile matching failed. Please check connection.");
        }
      }
    };

    const handleUserSession = async (sessionUser: any) => {
      if (!sessionUser) {
        if (active) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      const mapped: ActiveUser = {
        uid: sessionUser.id,
        email: sessionUser.email || null,
        displayName: sessionUser.user_metadata?.displayName || sessionUser.email?.split("@")[0] || "GBC Student",
        photoURL: sessionUser.user_metadata?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(sessionUser.id)}`
      };

      if (active) {
        setUser(mapped);
      }

      await syncProfileFromFirestore(
        sessionUser.id, 
        sessionUser.email || "", 
        sessionUser.user_metadata?.displayName || "",
        sessionUser.user_metadata?.avatar || ""
      );

      if (active) {
        setLoading(false);
      }
    };

    // 1. Check current session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) {
        handleUserSession(session?.user || null);
      }
    }).catch(err => {
      console.error("Error retrieving initial Supabase session:", err);
      if (active) {
        setLoading(false);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      handleUserSession(session?.user || null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async () => {
    setAuthError(null);
    try {
      if (!hasSupabaseKeys()) {
        throw new Error("Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your secrets!");
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Supabase Google login failed:", error);
      setAuthError(error.message || "Failed to start Google Sign In.");
    }
  };

  const loginWithPhone = async (phone: string, password: string) => {
    setAuthError(null);
    try {
      if (!hasSupabaseKeys()) {
        throw new Error("Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your secrets!");
      }
      const trimmedPhone = phone.trim();
      const normalizedOption = normalizePhone(trimmedPhone);
      let email: string | null = null;

      // 1. Query Firestore first as it holds mappings
      try {
        const mappingDoc = await getDoc(doc(db, "phone_mappings", trimmedPhone));
        if (mappingDoc.exists()) {
          email = mappingDoc.data().email;
        } else if (normalizedOption !== trimmedPhone) {
          const normDoc = await getDoc(doc(db, "phone_mappings", normalizedOption));
          if (normDoc.exists()) {
            email = normDoc.data().email;
          }
        }
      } catch (err) {
        console.warn("Firestore mappings lookup fallback query info:", err);
      }

      // 2. If not found in Firestore, query Supabase database as fallback
      if (!email) {
        try {
          const { data, error } = await supabase
            .from("phone_mappings")
            .select("email")
            .eq("phone", trimmedPhone)
            .single();
          if (data && !error) {
            email = data.email;
          } else if (normalizedOption !== trimmedPhone) {
            const { data: normData, error: normErr } = await supabase
              .from("phone_mappings")
              .select("email")
              .eq("phone", normalizedOption)
              .single();
            if (normData && !normErr) {
              email = normData.email;
            }
          }
        } catch (supabaseErr) {
          console.warn("Supabase query phone_mappings failed:", supabaseErr);
        }
      }

      if (!email) {
        throw new Error("No account is registered with this phone number.\n(এই মোবাইল নাম্বার দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি। দয়া করে সঠিক নাম্বার দিন।)");
      }

      // Sign in using Supabase Auth with the email and password
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("Supabase signin with phone failed:", error);
      if (error.message?.includes("Invalid login credentials") || error.code === "invalid_grant" || error.message?.toLowerCase().includes("credentials")) {
        setAuthError("Incorrect phone number or password. Please verify and try again.\n(ভুল মোবাইল নাম্বার অথবা পাসওয়ার্ড। দয়া করে আবার চেষ্টা করুন।)");
      } else {
        setAuthError(error.message || "Authentication failed.");
      }
      throw error;
    }
  };

  const registerWithPhone = async (name: string, phone: string, email: string, password: string) => {
    setAuthError(null);
    try {
      if (!hasSupabaseKeys()) {
        throw new Error("Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your secrets!");
      }
      const trimmedPhone = phone.trim();
      const normalizedOption = normalizePhone(trimmedPhone);
      const trimmedEmail = email.trim();

      // Check if phone already registered in Firestore mapping or Supabase database
      let phoneExists = false;
      try {
        const mappingDoc = await getDoc(doc(db, "phone_mappings", trimmedPhone));
        if (mappingDoc.exists()) {
          phoneExists = true;
        } else if (normalizedOption !== trimmedPhone) {
          const normDoc = await getDoc(doc(db, "phone_mappings", normalizedOption));
          if (normDoc.exists()) {
            phoneExists = true;
          }
        }
      } catch (err) {
        console.warn("Firestore mapping query error:", err);
      }

      if (phoneExists) {
        throw new Error("This mobile number is already registered.\n(এই মোবাইল নাম্বারটি ইতিপূর্বে ব্যবহার করা হয়েছে।)");
      }

      // Create Supabase user
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: password,
        options: {
          data: {
            displayName: name.trim(),
            phone: trimmedPhone,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`
          }
        }
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error(
          "This email address is already registered in Supabase (possibly via Google or another login). Please log in instead, or use a different email address.\n" +
          "(এই ইমেইল অ্যাড্রেসটি ইতিপূর্বে রেজিস্টার করা হয়েছে। দয়া করে লগইন করুন অথবা অন্য কোনো ইমেইল ব্যবহার করে চেষ্টা করুন।)"
        );
      }

      const uid = data.user.id;

      // Create Firestore mapping so that custom logins work
      try {
        await setDoc(doc(db, "phone_mappings", trimmedPhone), {
          email: trimmedEmail,
          uid: uid,
          normalized: normalizedOption
        });
        if (normalizedOption !== trimmedPhone) {
          await setDoc(doc(db, "phone_mappings", normalizedOption), {
            email: trimmedEmail,
            uid: uid,
            original: trimmedPhone
          });
        }
      } catch (fsErr) {
        console.error("Failed to map phone in Firestore:", fsErr);
      }

      // Create Firestore profile record so real-time features sync seamlessly
      const newProfileData = {
        uid: uid,
        displayName: name.trim(),
        email: trimmedEmail,
        phone: trimmedPhone,
        phoneNumber: trimmedPhone,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
        role: "student",
        isVerified: false,
        createdAt: serverTimestamp(),
      };

      try {
        await setDoc(doc(db, "users", uid), newProfileData);
        setProfile({ ...newProfileData, createdAt: new Date().toISOString() } as any);
      } catch (fsErr) {
        console.error("Failed to create Firestore profile record:", fsErr);
      }

      // Optional: Store in Supabase database public.users and public.phone_mappings if schema exists (will ignore failures gracefully)
      try {
        await supabase.from("phone_mappings").insert({
          phone: trimmedPhone,
          email: trimmedEmail,
          uid: uid
        });
      } catch (sErr) {
        console.debug("Optional supabase insert failed:", sErr);
      }

    } catch (error: any) {
      console.error("Supabase registration failed:", error);
      if (error.message?.includes("User already registered") || error.code === "23505") {
        setAuthError("This email address or phone is already in use by another account.\n(এই ইমেইল বা মোবাইল নাম্বারটি অন্য কোনো অ্যাকাউন্টে ব্যবহৃত হচ্ছে।)");
      } else {
        setAuthError(error.message || "Registration failed. Please verify your data and try again.");
      }
      throw error;
    }
  };

  const sendPasswordReset = async (input: string) => {
    setAuthError(null);
    try {
      if (!hasSupabaseKeys()) {
        throw new Error("Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your secrets!");
      }
      const trimmedInput = input.trim();
      let email = trimmedInput;
      const isPhone = /^[+]?[0-9]{8,15}$/.test(trimmedInput);

      if (isPhone) {
        const normalizedOption = normalizePhone(trimmedInput);
        // Query phone mappings to get email
        try {
          const mappingDoc = await getDoc(doc(db, "phone_mappings", trimmedInput));
          if (mappingDoc.exists()) {
            email = mappingDoc.data().email;
          } else if (normalizedOption !== trimmedInput) {
            const normDoc = await getDoc(doc(db, "phone_mappings", normalizedOption));
            if (normDoc.exists()) {
              email = normDoc.data().email;
            } else {
              throw new Error("This mobile number is not registered.");
            }
          } else {
            // Also try Supabase query as fallback
            const { data } = await supabase
              .from("phone_mappings")
              .select("email")
              .eq("phone", trimmedInput)
              .single();
            if (data?.email) {
              email = data.email;
            } else {
              // Try normalized option on supabase too
              const { data: normData } = await supabase
                .from("phone_mappings")
                .select("email")
                .eq("phone", normalizedOption)
                .single();
              if (normData?.email) {
                email = normData.email;
              } else {
                throw new Error("This mobile number is not registered.\n(এই মোবাইল নাম্বারটি ডেটাবেসে রেজিস্টার করা নেই।)");
              }
            }
          }
        } catch (err: any) {
          throw new Error(err.message || "Could not retrieve email associated with this phone.");
        }
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("Supabase password reset failed:", error);
      setAuthError(error.message || "Failed to initiate recovery instructions.");
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setAuthError(null);
    try {
      if (!hasSupabaseKeys()) {
        throw new Error("Supabase keys are not set yet.");
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Supabase signin with email failed:", error);
      setAuthError(error.message || "Incorrect email or password. Please verify.");
      throw error;
    }
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
    setAuthError(null);
    try {
      if (!hasSupabaseKeys()) {
        throw new Error("Supabase keys are not set yet.");
      }
      const trimmedEmail = email.trim();
      const trimmedName = name.trim();

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: password,
        options: {
          data: {
            displayName: trimmedName,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(trimmedName)}`
          }
        }
      });

      if (error) throw error;
      if (!data.user) {
        throw new Error("An error occurred during email registration.");
      }

      const uid = data.user.id;

      // Create Firestore profile record so real-time features sync seamlessly
      const newProfileData = {
        uid: uid,
        displayName: trimmedName,
        email: trimmedEmail,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(trimmedName)}`,
        role: "student",
        isVerified: false,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", uid), newProfileData);
      setProfile({ ...newProfileData, createdAt: new Date().toISOString() } as any);

    } catch (error: any) {
      console.error("Supabase registration with email failed:", error);
      setAuthError(error.message || "Registration failed. Email might already be registered.");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      login, 
      logout, 
      loginWithPhone, 
      registerWithPhone, 
      loginWithEmail,
      registerWithEmail,
      sendPasswordReset, 
      authError 
    }}>
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
