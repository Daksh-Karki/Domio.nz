import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  startAfter,
  serverTimestamp
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from './config.js';

// Create a new property listing
export const createProperty = async (propertyData) => {
  try {
    const propertiesRef = collection(db, 'properties');
    const propertyToCreate = {
      ...propertyData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'available', // available, rented, unavailable
      isActive: true
    };
    
    const docRef = await addDoc(propertiesRef, propertyToCreate);
    
    return { success: true, data: { id: docRef.id } };
  } catch (error) {
    console.error('Error creating property:', error);
    return { success: false, error: error.message };
  }
};

// Get all properties for a specific landlord
export const getLandlordProperties = async (landlordId) => {
  try {
    const propertiesRef = collection(db, 'properties');
    
    // Query for properties by landlord
    let q = query(
      propertiesRef, 
      where('landlordId', '==', landlordId)
    );
    
    const querySnapshot = await getDocs(q);
    
    const properties = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Filter for active properties in code since we can't use compound where clauses
      if (data.isActive !== false) {
        properties.push({
          id: doc.id,
          ...data
        });
      }
    });
    
    // Sort by createdAt in code
    properties.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return bTime - aTime;
    });
    
    return { success: true, data: properties };
  } catch (error) {
    console.error('Error fetching landlord properties:', error);
    return { success: false, error: error.message };
  }
};

// Get a single property by ID
export const getProperty = async (propertyId) => {
  try {
    const propertyRef = doc(db, 'properties', propertyId);
    const propertySnap = await getDoc(propertyRef);
    
    if (propertySnap.exists()) {
      return { success: true, data: { id: propertySnap.id, ...propertySnap.data() } };
    } else {
      return { success: false, error: 'Property not found' };
    }
  } catch (error) {
    console.error('Error fetching property:', error);
    return { success: false, error: error.message };
  }
};

// Update a property (with owner validation)
export const updateProperty = async (propertyId, updateData, landlordId) => {
  try {
    // First verify the property belongs to the landlord
    const propertyRef = doc(db, 'properties', propertyId);
    const propertySnap = await getDoc(propertyRef);
    
    if (!propertySnap.exists()) {
      return { success: false, error: 'Property not found' };
    }
    
    const propertyData = propertySnap.data();
    if (propertyData.landlordId !== landlordId) {
      return { success: false, error: 'Unauthorized: Property does not belong to this landlord' };
    }
    
    await updateDoc(propertyRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating property:', error);
    return { success: false, error: error.message };
  }
};

// Delete a property and all associated images
export const deleteProperty = async (propertyId, landlordId) => {
  try {
    // First verify the property belongs to the landlord
    const propertyRef = doc(db, 'properties', propertyId);
    const propertySnap = await getDoc(propertyRef);
    
    if (!propertySnap.exists()) {
      return { success: false, error: 'Property not found' };
    }
    
    const propertyData = propertySnap.data();
    if (propertyData.landlordId !== landlordId) {
      return { success: false, error: 'Unauthorized: Property does not belong to this landlord' };
    }
    
    // Delete all associated images from Firebase Storage
    if (propertyData.images && propertyData.images.length > 0) {
      const deleteImagePromises = propertyData.images.map(async (image) => {
        try {
          const imageRef = ref(storage, image.storagePath);
          await deleteObject(imageRef);
          console.log('Deleted image:', image.storagePath);
        } catch (imageError) {
          console.warn('Failed to delete image:', image.storagePath, imageError);
          // Continue with other deletions even if one fails
        }
      });
      
      await Promise.all(deleteImagePromises);
    }
    
    // Delete any lease documents from Firebase Storage
    if (propertyData.leaseDocuments && propertyData.leaseDocuments.length > 0) {
      const deleteDocumentPromises = propertyData.leaseDocuments.map(async (document) => {
        try {
          const documentRef = ref(storage, document.storagePath);
          await deleteObject(documentRef);
          console.log('Deleted document:', document.storagePath);
        } catch (documentError) {
          console.warn('Failed to delete document:', document.storagePath, documentError);
          // Continue with other deletions even if one fails
        }
      });
      
      await Promise.all(deleteDocumentPromises);
    }
    
    // Finally, delete the property document from Firestore
    await deleteDoc(propertyRef);
    
    console.log('Property and all associated files deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Error deleting property:', error);
    return { success: false, error: error.message };
  }
};

// Update property status (available, rented, unavailable)
export const updatePropertyStatus = async (propertyId, status, landlordId) => {
  try {
    // First verify the property belongs to the landlord
    const propertyRef = doc(db, 'properties', propertyId);
    const propertySnap = await getDoc(propertyRef);
    
    if (!propertySnap.exists()) {
      return { success: false, error: 'Property not found' };
    }
    
    const propertyData = propertySnap.data();
    if (propertyData.landlordId !== landlordId) {
      return { success: false, error: 'Unauthorized: Property does not belong to this landlord' };
    }
    
    const validStatuses = ['available', 'rented', 'unavailable'];
    if (!validStatuses.includes(status)) {
      return { success: false, error: 'Invalid status. Must be: available, rented, or unavailable' };
    }
    
    await updateDoc(propertyRef, {
      status: status,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating property status:', error);
    return { success: false, error: error.message };
  }
};

// Get properties with pagination
export const getPropertiesPaginated = async (landlordId, lastDoc = null, pageSize = 10) => {
  try {
    const propertiesRef = collection(db, 'properties');
    let q = query(
      propertiesRef,
      where('landlordId', '==', landlordId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    
    const querySnapshot = await getDocs(q);
    const properties = [];
    let lastVisible = null;
    
    querySnapshot.forEach((doc) => {
      properties.push({
        id: doc.id,
        ...doc.data()
      });
      lastVisible = doc;
    });
    
    return { 
      success: true, 
      data: properties, 
      lastDoc: lastVisible,
      hasMore: querySnapshot.size === pageSize
    };
  } catch (error) {
    console.error('Error fetching paginated properties:', error);
    return { success: false, error: error.message };
  }
};

// Search properties by title, address, or description
export const searchProperties = async (landlordId, searchTerm) => {
  try {
    const propertiesRef = collection(db, 'properties');
    const q = query(
      propertiesRef,
      where('landlordId', '==', landlordId),
      where('isActive', '==', true),
      orderBy('title')
    );
    
    const querySnapshot = await getDocs(q);
    const properties = [];
    const searchLower = searchTerm.toLowerCase();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      if (
        data.title?.toLowerCase().includes(searchLower) ||
        data.address?.toLowerCase().includes(searchLower) ||
        data.description?.toLowerCase().includes(searchLower) ||
        data.city?.toLowerCase().includes(searchLower)
      ) {
        properties.push({
          id: doc.id,
          ...data
        });
      }
    });
    
    return { success: true, data: properties };
  } catch (error) {
    console.error('Error searching properties:', error);
    return { success: false, error: error.message };
  }
};

// Get property statistics for dashboard
export const getPropertyStats = async (landlordId) => {
  try {
    const propertiesRef = collection(db, 'properties');
    const q = query(
      propertiesRef,
      where('landlordId', '==', landlordId),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const stats = {
      total: 0,
      available: 0,
      rented: 0,
      unavailable: 0,
      totalRent: 0
    };
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      stats.total++;
      stats[data.status] = (stats[data.status] || 0) + 1;
      
      if (data.rent && typeof data.rent === 'number') {
        stats.totalRent += data.rent;
      }
    });
    
    return { success: true, data: stats };
  } catch (error) {
    console.error('Error fetching property stats:', error);
    return { success: false, error: error.message };
  }
};
