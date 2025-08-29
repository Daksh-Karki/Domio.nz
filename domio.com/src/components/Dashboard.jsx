import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Home, DollarSign, Wrench, Users, Building2, FileText, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import UserLayout from "./UserLayout.jsx";
import { useAuth } from "../context/AuthContext";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [financialRecords, setFinancialRecords] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [newProperty, setNewProperty] = useState({
    name: '',
    address: '',
    type: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    rent: ''
  });
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    // Simulate user login and load mock data
    const timer = setTimeout(() => {
      setUser({ email: "user@example.com", uid: "mock-user-id" });
      loadDashboardData();
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  const loadDashboardData = () => {
    // Load mock data
    setProperties([
      { id: 1, name: "Downtown Apartment", address: "123 Queen St, Auckland", type: "apartment", bedrooms: 2, bathrooms: 1, rent: 650, status: "Rented" },
      { id: 2, name: "Family House", address: "456 Main St, Auckland", type: "house", bedrooms: 4, bathrooms: 2, rent: 850, status: "Available" }
    ]);
    setFinancialRecords([
      { id: 1, type: "income", amount: 1500, description: "Rent payment", date: "2024-01-15" },
      { id: 2, type: "expense", amount: 200, description: "Maintenance", date: "2024-01-10" }
    ]);
    setMaintenanceRequests([
      { id: 1, property: "Downtown Apartment", issue: "Leaky faucet", status: "pending", date: "2024-01-20" }
    ]);
    setApplications([
      { id: 1, propertyTitle: "Modern Downtown Apartment", status: "Pending", appliedDate: "2024-01-15" },
      { id: 2, propertyTitle: "Family Home with Garden", status: "Approved", appliedDate: "2024-01-10" }
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

    // Simulate adding property
    const newProp = {
      id: properties.length + 1,
      ...newProperty,
      rent: parseFloat(newProperty.rent) || 0,
      status: "Available"
    };
    
    setProperties([...properties, newProp]);
    setShowAddProperty(false);
    setNewProperty({
      name: '',
      address: '',
      type: 'apartment',
      bedrooms: 1,
      bathrooms: 1,
      rent: ''
    });
  };

  const getTotalRent = () => {
    return properties.reduce((total, property) => total + (property.rent || 0), 0);
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

  // Show loading state
  if (loading) {
    return (
      <div className="fullscreen-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
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

  return (
    <UserLayout 
      title="Dashboard" 
      subtitle="Overview of your account and properties"
    >
      <div className="dashboard-content-wrapper">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Building2 size={32} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{properties.length}</h3>
              <p className="stat-label">Total Properties</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <DollarSign size={32} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">${getTotalRent().toLocaleString()}</h3>
              <p className="stat-label">Total Monthly Rent</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Wrench size={32} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{maintenanceRequests.length}</h3>
              <p className="stat-label">Maintenance Requests</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FileText size={32} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{applications.length}</h3>
              <p className="stat-label">Active Applications</p>
            </div>
          </div>
        </div>

        {/* Properties Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>
              <Building2 size={24} className="section-icon" />
              Your Properties
            </h2>
            <button
              className="add-property-btn"
              onClick={() => setShowAddProperty(true)}
            >
              <Plus size={16} />
              Add Property
            </button>
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
                    <h4 className="property-title">{property.name}</h4>
                    <span className={`status-badge ${getStatusColor(property.status)}`}>
                      {property.status}
                    </span>
                  </div>
                  <div className="property-details">
                    <p className="property-address">{property.address}</p>
                    <div className="property-specs">
                      <span>{property.bedrooms} bed</span>
                      <span>{property.bathrooms} bath</span>
                      <span>{property.type}</span>
                    </div>
                    <p className="property-rent">${property.rent}/month</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Applications Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>
              <FileText size={24} className="section-icon" />
              Recent Applications
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

        {/* Maintenance Requests Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>
              <Wrench size={24} className="section-icon" />
              Maintenance Requests
            </h2>
          </div>

          <div className="maintenance-list">
            {maintenanceRequests.length === 0 ? (
              <div className="empty-state">
                <Wrench size={48} />
                <p>No maintenance requests</p>
                <small>All your properties are in good condition</small>
              </div>
            ) : (
              maintenanceRequests.map((request) => (
                <div key={request.id} className="maintenance-item">
                  <div className="maintenance-info">
                    <h4 className="maintenance-property">{request.property}</h4>
                    <p className="maintenance-issue">{request.issue}</p>
                    <p className="maintenance-date">Reported: {new Date(request.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`status-badge ${request.status === 'pending' ? 'status-pending' : 'status-approved'}`}>
                    {request.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Property Modal */}
        {showAddProperty && (
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
                  <label htmlFor="property-name">Property Name</label>
                  <input
                    type="text"
                    id="property-name"
                    value={newProperty.name}
                    onChange={(e) => setNewProperty({...newProperty, name: e.target.value})}
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
                  <label htmlFor="property-rent">Monthly Rent ($)</label>
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

                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowAddProperty(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Add Property
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


