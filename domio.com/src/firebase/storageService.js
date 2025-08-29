import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config.js';

// Upload profile image to Firebase Storage
export const uploadProfileImage = async (uid, imageFile) => {
  try {
    // Create a reference to the profile image location
    const imageRef = ref(storage, `profile-images/${uid}/profile.jpg`);
    
    // Upload the image file
    const snapshot = await uploadBytes(imageRef, imageFile);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return { success: true, url: downloadURL };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete profile image from Firebase Storage
export const deleteProfileImage = async (uid) => {
  try {
    const imageRef = ref(storage, `profile-images/${uid}/profile.jpg`);
    await deleteObject(imageRef);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get profile image URL from Firebase Storage
export const getProfileImageURL = async (uid) => {
  try {
    const imageRef = ref(storage, `profile-images/${uid}/profile.jpg`);
    const url = await getDownloadURL(imageRef);
    return { success: true, url };
  } catch (error) {
    // If image doesn't exist, return null (this is normal for new users)
    if (error.code === 'storage/object-not-found') {
      return { success: true, url: null };
    }
    return { success: false, error: error.message };
  }
};
