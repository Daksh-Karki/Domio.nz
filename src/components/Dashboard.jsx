import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Home, DollarSign, Wrench, Users, Building2, FileText, TrendingUp, Calendar, AlertCircle, CheckCircle, Clock, UserCheck, UserX } from "lucide-react";
import UserLayout from "./UserLayout.jsx";
import { useAuth } from "../context/AuthContext";
import { getLandlordProperties, getPropertyStats } from "../firebase/propertyService.js";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({});
  const [financialRecords, setFinancialRecords] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [applications, setApplications] = useState([]);
  const [tenantApplications, setTenantApplications] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [newProperty, setNewProperty] = useState({
    title: '',
    address: '',
    city: '',
    type: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    rent: ''
  });
  const navigate = useNavigate();
  const { logout, user: authUser } = useAuth();

  useEffect(() => {
    // Use actual user data from auth context
    if (authUser) {
      setUser(authUser);
      loadDashboardData();
    }
  }, [authUser]);

  useEffect(() => {
    if (user) {
      loadProperties();
    }
  }, [user]);

  const loadProperties = async () => {
    if (!user) return;
    
    try {
      const isLandlord = user?.role?.toLowerCase() === 'landlord';
      
      if (isLandlord) {
        // Load real property data for landlords
        const result = await getLandlordProperties(user.uid);
        if (result.success) {
          setProperties(result.data);
        }
        
        // Load property stats
        const statsResult = await getPropertyStats(user.uid);
        if (statsResult.success) {
          setStats(statsResult.data);
        }
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = () => {
    // Load mock data for other sections (applications, maintenance, etc.)
    const isLandlord = user?.role?.toLowerCase() === 'landlord';
    
    if (isLandlord) {
      // Landlord mock data for non-property sections
      setTenantApplications([
        { id: 1, propertyId: 2, propertyName: "Family House", applicantName: "Mike Wilson", applicantEmail: "mike@example.com", appliedDate: "2024-01-20", status: "Pending", income: 85000, references: 2 },
        { id: 2, propertyId: 2, propertyName: "Family House", applicantName: "Lisa Brown", applicantEmail: "lisa@example.com", appliedDate: "2024-01-18", status: "Under Review", income: 95000, references: 3 }
      ]);
      setTenants([
        { id: 1, name: "John Smith", email: "john@example.com", property: "Downtown Apartment", rentPaid: true, leaseEnd: "2024-12-31" },
        { id: 2, name: "Sarah Johnson", email: "sarah@example.com", property: "Studio Unit", rentPaid: false, leaseEnd: "2024-11-30" }
      ]);
    } else {
      // Tenant data
      setApplications([
        { id: 1, propertyTitle: "Modern Downtown Apartment", status: "Pending", appliedDate: "2024-01-15" },
        { id: 2, propertyTitle: "Family Home with Garden", status: "Approved", appliedDate: "2024-01-10" }
      ]);
    }
    
    setFinancialRecords([
      { id: 1, type: "income", amount: 1500, description: "Rent payment", date: "2024-01-15" },
      { id: 2, type: "expense", amount: 200, description: "Maintenance", date: "2024-01-10" }
    ]);
    setMaintenanceRequests([
      { id: 1, property: "Downtown Apartment", issue: "Leaky faucet", status: "pending", date: "2024-01-20", reportedBy: "John Smith" }
    ]);
  };

  const handleLogout = () => {
    logout();
    // Force a page reload to ensure clean state
    window.location.href = '/';
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Use the real Firebase service
      const { createProperty } = await import('../firebase/propertyService.js');
      const { uploadPropertyImages } = await import('../firebase/documentService.js');
      
      const propertyData = {
        ...newProperty,
        landlordId: user.uid,
        rent: parseFloat(newProperty.rent) || 0,
        status: 'available',
        amenities: []
      };
      
      const result = await createProperty(propertyData);
      if (result.success) {
        // Upload images if any were selected
        if (selectedImages.length > 0) {
          setUploadingImages(true);
          try {
            const uploadResult = await uploadPropertyImages(result.data.id, selectedImages, user.uid);
            if (!uploadResult.success) {
              console.error('Error uploading images:', uploadResult.error);
            }
          } catch (error) {
            console.error('Error uploading images:', error);
          } finally {
            setUploadingImages(false);
          }
        }
        
        // Reload properties to show the new one
        await loadProperties();
        setShowAddProperty(false);
        setNewProperty({
          title: '',
          address: '',
          city: '',
          type: 'apartment',
          bedrooms: 1,
          bathrooms: 1,
          rent: ''
        });
        setSelectedImages([]);
      } else {
        alert('Error creating property: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating property:', error);
      alert('Error creating property. Please try again.');
    }
  };

  const getTotalRent = () => {
    return stats.totalRent || 0;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'status-available';
      case 'Rented':
        return 'status-rented';
      case 'Under Maintenance':
        return 'status-maintenance';
      default:
        return 'status-default';
    }
  };

  const getApplicationStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Approved':
        return 'status-approved';
      case 'Rejected':
        return 'status-rejected';
      case 'Under Review':
        return 'status-review';
      default:
        return 'status-pending';
    }
  };

  const handleApplicationAction = (applicationId, action) => {
    setTenantApplications(prev => 
      prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: action }
          : app
      )
    );
  };

  const getTotalMonthlyIncome = () => {
    return stats.totalRent || 0;
  };

  const getOccupancyRate = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.rented / stats.total) * 100);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }
    
    // Check file sizes (max 5MB each)
    const oversizedFiles = imageFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('Some files are too large. Maximum size is 5MB per image.');
      return;
    }
    
    setSelectedImages(prev => [...prev, ...imageFiles]);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Show loading state
  if (loading) {
    return (
      <div className="fullscreen-loading">
        <div className="loading-container">
          <div className="loading-logo">
            <img src="/src/assets/Logo.png" alt="Domio.nz Logo" />
          </div>
          <p>Loading your dashboard...</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  const isLandlord = user?.role?.toLowerCase() === 'landlord';

  return (
    <UserLayout 
      title="Dashboard" 
      subtitle={isLandlord ? "Manage your properties and tenants" : "Overview of your account and applications"}
    >
      <div className="dashboard-content-wrapper">
        {/* Stats Cards */}
        <div className="stats-grid">
          {isLandlord ? (
            <>
          <div className="stat-card">
            <div className="stat-icon">
              <Building2 size={32} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.total || 0}</h3>
              <p className="stat-label">Total Properties</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <DollarSign size={32} />
            </div>
            <div className="stat-content">
                  <h3 className="stat-number">${getTotalMonthlyIncome().toLocaleString()}</h3>
                  <p className="stat-label">Monthly Income</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
                  <Users size={32} />
            </div>
            <div className="stat-content">
                  <h3 className="stat-number">{tenants.length}</h3>
                  <p className="stat-label">Active Tenants</p>
            </div>
          </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <TrendingUp size={32} />
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{getOccupancyRate()}%</h3>
                  <p className="stat-label">Occupancy Rate</p>
                </div>
              </div>
            </>
          ) : (
            <>
          <div className="stat-card">
            <div className="stat-icon">
              <FileText size={32} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{applications.length}</h3>
                  <p className="stat-label">My Applications</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <CheckCircle size={32} />
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">
                    {applications.filter(app => app.status === 'Approved').length}
                  </h3>
                  <p className="stat-label">Approved</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Clock size={32} />
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">
                    {applications.filter(app => app.status === 'Pending').length}
                  </h3>
                  <p className="stat-label">Pending</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Home size={32} />
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">0</h3>
                  <p className="stat-label">Current Property</p>
            </div>
          </div>
            </>
          )}
        </div>

        {/* Properties Section - Only for Landlords */}
        {isLandlord && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>
              <Building2 size={24} className="section-icon" />
              Your Properties
            </h2>
                          <div className="section-actions">
              <button
                className="view-all-btn"
                onClick={() => navigate('/landlord/properties')}
              >
                View All Properties
              </button>
            <button
              className="add-property-btn"
              onClick={() => setShowAddProperty(true)}
            >
              <Plus size={16} />
              Add Property
            </button>
          </div>
            </div>

          <div className="properties-grid">
            {properties.length === 0 ? (
              <div className="empty-state">
                <Building2 size={48} />
                <p>No properties yet</p>
                <small>Add your first property to get started</small>
              </div>
            ) : (
              properties.map((property) => (
                <div key={property.id} className="property-card">
                  <div className="property-header">
                    <h4 className="property-title">{property.title || property.name}</h4>
                    <span className={`status-badge ${getStatusColor(property.status)}`}>
                      {property.status?.charAt(0).toUpperCase() + property.status?.slice(1)}
                    </span>
                  </div>
                  <div className="property-details">
                    <p className="property-address">{property.address}</p>
                    <div className="property-specs">
                      <span>{property.bedrooms} bed</span>
                      <span>{property.bathrooms} bath</span>
                      <span>{property.type?.charAt(0).toUpperCase() + property.type?.slice(1)}</span>
                    </div>
                    <p className="property-rent">${property.rent}/week</p>
                      {property.tenant && (
                        <p className="property-tenant">Tenant: {property.tenant}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tenant Applications Section - Only for Landlords */}
        {isLandlord && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <FileText size={24} className="section-icon" />
                Tenant Applications
              </h2>
              <div className="section-actions">
                <span className="application-count">{tenantApplications.length} pending</span>
                <button
                  className="view-all-btn"
                  onClick={() => navigate('/landlord/applications')}
                >
                  View All Applications
                </button>
              </div>
            </div>

            <div className="applications-list">
              {tenantApplications.length === 0 ? (
                <div className="empty-state">
                  <FileText size={48} />
                  <p>No applications yet</p>
                  <small>Applications from potential tenants will appear here</small>
                </div>
              ) : (
                tenantApplications.map((application) => (
                  <div key={application.id} className="application-item">
                    <div className="application-info">
                      <h4 className="application-property">{application.propertyName}</h4>
                      <p className="applicant-name">{application.applicantName}</p>
                      <p className="application-details">
                        Income: ${application.income.toLocaleString()} | 
                        References: {application.references} | 
                        Applied: {new Date(application.appliedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="application-actions">
                      <span className={`status-badge ${getApplicationStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                      {application.status === 'Pending' && (
                        <div className="action-buttons">
                          <button 
                            className="approve-btn"
                            onClick={() => handleApplicationAction(application.id, 'Approved')}
                          >
                            <UserCheck size={16} />
                            Approve
                          </button>
                          <button 
                            className="reject-btn"
                            onClick={() => handleApplicationAction(application.id, 'Rejected')}
                          >
                            <UserX size={16} />
                            Reject
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        )}

        {/* Recent Applications Section - Only for Tenants */}
        {!isLandlord && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>
              <FileText size={24} className="section-icon" />
                My Applications
            </h2>
            <button
              className="view-all-btn"
              onClick={() => navigate('/applications')}
            >
              View All
            </button>
          </div>

          <div className="applications-list">
            {applications.length === 0 ? (
              <div className="empty-state">
                <FileText size={48} />
                <p>No applications yet</p>
                <small>Start applying to properties to see them here</small>
              </div>
            ) : (
              applications.slice(0, 3).map((application) => (
                <div key={application.id} className="application-item">
                  <div className="application-info">
                    <h4 className="application-property">{application.propertyTitle}</h4>
                    <p className="application-date">Applied: {new Date(application.appliedDate).toLocaleDateString()}</p>
                  </div>
                  <span className={`status-badge ${getApplicationStatusColor(application.status)}`}>
                    {application.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        )}

        {/* Tenants Section - Only for Landlords */}
        {isLandlord && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <Users size={24} className="section-icon" />
                Current Tenants
              </h2>
              <button
                className="view-all-btn"
                onClick={() => navigate('/landlord/financials')}
              >
                View Financials
              </button>
            </div>

            <div className="tenants-list">
              {tenants.length === 0 ? (
                <div className="empty-state">
                  <Users size={48} />
                  <p>No tenants yet</p>
                  <small>Tenants will appear here once they're approved and moved in</small>
                </div>
              ) : (
                tenants.map((tenant) => (
                  <div key={tenant.id} className="tenant-item">
                    <div className="tenant-info">
                      <h4 className="tenant-name">{tenant.name}</h4>
                      <p className="tenant-property">{tenant.property}</p>
                      <p className="tenant-details">
                        Email: {tenant.email} | 
                        Lease End: {new Date(tenant.leaseEnd).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="tenant-status">
                      <span className={`rent-status ${tenant.rentPaid ? 'paid' : 'overdue'}`}>
                        {tenant.rentPaid ? 'Rent Paid' : 'Rent Overdue'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Maintenance Requests Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>
              <Wrench size={24} className="section-icon" />
              {isLandlord ? 'Maintenance Requests' : 'My Maintenance Requests'}
            </h2>
            <div className="section-actions">
              {isLandlord ? (
                <button 
                  className="view-all-btn"
                  onClick={() => navigate('/landlord/maintenance')}
                >
                  View All Requests
                </button>
              ) : (
                <button className="add-maintenance-btn">
                  <Plus size={16} />
                  Report Issue
                </button>
              )}
            </div>
          </div>

          <div className="maintenance-list">
            {maintenanceRequests.length === 0 ? (
              <div className="empty-state">
                <Wrench size={48} />
                <p>{isLandlord ? 'No maintenance requests' : 'No maintenance requests yet'}</p>
                <small>{isLandlord ? 'All your properties are in good condition' : 'Report any issues with your property here'}</small>
              </div>
            ) : (
              maintenanceRequests.map((request) => (
                <div key={request.id} className="maintenance-item">
                  <div className="maintenance-info">
                    <h4 className="maintenance-property">{request.property}</h4>
                    <p className="maintenance-issue">{request.issue}</p>
                    <p className="maintenance-date">
                      Reported: {new Date(request.date).toLocaleDateString()}
                      {request.reportedBy && ` by ${request.reportedBy}`}
                    </p>
                  </div>
                  <div className="maintenance-actions">
                  <span className={`status-badge ${request.status === 'pending' ? 'status-pending' : 'status-approved'}`}>
                    {request.status}
                  </span>
                    {isLandlord && request.status === 'pending' && (
                      <button className="action-btn primary">Assign Contractor</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Property Modal - Only for Landlords */}
        {isLandlord && showAddProperty && (
          <div className="modal-overlay" onClick={() => setShowAddProperty(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add New Property</h3>
                <button className="close-modal-btn" onClick={() => setShowAddProperty(false)}>
                  ×
                </button>
              </div>
              
              <form onSubmit={handleAddProperty} className="modal-form">
                <div className="form-group">
                  <label htmlFor="property-title">Property Title</label>
                  <input
                    type="text"
                    id="property-title"
                    value={newProperty.title}
                    onChange={(e) => setNewProperty({...newProperty, title: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="property-address">Address</label>
                  <input
                    type="text"
                    id="property-address"
                    value={newProperty.address}
                    onChange={(e) => setNewProperty({...newProperty, address: e.target.value})}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="property-bedrooms">Bedrooms</label>
                    <input
                      type="number"
                      id="property-bedrooms"
                      min="1"
                      value={newProperty.bedrooms}
                      onChange={(e) => setNewProperty({...newProperty, bedrooms: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="property-bathrooms">Bathrooms</label>
                    <input
                      type="number"
                      id="property-bathrooms"
                      min="1"
                      value={newProperty.bathrooms}
                      onChange={(e) => setNewProperty({...newProperty, bathrooms: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="property-rent">Weekly Rent ($)</label>
                  <input
                    type="number"
                    id="property-rent"
                    min="0"
                    step="0.01"
                    value={newProperty.rent}
                    onChange={(e) => setNewProperty({...newProperty, rent: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="property-images">Property Images</label>
                  <div className="image-upload-section">
                    <input
                      type="file"
                      id="property-images"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="property-images" className="image-upload-btn">
                      <ImageIcon size={20} />
                      Choose Images (Max 10, 5MB each)
                    </label>
                    
                    {selectedImages.length > 0 && (
                      <div className="selected-images">
                        <p className="image-count">{selectedImages.length} image(s) selected</p>
                        <div className="image-preview-grid">
                          {selectedImages.map((file, index) => (
                            <div key={index} className="image-preview-item">
                              <img 
                                src={URL.createObjectURL(file)} 
                                alt={`Preview ${index + 1}`}
                                className="image-preview"
                              />
                              <button
                                type="button"
                                className="remove-image-btn"
                                onClick={() => removeImage(index)}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowAddProperty(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn" disabled={uploadingImages}>
                    {uploadingImages ? 'Uploading Images...' : 'Add Property'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}