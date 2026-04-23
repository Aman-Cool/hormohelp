import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged, signOut,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendEmailVerification, updateProfile,
  signInWithPopup, GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '../firebase';
import api from '../api/axios';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function mapFirebaseUser(fbUser) {
  return {
    id: fbUser.uid,
    email: fbUser.email,
    name: fbUser.displayName || fbUser.email?.split('@')[0] || '',
    emailVerified: fbUser.emailVerified,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const mapped = mapFirebaseUser(fbUser);
      if (fbUser.emailVerified) {
        try {
          await api.post('/users/sync', { name: mapped.name, email: mapped.email });
        } catch (_) {}
      }
      setUser(mapped);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: fbUser } = await signInWithEmailAndPassword(auth, email, password);
    return mapFirebaseUser(fbUser);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    const { user: fbUser } = await signInWithPopup(auth, provider);
    return mapFirebaseUser(fbUser);
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(fbUser, { displayName: name });
    await sendEmailVerification(fbUser);
    return { requiresVerification: true, email };
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
