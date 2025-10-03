import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  signInWithPopup,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db, googleProvider } from './config.js';
import { generateRandomUsername } from './userService.js';

// Email/Password Sign Up
export const signUpWithEmail = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Generate a random username
    const randomUsername = generateRandomUsername(userData.firstName, userData.lastName);
    
    // Update user profile with display name
    await updateProfile(user, {
      displayName: `${userData.firstName} ${userData.lastName}`
    });
    
    // Create user document in Firestore with generated username
    const firestoreResult = await createUserDocument(user.uid, {
      ...userData,
      username: randomUsername,
      email: user.email,
      emailVerified: false, // Mark as unverified initially
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    if (!firestoreResult.success) {
      console.error('Failed to create user document in Firestore:', firestoreResult.error);
    }
    
    // Send email verification to check if email actually exists
    try {
      await sendEmailVerification(user);
      console.log('Verification email sent successfully');
    } catch (verificationError) {
      console.error('Failed to send verification email:', verificationError);
      // Don't fail signup if verification email fails, but log the error
    }
    
    return { success: true, user };
  } catch (error) {
    // Handle specific Firebase auth errors
    if (error.code === 'auth/email-already-in-use') {
      return { success: false, error: 'Email is already registered. Please use a different email or try signing in.' };
    } else if (error.code === 'auth/weak-password') {
      return { success: false, error: 'Password is too weak. Please choose a stronger password.' };
    } else if (error.code === 'auth/invalid-email') {
      return { success: false, error: 'Invalid email address. Please enter a valid email.' };
    }
    
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
      const firstName = user.displayName?.split(' ')[0] || '';
      const lastName = user.displayName?.split(' ').slice(1).join(' ') || '';
      const randomUsername = generateRandomUsername(firstName, lastName);
      
      const firestoreResult = await createUserDocument(user.uid, {
        firstName,
        lastName,
        username: randomUsername,
        email: user.email,
        emailVerified: true, // Google emails are already verified
        phone: '',
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
    // Normalize username to lowercase for consistency
    const normalizedUserData = {
      ...userData,
      username: userData.username ? userData.username.toLowerCase().trim() : userData.username
    };
    
    await setDoc(doc(db, 'users', uid), normalizedUserData);
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

// Send password reset email
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: 'Password reset email sent successfully' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send email verification
export const sendEmailVerificationToUser = async (user) => {
  try {
    await sendEmailVerification(user);
    return { success: true, message: 'Verification email sent successfully' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update user password (requires reauthentication)
export const updateUserPassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    // Reauthenticate user with current password
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);
    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Check if user email is verified
export const isEmailVerified = () => {
  const user = auth.currentUser;
  return user ? user.emailVerified : false;
};

// Auth state observer
export const onAuthStateChange = (callback) => {
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    callback(firebaseUser);
  });
  
  return unsubscribe;
};
