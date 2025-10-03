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

// Submit a rental application
export const submitApplication = async (applicationData) => {
  try {
    const applicationsRef = collection(db, 'applications');
    const applicationToCreate = {
      ...applicationData,
      status: 'pending', // pending, approved, rejected, withdrawn
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    };
    
    const docRef = await addDoc(applicationsRef, applicationToCreate);
    
    return { success: true, data: { id: docRef.id } };
  } catch (error) {
    console.error('Error submitting application:', error);
    return { success: false, error: error.message };
  }
};

// Express interest in a property
export const expressInterest = async (interestData) => {
  try {
    const interestsRef = collection(db, 'interests');
    const interestToCreate = {
      ...interestData,
      status: 'active', // active, contacted, not_interested
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    };
    
    const docRef = await addDoc(interestsRef, interestToCreate);
    
    return { success: true, data: { id: docRef.id } };
  } catch (error) {
    console.error('Error expressing interest:', error);
    return { success: false, error: error.message };
  }
};

// Get all applications for a tenant
export const getTenantApplications = async (tenantId) => {
  try {
    const applicationsRef = collection(db, 'applications');
    const q = query(
      applicationsRef,
      where('tenantId', '==', tenantId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const applications = [];
    
    querySnapshot.forEach((doc) => {
      applications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, data: applications };
  } catch (error) {
    console.error('Error fetching tenant applications:', error);
    return { success: false, error: error.message };
  }
};

// Get all interests for a tenant
export const getTenantInterests = async (tenantId) => {
  try {
    const interestsRef = collection(db, 'interests');
    const q = query(
      interestsRef,
      where('tenantId', '==', tenantId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const interests = [];
    
    querySnapshot.forEach((doc) => {
      interests.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, data: interests };
  } catch (error) {
    console.error('Error fetching tenant interests:', error);
    return { success: false, error: error.message };
  }
};

// Get all applications for a property (for landlords)
export const getPropertyApplications = async (propertyId) => {
  try {
    const applicationsRef = collection(db, 'applications');
    const q = query(
      applicationsRef,
      where('propertyId', '==', propertyId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const applications = [];
    
    querySnapshot.forEach((doc) => {
      applications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, data: applications };
  } catch (error) {
    console.error('Error fetching property applications:', error);
    return { success: false, error: error.message };
  }
};

// Get all interests for a property (for landlords)
export const getPropertyInterests = async (propertyId) => {
  try {
    const interestsRef = collection(db, 'interests');
    const q = query(
      interestsRef,
      where('propertyId', '==', propertyId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const interests = [];
    
    querySnapshot.forEach((doc) => {
      interests.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, data: interests };
  } catch (error) {
    console.error('Error fetching property interests:', error);
    return { success: false, error: error.message };
  }
};

// Update application status (for landlords)
export const updateApplicationStatus = async (applicationId, status, landlordId) => {
  try {
    const applicationRef = doc(db, 'applications', applicationId);
    const applicationSnap = await getDoc(applicationRef);
    
    if (!applicationSnap.exists()) {
      return { success: false, error: 'Application not found' };
    }
    
    const applicationData = applicationSnap.data();
    
    // Verify the property belongs to the landlord
    if (applicationData.landlordId !== landlordId) {
      return { success: false, error: 'Unauthorized: Application does not belong to this landlord' };
    }
    
    const validStatuses = ['pending', 'approved', 'rejected', 'withdrawn'];
    if (!validStatuses.includes(status)) {
      return { success: false, error: 'Invalid status. Must be: pending, approved, rejected, or withdrawn' };
    }
    
    await updateDoc(applicationRef, {
      status: status,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating application status:', error);
    return { success: false, error: error.message };
  }
};

// Withdraw an application (for tenants)
export const withdrawApplication = async (applicationId, tenantId) => {
  try {
    const applicationRef = doc(db, 'applications', applicationId);
    const applicationSnap = await getDoc(applicationRef);
    
    if (!applicationSnap.exists()) {
      return { success: false, error: 'Application not found' };
    }
    
    const applicationData = applicationSnap.data();
    
    // Verify the application belongs to the tenant
    if (applicationData.tenantId !== tenantId) {
      return { success: false, error: 'Unauthorized: Application does not belong to this tenant' };
    }
    
    // Only allow withdrawal if status is pending
    if (applicationData.status !== 'pending') {
      return { success: false, error: 'Cannot withdraw application that is not pending' };
    }
    
    await updateDoc(applicationRef, {
      status: 'withdrawn',
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error withdrawing application:', error);
    return { success: false, error: error.message };
  }
};

// Check if tenant has already applied to a property
export const checkExistingApplication = async (tenantId, propertyId) => {
  try {
    const applicationsRef = collection(db, 'applications');
    const q = query(
      applicationsRef,
      where('tenantId', '==', tenantId),
      where('propertyId', '==', propertyId),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const applications = [];
    
    querySnapshot.forEach((doc) => {
      applications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, data: applications };
  } catch (error) {
    console.error('Error checking existing application:', error);
    return { success: false, error: error.message };
  }
};

// Check if tenant has already expressed interest in a property
export const checkExistingInterest = async (tenantId, propertyId) => {
  try {
    const interestsRef = collection(db, 'interests');
    const q = query(
      interestsRef,
      where('tenantId', '==', tenantId),
      where('propertyId', '==', propertyId),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const interests = [];
    
    querySnapshot.forEach((doc) => {
      interests.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, data: interests };
  } catch (error) {
    console.error('Error checking existing interest:', error);
    return { success: false, error: error.message };
  }
};

// Get application statistics for dashboard
export const getApplicationStats = async (tenantId) => {
  try {
    const applicationsRef = collection(db, 'applications');
    const q = query(
      applicationsRef,
      where('tenantId', '==', tenantId),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const stats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      withdrawn: 0
    };
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      stats.total++;
      stats[data.status] = (stats[data.status] || 0) + 1;
    });
    
    return { success: true, data: stats };
  } catch (error) {
    console.error('Error fetching application stats:', error);
    return { success: false, error: error.message };
  }
};



