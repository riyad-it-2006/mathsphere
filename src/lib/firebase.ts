import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import firebaseConfig from "@/firebase-applet-config.json";

const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Auth Helpers
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

// Firestore Operations Utility
import { OperationType } from "@/src/types"; // I'll update types to include this

export function handleFirestoreError(error: unknown, operationType: string, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
