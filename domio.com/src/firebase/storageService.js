import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
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

// Upload document to Firebase Storage
export const uploadDocument = async (uid, documentFile, documentType) => {
  try {
    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const fileName = `${documentType}_${timestamp}_${documentFile.name}`;
    
    // Create a reference to the document location
    const documentRef = ref(storage, `documents/${uid}/${documentType}/${fileName}`);
    
    // Upload the document file
    const snapshot = await uploadBytes(documentRef, documentFile);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return { 
      success: true, 
      url: downloadURL,
      fileName: fileName,
      documentType: documentType,
      timestamp: timestamp,
      size: documentFile.size
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete document from Firebase Storage
export const deleteDocument = async (uid, documentType, fileName) => {
  try {
    const documentRef = ref(storage, `documents/${uid}/${documentType}/${fileName}`);
    await deleteObject(documentRef);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get all documents for a user
export const getUserDocuments = async (uid) => {
  try {
    const documentsRef = ref(storage, `documents/${uid}`);
    const result = await listAll(documentsRef);
    
    const documents = [];
    
    // Get documents from each type folder
    for (const folderRef of result.prefixes) {
      const folderName = folderRef.name;
      const folderContents = await listAll(folderRef);
      
      for (const itemRef of folderContents.items) {
        try {
          const url = await getDownloadURL(itemRef);
          const fileName = itemRef.name;
          
          // Parse filename to extract metadata
          const parts = fileName.split('_');
          const timestamp = parseInt(parts[1]);
          const originalName = parts.slice(2).join('_');
          
          documents.push({
            fileName: fileName,
            originalName: originalName,
            documentType: folderName,
            url: url,
            timestamp: timestamp,
            size: 0 // Size not available from listAll
          });
        } catch (error) {
          console.error('Error getting document URL:', error);
        }
      }
    }
    
    // Sort by timestamp (newest first)
    documents.sort((a, b) => b.timestamp - a.timestamp);
    
    return { success: true, documents };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
