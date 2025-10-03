import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import UserLayout from './UserLayout.jsx';
import Logo from '../assets/Logo.png';
import { 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Bath, 
  Home, 
  DollarSign, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Star,
  Heart,
  Share2,
  Camera,
  Wifi,
  Car,
  Pet,
  Smoking,
  Parking,
  Gym,
  Pool,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { getProperty, getUserProfile } from '../firebase/propertyService.js';
import ApplicationModal from './ApplicationModal.jsx';
import '../styles/PropertyDetails.css';

const PropertyDetails = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [landlord, setLandlord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (propertyId) {
      loadPropertyDetails();
    }
  }, [propertyId]);

  const loadPropertyDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load property details
      const propertyResult = await getProperty(propertyId);
      if (propertyResult.success) {
        setProperty(propertyResult.data);
        
        // Load landlord information
        if (propertyResult.data.landlordId) {
          const landlordResult = await getUserProfile(propertyResult.data.landlordId);
          if (landlordResult.success) {
            setLandlord(landlordResult.data);
          }
        }
      } else {
        setError(propertyResult.error);
      }
    } catch (err) {
      setError('Failed to load property details');
      console.error('Error loading property:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleImageSelect = (index) => {
    setSelectedImageIndex(index);
  };

  const handleExpressInterest = () => {
    setShowInterestModal(true);
  };

  const handleApply = () => {
    setShowApplyModal(true);
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    // TODO: Implement favorite functionality
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: `Check out this property: ${property?.title}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Property link copied to clipboard!');
    }
  };

  const formatPrice = (price) => {
    return `$${price?.toLocaleString()}/week`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date?.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-NZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAmenityIcon = (amenity) => {
    const amenityIcons = {
      'wifi': Wifi,
      'parking': Car,
      'pets': Pet,
      'smoking': Smoking,
      'gym': Gym,
      'pool': Pool
    };
    return amenityIcons[amenity.toLowerCase()] || CheckCircle;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'status-available';
      case 'rented':
        return 'status-rented';
      case 'unavailable':
        return 'status-unavailable';
      default:
        return 'status-available';
    }
  };

  if (loading) {
    return (
      <UserLayout title="Property Details" subtitle="Loading property information...">
        <div className="loading-container">
          <div className="loading-logo">
            <img src={Logo} alt="Domio.nz Logo" />
          </div>
          <p>Loading property details...</p>
        </div>
      </UserLayout>
    );
  }

  if (error || !property) {
    return (
      <UserLayout title="Property Details" subtitle="Property not found">
        <div className="error-container">
          <AlertCircle size={64} className="error-icon" />
          <h3>Property Not Found</h3>
          <p>{error || 'The property you are looking for does not exist or has been removed.'}</p>
          <button className="back-btn" onClick={handleBack}>
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout 
      title="Property Details" 
      subtitle={property.title}
    >
      <div className="property-details-wrapper">
        {/* Header */}
        <div className="property-header">
          <button className="back-btn" onClick={handleBack}>
            <ArrowLeft size={16} />
            Back
          </button>
          
          <div className="property-actions">
            <button 
              className={`action-btn ${isFavorited ? 'favorited' : ''}`}
              onClick={handleFavorite}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={16} />
            </button>
            <button 
              className="action-btn"
              onClick={handleShare}
              title="Share property"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Property Images */}
        <div className="property-images-section">
          <div className="main-image">
            {property.images && property.images.length > 0 ? (
              <img 
                src={property.images[selectedImageIndex]?.url} 
                alt={property.title}
                className="property-main-img"
              />
            ) : (
              <div className="property-placeholder">
                <Camera size={48} />
                <p>No images available</p>
              </div>
            )}
            <div className={`property-status ${getStatusColor(property.status)}`}>
              {property.status?.charAt(0).toUpperCase() + property.status?.slice(1)}
            </div>
          </div>
          
          {property.images && property.images.length > 1 && (
            <div className="image-thumbnails">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                  onClick={() => handleImageSelect(index)}
                >
                  <img src={image.url} alt={`${property.title} ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Property Info */}
        <div className="property-info-grid">
          <div className="property-main-info">
            {/* Title and Price */}
            <div className="property-title-section">
              <h1 className="property-title">{property.title}</h1>
              <div className="property-price">
                {formatPrice(property.rent)}
              </div>
            </div>

            {/* Location */}
            <div className="property-location">
              <MapPin size={20} />
              <span>{property.address}, {property.city}</span>
            </div>

            {/* Property Details */}
            <div className="property-specs">
              <div className="spec-item">
                <Bed size={18} />
                <span>{property.bedrooms} Bedroom{property.bedrooms !== 1 ? 's' : ''}</span>
              </div>
              <div className="spec-item">
                <Bath size={18} />
                <span>{property.bathrooms} Bathroom{property.bathrooms !== 1 ? 's' : ''}</span>
              </div>
              <div className="spec-item">
                <Home size={18} />
                <span>{property.type?.charAt(0).toUpperCase() + property.type?.slice(1)}</span>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="property-description">
                <h3>Description</h3>
                <p>{property.description}</p>
              </div>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="property-amenities">
                <h3>Amenities</h3>
                <div className="amenities-grid">
                  {property.amenities.map((amenity, index) => {
                    const IconComponent = getAmenityIcon(amenity);
                    return (
                      <div key={index} className="amenity-item">
                        <IconComponent size={16} />
                        <span>{amenity.charAt(0).toUpperCase() + amenity.slice(1)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Property Meta */}
            <div className="property-meta">
              <div className="meta-item">
                <Calendar size={16} />
                <span>Listed {formatDate(property.createdAt)}</span>
              </div>
              <div className="meta-item">
                <User size={16} />
                <span>Property ID: {property.id}</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="property-sidebar">
            {/* Landlord Info */}
            {landlord && (
              <div className="landlord-card">
                <h3>Property Owner</h3>
                <div className="landlord-info">
                  <div className="landlord-avatar">
                    <User size={24} />
                  </div>
                  <div className="landlord-details">
                    <h4>{landlord.firstName} {landlord.lastName}</h4>
                    <p>Property Owner</p>
                  </div>
                </div>
                <div className="landlord-actions">
                  <button 
                    className="contact-btn"
                    onClick={handleExpressInterest}
                  >
                    <Phone size={16} />
                    Contact Owner
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                className="apply-btn primary"
                onClick={handleApply}
                disabled={property.status !== 'available'}
              >
                {property.status === 'available' ? 'Apply Now' : 'Not Available'}
              </button>
              <button 
                className="interest-btn secondary"
                onClick={handleExpressInterest}
              >
                Express Interest
              </button>
            </div>

            {/* Property Summary */}
            <div className="property-summary">
              <h3>Property Summary</h3>
              <div className="summary-item">
                <span>Weekly Rent:</span>
                <span>{formatPrice(property.rent)}</span>
              </div>
              <div className="summary-item">
                <span>Property Type:</span>
                <span>{property.type?.charAt(0).toUpperCase() + property.type?.slice(1)}</span>
              </div>
              <div className="summary-item">
                <span>Bedrooms:</span>
                <span>{property.bedrooms}</span>
              </div>
              <div className="summary-item">
                <span>Bathrooms:</span>
                <span>{property.bathrooms}</span>
              </div>
              <div className="summary-item">
                <span>Status:</span>
                <span className={`status-text ${getStatusColor(property.status)}`}>
                  {property.status?.charAt(0).toUpperCase() + property.status?.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Application Modal */}
        <ApplicationModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          property={property}
          user={user}
          type="application"
        />

        {/* Interest Modal */}
        <ApplicationModal
          isOpen={showInterestModal}
          onClose={() => setShowInterestModal(false)}
          property={property}
          user={user}
          type="interest"
        />
      </div>
    </UserLayout>
  );
};

export default PropertyDetails;
