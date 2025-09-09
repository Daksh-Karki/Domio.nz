import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import UserLayout from './UserLayout.jsx';
import { 
  Building2, 
  MapPin, 
  Bed, 
  Bath, 
  DollarSign, 
  Edit, 
  Trash2, 
  Plus, 
  Users, 
  Calendar,
  FileText,
  Wrench,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import '../styles/MyProperties.css';

const LandlordProperties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [showEditProperty, setShowEditProperty] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [newProperty, setNewProperty] = useState({
    name: '',
    address: '',
    type: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    rent: '',
    description: '',
    amenities: [],
    images: []
  });

  useEffect(() => {
    // Simulate loading properties
    setTimeout(() => {
      setProperties([
        {
          id: 1,
          name: "Modern Downtown Apartment",
          address: "123 Queen St, Auckland CBD",
          type: "Apartment",
          bedrooms: 2,
          bathrooms: 1,
          rent: 650,
          status: "Rented",
          tenant: "John Smith",
          tenantEmail: "john@example.com",
          leaseStart: "2024-01-01",
          leaseEnd: "2024-12-31",
          description: "Beautiful modern apartment in the heart of Auckland CBD",
          amenities: ["Parking", "Gym", "Pool", "Balcony"],
          images: ["🏢"],
          maintenanceRequests: 1,
          lastRentPayment: "2024-01-15"
        },
        {
          id: 2,
          name: "Family Home with Garden",
          address: "456 Main St, North Shore",
          type: "House",
          bedrooms: 4,
          bathrooms: 2,
          rent: 850,
          status: "Available",
          description: "Spacious family home with large garden",
          amenities: ["Garden", "Garage", "Fireplace"],
          images: ["🏠"],
          maintenanceRequests: 0,
          applications: 2
        },
        {
          id: 3,
          name: "Cozy Studio Unit",
          address: "789 Parnell Rd, Parnell",
          type: "Studio",
          bedrooms: 1,
          bathrooms: 1,
          rent: 450,
          status: "Rented",
          tenant: "Sarah Johnson",
          tenantEmail: "sarah@example.com",
          leaseStart: "2024-02-01",
          leaseEnd: "2024-11-30",
          description: "Perfect studio for young professionals",
          amenities: ["Furnished", "WiFi", "Laundry"],
          images: ["🏘️"],
          maintenanceRequests: 0,
          lastRentPayment: "2024-01-20"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddProperty = async (e) => {
    e.preventDefault();
    const newProp = {
      id: properties.length + 1,
      ...newProperty,
      rent: parseFloat(newProperty.rent) || 0,
      status: "Available",
      maintenanceRequests: 0,
      applications: 0
    };
    
    setProperties([...properties, newProp]);
    setShowAddProperty(false);
    setNewProperty({
      name: '',
      address: '',
      type: 'apartment',
      bedrooms: 1,
      bathrooms: 1,
      rent: '',
      description: '',
      amenities: [],
      images: []
    });
  };

  const handleEditProperty = (property) => {
    setSelectedProperty(property);
    setNewProperty({
      name: property.name,
      address: property.address,
      type: property.type.toLowerCase(),
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      rent: property.rent.toString(),
      description: property.description,
      amenities: property.amenities,
      images: property.images
    });
    setShowEditProperty(true);
  };

  const handleUpdateProperty = async (e) => {
    e.preventDefault();
    setProperties(prev => 
      prev.map(prop => 
        prop.id === selectedProperty.id 
          ? { 
              ...prop, 
              ...newProperty, 
              rent: parseFloat(newProperty.rent) || 0 
            }
          : prop
      )
    );
    setShowEditProperty(false);
    setSelectedProperty(null);
  };

  const handleDeleteProperty = (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      setProperties(prev => prev.filter(prop => prop.id !== propertyId));
    }
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

  const getTotalMonthlyIncome = () => {
    return properties
      .filter(property => property.status === 'Rented')
      .reduce((total, property) => total + (property.rent || 0), 0);
  };

  const getOccupancyRate = () => {
    if (properties.length === 0) return 0;
    const rentedProperties = properties.filter(p => p.status === 'Rented').length;
    return Math.round((rentedProperties / properties.length) * 100);
  };

  if (loading) {
    return (
      <UserLayout title="Property Management" subtitle="Loading your properties...">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your properties...</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout 
      title="Property Management" 
      subtitle="Manage your rental properties and tenants"
    >
      <div className="my-properties-wrapper">
        {/* Header Stats */}
        <div className="properties-header">
          <div className="properties-stats">
            <div className="stat-item">
              <span className="stat-number">{properties.length}</span>
              <span className="stat-label">Total Properties</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {properties.filter(p => p.status === 'Available').length}
              </span>
              <span className="stat-label">Available</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {properties.filter(p => p.status === 'Rented').length}
              </span>
              <span className="stat-label">Rented</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">${getTotalMonthlyIncome().toLocaleString()}</span>
              <span className="stat-label">Monthly Income</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{getOccupancyRate()}%</span>
              <span className="stat-label">Occupancy Rate</span>
            </div>
          </div>
          
          <button 
            className="add-property-btn"
            onClick={() => setShowAddProperty(true)}
          >
            <Plus size={20} />
            Add New Property
          </button>
        </div>

        {/* Properties Grid */}
        <div className="properties-grid">
          {properties.map((property) => (
            <div key={property.id} className="property-card">
              <div className="property-header">
                <div className="property-image">
                  <span className="property-emoji">{property.images[0] || "🏠"}</span>
                </div>
                <div className="property-actions">
                  <button 
                    className="action-btn view-btn" 
                    title="View Details"
                    onClick={() => handleEditProperty(property)}
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    className="action-btn edit-btn" 
                    title="Edit Property"
                    onClick={() => handleEditProperty(property)}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="action-btn delete-btn" 
                    title="Delete Property"
                    onClick={() => handleDeleteProperty(property.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="property-content">
                <h3 className="property-title">{property.name}</h3>
                
                <div className="property-location">
                  <MapPin size={16} />
                  <span>{property.address}</span>
                </div>

                <div className="property-details">
                  <div className="detail-item">
                    <Building2 size={16} />
                    <span>{property.type}</span>
                  </div>
                  <div className="detail-item">
                    <Bed size={16} />
                    <span>{property.bedrooms} bed</span>
                  </div>
                  <div className="detail-item">
                    <Bath size={16} />
                    <span>{property.bathrooms} bath</span>
                  </div>
                </div>

                <div className="property-price">
                  <DollarSign size={16} />
                  <span>${property.rent}/week</span>
                </div>

                <div className={`property-status ${getStatusColor(property.status)}`}>
                  {property.status}
                </div>

                {/* Property Info */}
                <div className="property-info">
                  {property.tenant && (
                    <div className="tenant-info">
                      <Users size={14} />
                      <span>Tenant: {property.tenant}</span>
                    </div>
                  )}
                  
                  {property.maintenanceRequests > 0 && (
                    <div className="maintenance-info">
                      <Wrench size={14} />
                      <span>{property.maintenanceRequests} maintenance request(s)</span>
                    </div>
                  )}
                  
                  {property.applications > 0 && (
                    <div className="applications-info">
                      <FileText size={14} />
                      <span>{property.applications} application(s)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {properties.length === 0 && (
          <div className="empty-state">
            <Building2 size={64} className="empty-icon" />
            <h3>No Properties Yet</h3>
            <p>Start building your property portfolio by adding your first rental property.</p>
            <button 
              className="add-property-btn primary"
              onClick={() => setShowAddProperty(true)}
            >
              <Plus size={20} />
              Add Your First Property
            </button>
          </div>
        )}

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
                    <label htmlFor="property-type">Property Type</label>
                    <select
                      id="property-type"
                      value={newProperty.type}
                      onChange={(e) => setNewProperty({...newProperty, type: e.target.value})}
                      required
                    >
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="studio">Studio</option>
                      <option value="condo">Condo</option>
                      <option value="townhouse">Townhouse</option>
                    </select>
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
                  <label htmlFor="property-description">Description</label>
                  <textarea
                    id="property-description"
                    rows="3"
                    value={newProperty.description}
                    onChange={(e) => setNewProperty({...newProperty, description: e.target.value})}
                    placeholder="Describe your property..."
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

        {/* Edit Property Modal */}
        {showEditProperty && selectedProperty && (
          <div className="modal-overlay" onClick={() => setShowEditProperty(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Edit Property</h3>
                <button className="close-modal-btn" onClick={() => setShowEditProperty(false)}>
                  ×
                </button>
              </div>
              
              <form onSubmit={handleUpdateProperty} className="modal-form">
                <div className="form-group">
                  <label htmlFor="edit-property-name">Property Name</label>
                  <input
                    type="text"
                    id="edit-property-name"
                    value={newProperty.name}
                    onChange={(e) => setNewProperty({...newProperty, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-property-address">Address</label>
                  <input
                    type="text"
                    id="edit-property-address"
                    value={newProperty.address}
                    onChange={(e) => setNewProperty({...newProperty, address: e.target.value})}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-property-type">Property Type</label>
                    <select
                      id="edit-property-type"
                      value={newProperty.type}
                      onChange={(e) => setNewProperty({...newProperty, type: e.target.value})}
                      required
                    >
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="studio">Studio</option>
                      <option value="condo">Condo</option>
                      <option value="townhouse">Townhouse</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-property-rent">Weekly Rent ($)</label>
                    <input
                      type="number"
                      id="edit-property-rent"
                      min="0"
                      step="0.01"
                      value={newProperty.rent}
                      onChange={(e) => setNewProperty({...newProperty, rent: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-property-bedrooms">Bedrooms</label>
                    <input
                      type="number"
                      id="edit-property-bedrooms"
                      min="1"
                      value={newProperty.bedrooms}
                      onChange={(e) => setNewProperty({...newProperty, bedrooms: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-property-bathrooms">Bathrooms</label>
                    <input
                      type="number"
                      id="edit-property-bathrooms"
                      min="1"
                      value={newProperty.bathrooms}
                      onChange={(e) => setNewProperty({...newProperty, bathrooms: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-property-description">Description</label>
                  <textarea
                    id="edit-property-description"
                    rows="3"
                    value={newProperty.description}
                    onChange={(e) => setNewProperty({...newProperty, description: e.target.value})}
                    placeholder="Describe your property..."
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowEditProperty(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Update Property
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default LandlordProperties;

