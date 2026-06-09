import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../../firebaseConfig";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return sub;
  }, []);

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will fire and set user
  }

  async function signUp(email: string, password: string) {
    await createUserWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will fire and set user
  }

  async function logout() {
    await signOut(auth);
    // onAuthStateChanged will set user to null for us
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
