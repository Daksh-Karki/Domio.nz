import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { storage, db } from './config.js';

// Upload lease document for a property
export const uploadLeaseDocument = async (propertyId, file, landlordId) => {
  try {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Only PDF and DOC files are allowed.' };
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size too large. Maximum size is 10MB.' };
    }
    
    // Create unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `lease_${propertyId}_${timestamp}.${fileExtension}`;
    
    // Create storage reference
    const storageRef = ref(storage, `properties/${propertyId}/documents/${fileName}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Update property document with lease info
    const propertyRef = doc(db, 'properties', propertyId);
    const documentData = {
      name: file.name,
      fileName: fileName,
      downloadURL: downloadURL,
      uploadedAt: new Date(),
      uploadedBy: landlordId,
      fileSize: file.size,
      fileType: file.type
    };
    
    await updateDoc(propertyRef, {
      leaseDocuments: arrayUnion(documentData),
      updatedAt: serverTimestamp()
    });
    
    return { 
      success: true, 
      data: {
        fileName: fileName,
        downloadURL: downloadURL,
        fileSize: file.size
      }
    };
  } catch (error) {
    console.error('Error uploading lease document:', error);
    return { success: false, error: error.message };
  }
};

// Get all documents for a property
export const getPropertyDocuments = async (propertyId) => {
  try {
    const propertyRef = doc(db, 'properties', propertyId);
    const propertySnap = await propertyRef.get();
    
    if (!propertySnap.exists()) {
      return { success: false, error: 'Property not found' };
    }
    
    const propertyData = propertySnap.data();
    const documents = propertyData.leaseDocuments || [];
    
    return { success: true, data: documents };
  } catch (error) {
    console.error('Error fetching property documents:', error);
    return { success: false, error: error.message };
  }
};

// Delete a lease document
export const deleteLeaseDocument = async (propertyId, documentName, landlordId) => {
  try {
    // Get property data to find the document
    const propertyRef = doc(db, 'properties', propertyId);
    const propertySnap = await propertyRef.get();
    
    if (!propertySnap.exists()) {
      return { success: false, error: 'Property not found' };
    }
    
    const propertyData = propertySnap.data();
    
    // Verify landlord ownership
    if (propertyData.landlordId !== landlordId) {
      return { success: false, error: 'Unauthorized: Property does not belong to this landlord' };
    }
    
    // Find the document to delete
    const documents = propertyData.leaseDocuments || [];
    const documentToDelete = documents.find(doc => doc.fileName === documentName);
    
    if (!documentToDelete) {
      return { success: false, error: 'Document not found' };
    }
    
    // Delete from storage
    const storageRef = ref(storage, `properties/${propertyId}/documents/${documentName}`);
    await deleteObject(storageRef);
    
    // Remove from Firestore
    await updateDoc(propertyRef, {
      leaseDocuments: arrayRemove(documentToDelete),
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting lease document:', error);
    return { success: false, error: error.message };
  }
};

// Upload property images
export const uploadPropertyImages = async (propertyId, files, landlordId) => {
  try {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB per image
    const maxImages = 10;
    
    if (files.length > maxImages) {
      return { success: false, error: `Maximum ${maxImages} images allowed` };
    }
    
    const uploadPromises = files.map(async (file, index) => {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type for ${file.name}. Only JPEG, PNG, and WebP images are allowed.`);
      }
      
      // Validate file size
      if (file.size > maxSize) {
        throw new Error(`File ${file.name} is too large. Maximum size is 5MB.`);
      }
      
      // Create unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `image_${propertyId}_${timestamp}_${index}.${fileExtension}`;
      
      // Create storage reference
      const storageRef = ref(storage, `properties/${propertyId}/images/${fileName}`);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        name: file.name,
        fileName: fileName,
        downloadURL: downloadURL,
        uploadedAt: new Date(),
        uploadedBy: landlordId,
        fileSize: file.size,
        fileType: file.type,
        isPrimary: index === 0 // First image is primary
      };
    });
    
    const uploadedImages = await Promise.all(uploadPromises);
    
    // Update property document with images
    const propertyRef = doc(db, 'properties', propertyId);
    
    await updateDoc(propertyRef, {
      images: arrayUnion(...uploadedImages),
      updatedAt: serverTimestamp()
    });
    
    return { success: true, data: uploadedImages };
  } catch (error) {
    console.error('Error uploading property images:', error);
    return { success: false, error: error.message };
  }
};

// Delete a property image
export const deletePropertyImage = async (propertyId, imageName, landlordId) => {
  try {
    // Get property data to find the image
    const propertyRef = doc(db, 'properties', propertyId);
    const propertySnap = await propertyRef.get();
    
    if (!propertySnap.exists()) {
      return { success: false, error: 'Property not found' };
    }
    
    const propertyData = propertySnap.data();
    
    // Verify landlord ownership
    if (propertyData.landlordId !== landlordId) {
      return { success: false, error: 'Unauthorized: Property does not belong to this landlord' };
    }
    
    // Find the image to delete
    const images = propertyData.images || [];
    const imageToDelete = images.find(img => img.fileName === imageName);
    
    if (!imageToDelete) {
      return { success: false, error: 'Image not found' };
    }
    
    // Delete from storage
    const storageRef = ref(storage, `properties/${propertyId}/images/${imageName}`);
    await deleteObject(storageRef);
    
    // Remove from Firestore
    await updateDoc(propertyRef, {
      images: arrayRemove(imageToDelete),
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting property image:', error);
    return { success: false, error: error.message };
  }
};

// Set primary image for property
export const setPrimaryImage = async (propertyId, imageName, landlordId) => {
  try {
    const propertyRef = doc(db, 'properties', propertyId);
    const propertySnap = await propertyRef.get();
    
    if (!propertySnap.exists()) {
      return { success: false, error: 'Property not found' };
    }
    
    const propertyData = propertySnap.data();
    
    // Verify landlord ownership
    if (propertyData.landlordId !== landlordId) {
      return { success: false, error: 'Unauthorized: Property does not belong to this landlord' };
    }
    
    // Update all images to set isPrimary correctly
    const images = propertyData.images || [];
    const updatedImages = images.map(img => ({
      ...img,
      isPrimary: img.fileName === imageName
    }));
    
    await updateDoc(propertyRef, {
      images: updatedImages,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error setting primary image:', error);
    return { success: false, error: error.message };
  }
};
