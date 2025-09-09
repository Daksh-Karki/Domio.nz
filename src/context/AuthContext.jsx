import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, signOutUser, getUserDocument } from '../firebase/auth.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    console.log('AuthContext: Initializing auth state listener');
    
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      console.log('AuthContext: Auth state changed', firebaseUser ? 'User logged in' : 'User logged out');
      
      if (firebaseUser) {
        // Get additional user data from Firestore
        try {
          const userDoc = await getUserDocument(firebaseUser.uid);
          if (userDoc.success) {
            const userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              ...userDoc.data
            };
            console.log('AuthContext: User data loaded from Firestore', userData);
            setUser(userData);
          } else {
            // Fallback to basic Firebase user data
            const fallbackUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              firstName: firebaseUser.displayName?.split(' ')[0] || '',
              lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
              username: firebaseUser.displayName?.replace(/\s+/g, '').toLowerCase() || '',
              role: 'tenant'
            };
            console.log('AuthContext: Using fallback user data', fallbackUser);
            setUser(fallbackUser);
          }
        } catch (error) {
          console.error('AuthContext: Error fetching user data:', error);
          // Fallback to basic Firebase user data
          const fallbackUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            firstName: firebaseUser.displayName?.split(' ')[0] || '',
            lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
            username: firebaseUser.displayName?.replace(/\s+/g, '').toLowerCase() || '',
            role: 'tenant'
          };
          console.log('AuthContext: Using fallback user data after error', fallbackUser);
          setUser(fallbackUser);
        }
      } else {
        console.log('AuthContext: No user, setting user to null');
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      console.log('AuthContext: Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await signOutUser();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
