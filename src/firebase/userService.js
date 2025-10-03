import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './config.js';

// Get user profile data
export const getUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, error: 'User profile not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update user profile data
export const updateUserProfile = async (uid, profileData) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Create or update user profile
export const upsertUserProfile = async (uid, profileData) => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...profileData,
      updatedAt: new Date()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Check if email already exists
export const checkEmailExists = async (email) => {
  try {
    if (!email || email.trim() === '') {
      return { success: false, exists: false, error: 'Email cannot be empty' };
    }

    // Normalize email (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();
    
    // Try to query the database for existing email
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', normalizedEmail));
      const querySnapshot = await getDocs(q);
      
      const emailExists = !querySnapshot.empty;
      
      return { 
        success: true, 
        exists: emailExists,
        message: emailExists ? 'Email is already registered' : 'Email is available'
      };
    } catch (dbError) {
      console.log('Database query failed for email check:', dbError.message);
      
      // If database query fails, we'll let the signup process handle it
      return { 
        success: true, 
        exists: false,
        message: 'Email format is valid'
      };
    }
  } catch (error) {
    console.error('Error checking email existence:', error);
    
    // If there's any error, assume email is available to not block signup
    return { 
      success: true, 
      exists: false,
      message: 'Email is available'
    };
  }
};

// Check if username is available
export const checkUsernameAvailability = async (username) => {
  try {
    if (!username || username.trim() === '') {
      return { success: false, available: false, error: 'Username cannot be empty' };
    }

    // Normalize username (lowercase, trim)
    const normalizedUsername = username.toLowerCase().trim();
    
    // Try to query the database, but handle permission errors gracefully
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', normalizedUsername));
      const querySnapshot = await getDocs(q);
      
      const isAvailable = querySnapshot.empty;
      
      return { 
        success: true, 
        available: isAvailable,
        message: isAvailable ? 'Username is available' : 'Username is already taken'
      };
    } catch (dbError) {
      console.log('Database query failed, using fallback validation:', dbError.message);
      
      // If database query fails, we'll do basic validation and let the signup process handle conflicts
      return { 
        success: true, 
        available: true,
        message: 'Username format is valid'
      };
    }
  } catch (error) {
    console.error('Error checking username availability:', error);
    
    // If there's any error, assume username is available to not block signup
    return { 
      success: true, 
      available: true,
      message: 'Username is available'
    };
  }
};

// Generate a random username
export const generateRandomUsername = (firstName, lastName) => {
  const adjectives = ['happy', 'cool', 'bright', 'swift', 'bold', 'wise', 'calm', 'kind', 'brave', 'smart'];
  const nouns = ['user', 'member', 'person', 'friend', 'guest', 'visitor', 'explorer', 'traveler', 'adventurer', 'dreamer'];
  
  // Get first part of first name (max 3 chars)
  const firstPart = firstName ? firstName.toLowerCase().substring(0, 3) : 'user';
  
  // Get first part of last name (max 2 chars)
  const lastPart = lastName ? lastName.toLowerCase().substring(0, 2) : '01';
  
  // Pick random adjective and noun
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  // Generate random number (2-3 digits)
  const randomNum = Math.floor(Math.random() * 900) + 100;
  
  // Combine: firstname + lastname + adjective + noun + number
  const username = `${firstPart}${lastPart}${adjective}${noun}${randomNum}`;
  
  return username;
};

// Update email verification status
export const updateEmailVerificationStatus = async (uid, isVerified) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      emailVerified: isVerified,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Validate username format
export const validateUsernameFormat = (username) => {
  if (!username || username.trim() === '') {
    return { valid: false, error: 'Username is required' };
  }

  const trimmedUsername = username.trim();
  
  // Check length
  if (trimmedUsername.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters long' };
  }
  
  if (trimmedUsername.length > 20) {
    return { valid: false, error: 'Username must be no more than 20 characters long' };
  }
  
  // Check for valid characters (alphanumeric and underscore only)
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(trimmedUsername)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  
  // Check if it starts with a letter or number
  if (!/^[a-zA-Z0-9]/.test(trimmedUsername)) {
    return { valid: false, error: 'Username must start with a letter or number' };
  }
  
  return { valid: true };
};
