import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  signInWithPopup,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './config.js';

// Email/Password Sign Up
export const signUpWithEmail = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user profile with display name
    await updateProfile(user, {
      displayName: `${userData.firstName} ${userData.lastName}`
    });
    
    // Create user document in Firestore
    const firestoreResult = await createUserDocument(user.uid, {
      ...userData,
      email: user.email,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    if (!firestoreResult.success) {
      console.error('Failed to create user document in Firestore:', firestoreResult.error);
    }
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Email/Password Sign In
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user document exists, if not create one
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      const firestoreResult = await createUserDocument(user.uid, {
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        username: user.displayName?.replace(/\s+/g, '').toLowerCase() || '',
        email: user.email,
        phone: user.phoneNumber || '',
        role: 'tenant', // Default role
        about: 'I am a responsible tenant looking for a comfortable place to call home.',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      if (!firestoreResult.success) {
        console.error('Failed to create user document for Google sign-in:', firestoreResult.error);
      }
    }
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sign Out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Create user document in Firestore
export const createUserDocument = async (uid, userData) => {
  try {
    await setDoc(doc(db, 'users', uid), userData);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get user document from Firestore
export const getUserDocument = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, error: 'User document not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update user document in Firestore
export const updateUserDocument = async (uid, updateData) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      ...updateData,
      updatedAt: new Date()
    }, { merge: true });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Auth state observer
export const onAuthStateChange = (callback) => {
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    callback(firebaseUser);
  });
  
  return unsubscribe;
};
