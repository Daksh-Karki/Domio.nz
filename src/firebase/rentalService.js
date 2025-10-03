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
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config.js';

// Create a new rental agreement
export const createRentalAgreement = async (rentalData) => {
  try {
    const rentalsRef = collection(db, 'rentals');
    const rentalToCreate = {
      ...rentalData,
      status: 'active', // active, completed, terminated
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    };
    
    const docRef = await addDoc(rentalsRef, rentalToCreate);
    
    return { success: true, data: { id: docRef.id } };
  } catch (error) {
    console.error('Error creating rental agreement:', error);
    return { success: false, error: error.message };
  }
};

// Get all rentals for a tenant
export const getTenantRentals = async (tenantId) => {
  try {
    const rentalsRef = collection(db, 'rentals');
    const q = query(
      rentalsRef,
      where('tenantId', '==', tenantId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const rentals = [];
    
    querySnapshot.forEach((doc) => {
      rentals.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, data: rentals };
  } catch (error) {
    console.error('Error fetching tenant rentals:', error);
    return { success: false, error: error.message };
  }
};

// Get all rentals for a landlord
export const getLandlordRentals = async (landlordId) => {
  try {
    const rentalsRef = collection(db, 'rentals');
    const q = query(
      rentalsRef,
      where('landlordId', '==', landlordId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const rentals = [];
    
    querySnapshot.forEach((doc) => {
      rentals.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, data: rentals };
  } catch (error) {
    console.error('Error fetching landlord rentals:', error);
    return { success: false, error: error.message };
  }
};

// Get a single rental by ID
export const getRental = async (rentalId) => {
  try {
    const rentalRef = doc(db, 'rentals', rentalId);
    const rentalSnap = await getDoc(rentalRef);
    
    if (rentalSnap.exists()) {
      return { success: true, data: { id: rentalSnap.id, ...rentalSnap.data() } };
    } else {
      return { success: false, error: 'Rental agreement not found' };
    }
  } catch (error) {
    console.error('Error fetching rental:', error);
    return { success: false, error: error.message };
  }
};

// Update rental agreement
export const updateRentalAgreement = async (rentalId, updateData, userId, userRole) => {
  try {
    const rentalRef = doc(db, 'rentals', rentalId);
    const rentalSnap = await getDoc(rentalRef);
    
    if (!rentalSnap.exists()) {
      return { success: false, error: 'Rental agreement not found' };
    }
    
    const rentalData = rentalSnap.data();
    
    // Verify user has permission to update
    if (userRole === 'tenant' && rentalData.tenantId !== userId) {
      return { success: false, error: 'Unauthorized: Rental does not belong to this tenant' };
    }
    
    if (userRole === 'landlord' && rentalData.landlordId !== userId) {
      return { success: false, error: 'Unauthorized: Rental does not belong to this landlord' };
    }
    
    await updateDoc(rentalRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating rental agreement:', error);
    return { success: false, error: error.message };
  }
};

// Terminate rental agreement
export const terminateRentalAgreement = async (rentalId, terminationData, userId, userRole) => {
  try {
    const rentalRef = doc(db, 'rentals', rentalId);
    const rentalSnap = await getDoc(rentalRef);
    
    if (!rentalSnap.exists()) {
      return { success: false, error: 'Rental agreement not found' };
    }
    
    const rentalData = rentalSnap.data();
    
    // Verify user has permission to terminate
    if (userRole === 'tenant' && rentalData.tenantId !== userId) {
      return { success: false, error: 'Unauthorized: Rental does not belong to this tenant' };
    }
    
    if (userRole === 'landlord' && rentalData.landlordId !== userId) {
      return { success: false, error: 'Unauthorized: Rental does not belong to this landlord' };
    }
    
    await updateDoc(rentalRef, {
      status: 'terminated',
      terminationDate: serverTimestamp(),
      terminationReason: terminationData.reason,
      terminationNotes: terminationData.notes,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error terminating rental agreement:', error);
    return { success: false, error: error.message };
  }
};

// Get rental statistics for dashboard
export const getRentalStats = async (tenantId) => {
  try {
    const rentalsRef = collection(db, 'rentals');
    const q = query(
      rentalsRef,
      where('tenantId', '==', tenantId),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const stats = {
      total: 0,
      active: 0,
      completed: 0,
      terminated: 0,
      totalRentPaid: 0,
      currentRent: 0
    };
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      stats.total++;
      stats[data.status] = (stats[data.status] || 0) + 1;
      
      if (data.status === 'active' && data.monthlyRent) {
        stats.currentRent = data.monthlyRent;
      }
      
      if (data.totalRentPaid) {
        stats.totalRentPaid += data.totalRentPaid;
      }
    });
    
    return { success: true, data: stats };
  } catch (error) {
    console.error('Error fetching rental stats:', error);
    return { success: false, error: error.message };
  }
};

// Get upcoming rent due dates
export const getUpcomingRentDue = async (tenantId) => {
  try {
    const rentalsRef = collection(db, 'rentals');
    const q = query(
      rentalsRef,
      where('tenantId', '==', tenantId),
      where('status', '==', 'active'),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const upcomingRent = [];
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.rentDueDate) {
        const dueDate = data.rentDueDate.toDate ? data.rentDueDate.toDate() : new Date(data.rentDueDate);
        if (dueDate >= now && dueDate <= nextMonth) {
          upcomingRent.push({
            id: doc.id,
            ...data,
            dueDate: dueDate
          });
        }
      }
    });
    
    // Sort by due date
    upcomingRent.sort((a, b) => a.dueDate - b.dueDate);
    
    return { success: true, data: upcomingRent };
  } catch (error) {
    console.error('Error fetching upcoming rent due:', error);
    return { success: false, error: error.message };
  }
};

// Get rental history (past rentals)
export const getRentalHistory = async (tenantId) => {
  try {
    const rentalsRef = collection(db, 'rentals');
    const q = query(
      rentalsRef,
      where('tenantId', '==', tenantId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const history = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      history.push({
        id: doc.id,
        ...data
      });
    });
    
    return { success: true, data: history };
  } catch (error) {
    console.error('Error fetching rental history:', error);
    return { success: false, error: error.message };
  }
};




