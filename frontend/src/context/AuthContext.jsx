import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDoc = await getDoc(doc(db, 'farmers', firebaseUser.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data());
          } else {
            setProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: 'farmer',
              fullName: firebaseUser.displayName || 'Farmer'
            });
          }
        } catch (e) {
          console.error('Error fetching user profile from Firestore:', e);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Register farmer
  const registerFarmer = async ({
    email,
    password,
    fullName,
    phone,
    village,
    cropsGrown = ['potato'],
    soilType = 'Loamy',
    farmSize = 1.0,
    locationGps = null
  }) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const userProfile = {
        uid: cred.user.uid,
        email,
        fullName,
        phone,
        village,
        cropsGrown,
        soilType,
        farmSize: Number(farmSize),
        locationGps,
        role: 'farmer',
        status: 'active',
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'farmers', cred.user.uid), userProfile);
        setProfile(userProfile);
        toast.success('Registration successful!');
      } catch (firestoreErr) {
        console.error('Firestore profile save failed:', firestoreErr);
        setProfile(userProfile);
        if (firestoreErr.code === 'permission-denied') {
          toast.error('Account registered in Auth, but Firestore Security Rules blocked creating the profile. Please update rules in Firebase Console.', { duration: 8000 });
        } else {
          toast.error(`Database error: ${firestoreErr.message}`);
        }
      }
      return userProfile;
    } catch (error) {
      toast.error(error.message || 'Registration failed.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      try {
        const userDoc = await getDoc(doc(db, 'farmers', cred.user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.status === 'deactivated' || data.status === 'suspended') {
            await signOut(auth);
            throw new Error('This account has been suspended or deactivated. Please contact an administrator.');
          }
          setProfile(data);
        } else {
          setProfile({
            uid: cred.user.uid,
            email: cred.user.email,
            role: 'farmer',
            fullName: cred.user.displayName || 'Farmer'
          });
        }
      } catch (docErr) {
        if (docErr.message?.includes('suspended') || docErr.message?.includes('deactivated')) throw docErr;
        console.warn('Could not read user profile from Firestore:', docErr);
        setProfile({
          uid: cred.user.uid,
          email: cred.user.email,
          role: 'farmer',
          fullName: cred.user.displayName || 'Farmer'
        });
      }
      toast.success('Welcome back!');
    } catch (error) {
      toast.error(error.message || 'Login failed.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
    toast.success('Signed out.');
  };

  // Reset password
  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
    toast.success(`Password reset email sent to ${email}`);
  };

  // Update profile
  const updateFarmerProfile = async (updates) => {
    if (!profile) return;
    try {
      await updateDoc(doc(db, 'farmers', profile.uid), updates);
      setProfile(prev => ({ ...prev, ...updates }));
      toast.success('Profile updated.');
    } catch (e) {
      toast.error('Failed to update profile.');
      throw e;
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAdmin,
      loading,
      registerFarmer,
      login,
      logout,
      resetPassword,
      updateFarmerProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
