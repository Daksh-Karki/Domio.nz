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
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config.js';

// Submit a property review
export const submitPropertyReview = async (reviewData) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const reviewToCreate = {
      ...reviewData,
      type: 'property', // property, landlord, tenant
      status: 'published', // published, pending, rejected
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    };
    
    const docRef = await addDoc(reviewsRef, reviewToCreate);
    
    return { success: true, data: { id: docRef.id } };
  } catch (error) {
    console.error('Error submitting property review:', error);
    return { success: false, error: error.message };
  }
};

// Submit a landlord review
export const submitLandlordReview = async (reviewData) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const reviewToCreate = {
      ...reviewData,
      type: 'landlord',
      status: 'published',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    };
    
    const docRef = await addDoc(reviewsRef, reviewToCreate);
    
    return { success: true, data: { id: docRef.id } };
  } catch (error) {
    console.error('Error submitting landlord review:', error);
    return { success: false, error: error.message };
  }
};

// Get reviews for a property
export const getPropertyReviews = async (propertyId) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('propertyId', '==', propertyId),
      where('type', '==', 'property'),
      where('status', '==', 'published'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const reviews = [];
    
    querySnapshot.forEach((doc) => {
      reviews.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, data: reviews };
  } catch (error) {
    console.error('Error fetching property reviews:', error);
    return { success: false, error: error.message };
  }
};

// Get reviews for a landlord
export const getLandlordReviews = async (landlordId) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('landlordId', '==', landlordId),
      where('type', '==', 'landlord'),
      where('status', '==', 'published'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const reviews = [];
    
    querySnapshot.forEach((doc) => {
      reviews.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, data: reviews };
  } catch (error) {
    console.error('Error fetching landlord reviews:', error);
    return { success: false, error: error.message };
  }
};

// Get reviews by a tenant
export const getTenantReviews = async (tenantId) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('tenantId', '==', tenantId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const reviews = [];
    
    querySnapshot.forEach((doc) => {
      reviews.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, data: reviews };
  } catch (error) {
    console.error('Error fetching tenant reviews:', error);
    return { success: false, error: error.message };
  }
};

// Get a single review by ID
export const getReview = async (reviewId) => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewSnap = await getDoc(reviewRef);
    
    if (reviewSnap.exists()) {
      return { success: true, data: { id: reviewSnap.id, ...reviewSnap.data() } };
    } else {
      return { success: false, error: 'Review not found' };
    }
  } catch (error) {
    console.error('Error fetching review:', error);
    return { success: false, error: error.message };
  }
};

// Update a review
export const updateReview = async (reviewId, updateData, userId) => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewSnap = await getDoc(reviewRef);
    
    if (!reviewSnap.exists()) {
      return { success: false, error: 'Review not found' };
    }
    
    const reviewData = reviewSnap.data();
    
    // Verify user has permission to update
    if (reviewData.tenantId !== userId) {
      return { success: false, error: 'Unauthorized: Review does not belong to this user' };
    }
    
    await updateDoc(reviewRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating review:', error);
    return { success: false, error: error.message };
  }
};

// Delete a review
export const deleteReview = async (reviewId, userId) => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewSnap = await getDoc(reviewRef);
    
    if (!reviewSnap.exists()) {
      return { success: false, error: 'Review not found' };
    }
    
    const reviewData = reviewSnap.data();
    
    // Verify user has permission to delete
    if (reviewData.tenantId !== userId) {
      return { success: false, error: 'Unauthorized: Review does not belong to this user' };
    }
    
    await updateDoc(reviewRef, {
      isActive: false,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting review:', error);
    return { success: false, error: error.message };
  }
};

// Get review statistics for a property
export const getPropertyReviewStats = async (propertyId) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('propertyId', '==', propertyId),
      where('type', '==', 'property'),
      where('status', '==', 'published'),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const stats = {
      total: 0,
      averageRating: 0,
      ratings: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      }
    };
    
    let totalRating = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      stats.total++;
      totalRating += data.rating || 0;
      stats.ratings[data.rating] = (stats.ratings[data.rating] || 0) + 1;
    });
    
    if (stats.total > 0) {
      stats.averageRating = Math.round((totalRating / stats.total) * 10) / 10;
    }
    
    return { success: true, data: stats };
  } catch (error) {
    console.error('Error fetching property review stats:', error);
    return { success: false, error: error.message };
  }
};

// Get review statistics for a landlord
export const getLandlordReviewStats = async (landlordId) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('landlordId', '==', landlordId),
      where('type', '==', 'landlord'),
      where('status', '==', 'published'),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const stats = {
      total: 0,
      averageRating: 0,
      ratings: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      }
    };
    
    let totalRating = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      stats.total++;
      totalRating += data.rating || 0;
      stats.ratings[data.rating] = (stats.ratings[data.rating] || 0) + 1;
    });
    
    if (stats.total > 0) {
      stats.averageRating = Math.round((totalRating / stats.total) * 10) / 10;
    }
    
    return { success: true, data: stats };
  } catch (error) {
    console.error('Error fetching landlord review stats:', error);
    return { success: false, error: error.message };
  }
};

// Check if tenant has already reviewed a property
export const checkExistingPropertyReview = async (tenantId, propertyId) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('tenantId', '==', tenantId),
      where('propertyId', '==', propertyId),
      where('type', '==', 'property'),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const reviews = [];
    
    querySnapshot.forEach((doc) => {
      reviews.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, data: reviews };
  } catch (error) {
    console.error('Error checking existing property review:', error);
    return { success: false, error: error.message };
  }
};

// Check if tenant has already reviewed a landlord
export const checkExistingLandlordReview = async (tenantId, landlordId) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('tenantId', '==', tenantId),
      where('landlordId', '==', landlordId),
      where('type', '==', 'landlord'),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const reviews = [];
    
    querySnapshot.forEach((doc) => {
      reviews.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, data: reviews };
  } catch (error) {
    console.error('Error checking existing landlord review:', error);
    return { success: false, error: error.message };
  }
};



