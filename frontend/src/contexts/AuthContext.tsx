import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface CustomUser {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL: string | null;
  onboardingCompleted?: boolean;
  onboardingData?: any;
}

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<any>;
  loginAnonymously: () => Promise<any>;
  loginWithEmail: (email: string, pass: string) => Promise<any>;
  registerWithEmail: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
  completeOnboarding: (data: any) => Promise<void>;
  onboardingData: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const googleProvider = new GoogleAuthProvider();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingData, setOnboardingData] = useState<any>(null);

  /** Build a CustomUser from a Firebase User + optional Firestore data */
  const buildCustomUser = (firebaseUser: User, firestoreData?: any): CustomUser => ({
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || "Student",
    photoURL: firebaseUser.photoURL,
    onboardingCompleted: firestoreData?.onboardingCompleted || false,
    onboardingData: firestoreData?.onboardingData || null,
  });

  /** Load Firestore profile with a timeout so it never hangs */
  const loadFirestoreProfile = async (uid: string): Promise<any> => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Firestore timeout")), 5000),
      );
      const docPromise = getDoc(doc(db, "users", uid));
      const userDoc = (await Promise.race([docPromise, timeoutPromise])) as any;
      return userDoc?.exists?.() ? userDoc.data() : null;
    } catch {
      // Firestore may fail for anonymous users, network issues, or timeout — continue gracefully
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Ensure persistence is set to LOCAL so sessions survive page reloads
    setPersistence(auth, browserLocalPersistence).catch(() => {});

    // Handle any pending redirect result (Google redirect flow)
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user && isMounted) {
          console.log("[Auth] Redirect sign-in completed for:", result.user.email);
        }
      })
      .catch((err) => {
        // auth/credential-already-in-use can happen if user was anonymous first
        console.warn("[Auth] Redirect result error:", err?.code || err);
      });

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      if (firebaseUser) {
        console.log("[Auth] User detected:", firebaseUser.uid, firebaseUser.email || "(anonymous)");
        const firestoreData = await loadFirestoreProfile(firebaseUser.uid);
        if (!isMounted) return;

        const customUser = buildCustomUser(firebaseUser, firestoreData);
        setUser(customUser);
        setOnboardingData(firestoreData?.onboardingData || null);
      } else {
        console.log("[Auth] No user — signed out");
        setUser(null);
        setOnboardingData(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const loginWithGoogle = useCallback(async () => {
    // Try popup first; fall back to redirect if popup is blocked
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } catch (err: any) {
      const code = err?.code;
      console.warn("[Auth] Popup sign-in error:", code);

      if (
        code === "auth/popup-blocked" ||
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request"
      ) {
        // Fallback to redirect-based sign-in
        console.log("[Auth] Falling back to redirect sign-in");
        return signInWithRedirect(auth, googleProvider);
      }
      throw err;
    }
  }, []);

  const loginAnonymously = useCallback(async () => {
    return signInAnonymously(auth);
  }, []);

  const loginWithEmail = useCallback(async (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  }, []);

  const registerWithEmail = useCallback(async (email: string, pass: string) => {
    return createUserWithEmailAndPassword(auth, email, pass);
  }, []);

  const logout = useCallback(async () => {
    console.log("[Auth] Logging out...");
    setUser(null);
    setOnboardingData(null);
    await signOut(auth);
    console.log("[Auth] Logged out successfully");
  }, []);

  const completeOnboarding = useCallback(
    async (data: any) => {
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(
          userRef,
          {
            onboardingCompleted: true,
            onboardingData: data,
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
      } catch {
        // If Firestore write fails, still update local state
      }

      setUser((prev) =>
        prev ? { ...prev, onboardingCompleted: true, onboardingData: data } : null,
      );
      setOnboardingData(data);
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginAnonymously,
        loginWithEmail,
        registerWithEmail,
        logout,
        completeOnboarding,
        onboardingData,
      }}
    >
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
