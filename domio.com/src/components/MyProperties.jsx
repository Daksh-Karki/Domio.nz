import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import UserLayout from './UserLayout.jsx';
import { Building2, MapPin, Bed, Bath, DollarSign, Edit, Trash2, Plus } from 'lucide-react';
import '../styles/MyProperties.css';

const MyProperties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading properties
    setTimeout(() => {
      setProperties([
        {
          id: 1,
          title: "Modern Downtown Apartment",
          location: "Auckland CBD",
          price: "$650/week",
          type: "Apartment",
          bedrooms: 2,
          bathrooms: 1,
          status: "Available",
          image: "🏢"
        },
        {
          id: 2,
          title: "Family Home with Garden",
          location: "North Shore",
          price: "$850/week",
          type: "House",
          bedrooms: 4,
          bathrooms: 2,
          status: "Rented",
          image: "🏠"
        },
        {
          id: 3,
          title: "Cozy Studio Unit",
          location: "Parnell",
          price: "$450/week",
          type: "Studio",
          bedrooms: 1,
          bathrooms: 1,
          status: "Available",
          image: "🏘️"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleDeleteProperty = (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
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

  if (loading) {
    return (
      <UserLayout title="My Properties" subtitle="Loading your properties...">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your properties...</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout 
      title="My Properties" 
      subtitle="Manage your rental properties"
    >
      <div className="my-properties-wrapper">
        {/* Header Actions */}
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
          </div>
          
          <button className="add-property-btn">
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
                  <span className="property-emoji">{property.image}</span>
                </div>
                <div className="property-actions">
                  <button className="action-btn edit-btn" title="Edit Property">
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
                <h3 className="property-title">{property.title}</h3>
                
                <div className="property-location">
                  <MapPin size={16} />
                  <span>{property.location}</span>
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
                  <span>{property.price}</span>
                </div>

                <div className={`property-status ${getStatusColor(property.status)}`}>
                  {property.status}
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
            <button className="add-property-btn primary">
              <Plus size={20} />
              Add Your First Property
            </button>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default MyProperties;
