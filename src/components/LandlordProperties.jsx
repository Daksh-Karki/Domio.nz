import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import UserLayout from './UserLayout.jsx';
import Logo from '../assets/Logo.png';
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
  Eye,
  Upload,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { 
  getLandlordProperties, 
  createProperty, 
  updateProperty, 
  deleteProperty, 
  updatePropertyStatus,
  getPropertyStats 
} from '../firebase/propertyService.js';
import { uploadPropertyImages, uploadLeaseDocument } from '../firebase/documentService.js';
import { db, storage } from '../firebase/config.js';
import { updateDoc, doc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import AddressInput from './AddressInput.jsx';
import PropertyMap from './PropertyMap.jsx';
import '../styles/shared.css';

const LandlordProperties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditProperty, setShowEditProperty] = useState(false);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [stats, setStats] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [cardImageIndices, setCardImageIndices] = useState({});
  const [propertyCoordinates, setPropertyCoordinates] = useState(null);
  const [newProperty, setNewProperty] = useState({
    title: '',
    address: '',
    city: '',
    type: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    rent: '',
    description: '',
    amenities: [],
    images: [],
    leaseDocuments: []
  });

  useEffect(() => {
    if (user) {
      loadProperties();
    }
  }, [user]);

  const loadProperties = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = await getLandlordProperties(user.uid);
      if (result.success) {
        console.log('Properties loaded with images:', result.data.map(p => ({
          id: p.id,
          title: p.title,
          images: p.images,
          imagesCount: p.images ? p.images.length : 0
        })));
        setProperties(result.data);
      } else {
        console.error('Error loading properties:', result.error);
      }
      
      // Load stats
      const statsResult = await getPropertyStats(user.uid);
      if (statsResult.success) {
        setStats(statsResult.data);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleEditProperty = (property) => {
    setSelectedProperty(property);
    setNewProperty({
      title: property.title || property.name || '',
      address: property.address || '',
      city: property.city || '',
      type: property.type?.toLowerCase() || 'apartment',
      bedrooms: property.bedrooms || 1,
      bathrooms: property.bathrooms || 1,
      rent: property.rent?.toString() || '',
      description: property.description || '',
      amenities: property.amenities || [],
      images: property.images || []
    });
    setSelectedImages([]); // Clear any previously selected images
    setPropertyCoordinates(property.coordinates || null); // Set existing coordinates
    setShowEditProperty(true);
  };

  const handleUpdateProperty = async (e) => {
    e.preventDefault();
    if (!user || !selectedProperty) return;
    
    setUploading(true);
    try {
      const updateData = {
        ...newProperty,
        rent: parseFloat(newProperty.rent) || 0,
        amenities: newProperty.amenities || [],
        coordinates: propertyCoordinates
      };
      
      const result = await updateProperty(selectedProperty.id, updateData, user.uid);
      if (result.success) {
        // Upload new images if any were selected
        if (selectedImages.length > 0) {
          console.log('Uploading images for property:', selectedProperty.id, 'Images:', selectedImages.length);
          setUploadingImages(true);
          try {
            const uploadResult = await uploadPropertyImages(selectedProperty.id, selectedImages, user.uid);
            console.log('Upload result:', uploadResult);
            if (!uploadResult.success) {
              console.error('Error uploading images:', uploadResult.error);
              alert('Error uploading images: ' + uploadResult.error);
            } else {
              console.log('Images uploaded successfully, waiting before reload...');
              // Wait a moment for Firestore to update
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (error) {
            console.error('Error uploading images:', error);
            alert('Error uploading images: ' + error.message);
          } finally {
            setUploadingImages(false);
          }
        } else {
          console.log('No new images to upload');
        }
        
        await loadProperties(); // Reload properties
        setShowEditProperty(false);
        setSelectedProperty(null);
        resetForm();
      } else {
        alert('Error updating property: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating property:', error);
      alert('Error updating property. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!user) return;
    
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        const result = await deleteProperty(propertyId, user.uid);
        if (result.success) {
          await loadProperties(); // Reload properties
        } else {
          alert('Error deleting property: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting property:', error);
        alert('Error deleting property. Please try again.');
      }
    }
  };

  const handleImageSelect = (e) => {
    console.log('Image selection triggered');
    const files = Array.from(e.target.files);
    console.log('Selected files:', files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    console.log('Filtered image files:', imageFiles);
    
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
    
    setSelectedImages(prev => {
      const newImages = [...prev, ...imageFiles];
      console.log('Updated selected images:', newImages.length, 'total images');
      return newImages;
    });
    
    // Clear the input so the same file can be selected again
    e.target.value = '';
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removePropertyImage = async (propertyId, imageIndex) => {
    if (!window.confirm('Are you sure you want to remove this image?')) {
      return;
    }

    try {
      setLoading(true);
      
      // Get the current property
      const property = properties.find(p => p.id === propertyId);
      if (!property || !property.images || !property.images[imageIndex]) {
        console.error('Property or image not found');
        return;
      }

      const imageToRemove = property.images[imageIndex];
      
      // Remove from Firestore array
      const updatedImages = property.images.filter((_, index) => index !== imageIndex);
      
      // Update the property in Firestore
      await updateDoc(doc(db, 'properties', propertyId), {
        images: updatedImages
      });

      // Delete from Firebase Storage
      if (imageToRemove.name) {
        try {
          const imageRef = ref(storage, `properties/${propertyId}/${imageToRemove.name}`);
          await deleteObject(imageRef);
        } catch (storageError) {
          console.warn('Failed to delete image from storage:', storageError);
          // Continue anyway - the Firestore update was successful
        }
      }

      // Update local state
      setProperties(prev => 
        prev.map(p => 
          p.id === propertyId 
            ? { ...p, images: updatedImages }
            : p
        )
      );

      // Update selectedProperty if it's the same property
      if (selectedProperty && selectedProperty.id === propertyId) {
        setSelectedProperty(prev => ({ ...prev, images: updatedImages }));
        
        // Adjust current image index if needed
        if (currentImageIndex >= updatedImages.length) {
          setCurrentImageIndex(Math.max(0, updatedImages.length - 1));
        }
      }

      console.log('Image removed successfully');
      
    } catch (error) {
      console.error('Error removing image:', error);
      alert('Failed to remove image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setPrimaryImage = async (propertyId, imageIndex) => {
    try {
      setLoading(true);
      
      // Get the current property
      const property = properties.find(p => p.id === propertyId);
      if (!property || !property.images || !property.images[imageIndex]) {
        console.error('Property or image not found');
        return;
      }

      // Update all images to remove primary flag, then set the selected one as primary
      const updatedImages = property.images.map((image, index) => ({
        ...image,
        isPrimary: index === imageIndex
      }));
      
      // Update the property in Firestore
      await updateDoc(doc(db, 'properties', propertyId), {
        images: updatedImages
      });

      // Update local state
      setProperties(prev => 
        prev.map(p => 
          p.id === propertyId 
            ? { ...p, images: updatedImages }
            : p
        )
      );

      // Update selectedProperty if it's the same property
      if (selectedProperty && selectedProperty.id === propertyId) {
        setSelectedProperty(prev => ({ ...prev, images: updatedImages }));
      }

      console.log('Primary image updated successfully');
      
    } catch (error) {
      console.error('Error updating primary image:', error);
      alert('Failed to update primary image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (selectedProperty && selectedProperty.images) {
      setCurrentImageIndex((prev) => 
        prev === selectedProperty.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProperty && selectedProperty.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProperty.images.length - 1 : prev - 1
      );
    }
  };

  const openPropertyDetails = (property) => {
    setSelectedProperty(property);
    setCurrentImageIndex(0);
    setShowPropertyDetails(true);
  };

  const handleAddressSelect = (placeData) => {
    console.log('Address selected:', placeData);
    setPropertyCoordinates({
      latitude: placeData.latitude,
      longitude: placeData.longitude,
      placeId: placeData.placeId,
      addressComponents: placeData.addressComponents
    });
  };

  const nextCardImage = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    if (property && property.images && property.images.length > 1) {
      setCardImageIndices(prev => ({
        ...prev,
        [propertyId]: ((prev[propertyId] || 0) + 1) % property.images.length
      }));
    }
  };

  const prevCardImage = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    if (property && property.images && property.images.length > 1) {
      setCardImageIndices(prev => ({
        ...prev,
        [propertyId]: prev[propertyId] === 0 ? property.images.length - 1 : (prev[propertyId] || 0) - 1
      }));
    }
  };

  const resetForm = () => {
    setNewProperty({
      title: '',
      address: '',
      city: '',
      type: 'apartment',
      bedrooms: 1,
      bathrooms: 1,
      rent: '',
      description: '',
      amenities: [],
      images: [],
      leaseDocuments: []
    });
    setSelectedImages([]);
    setPropertyCoordinates(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'status-available';
      case 'rented':
        return 'status-rented';
      case 'unavailable':
        return 'status-maintenance';
      default:
        return 'status-default';
    }
  };

  const getTotalMonthlyIncome = () => {
    return stats.totalRent || 0;
  };

  const getOccupancyRate = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.rented / stats.total) * 100);
  };

  if (loading) {
    return (
      <UserLayout title="Property Management" subtitle="Loading your properties...">
        <div className="loading-container">
          <div className="loading-logo">
            <img src={Logo} alt="Domio.nz Logo" />
          </div>
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
              <span className="stat-number">{stats.total || 0}</span>
              <span className="stat-label">Total Properties</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.available || 0}</span>
              <span className="stat-label">Available</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.rented || 0}</span>
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
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="add-property-btn"
              onClick={() => window.location.href = '/landlord/add-property'}
            >
              <Plus size={20} />
              Add New Property</button>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="properties-grid">
          {properties.map((property) => (
            <div key={property.id} className="property-card">
              <div className="property-header">
                <div className="property-image-container" onClick={() => openPropertyDetails(property)}>
                  {property.images && property.images.length > 0 && property.images[0].downloadURL ? (
                    <div className="property-image-slideshow">
                      <img 
                        src={property.images[cardImageIndices[property.id] || 0]?.downloadURL || property.images[0].downloadURL} 
                        alt={property.title || property.name}
                        className="property-image-cover"
                        onError={(e) => {
                          console.log('Image failed to load:', property.images[cardImageIndices[property.id] || 0]);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="property-emoji-fallback" style={{ display: 'none' }}>
                        <span>🏠</span>
                      </div>
                      
                      {property.images.length > 1 && (
                        <>
                          <div className="card-image-counter">
                            <ImageIcon size={12} />
                            <span>{property.images.length}</span>
                          </div>
                          
                          <button 
                            className="card-slideshow-nav prev" 
                            onClick={(e) => {
                              e.stopPropagation();
                              prevCardImage(property.id);
                            }}
                          >
                            <ChevronLeft size={16} />
                          </button>
                          
                          <button 
                            className="card-slideshow-nav next" 
                            onClick={(e) => {
                              e.stopPropagation();
                              nextCardImage(property.id);
                            }}
                          >
                            <ChevronRight size={16} />
                          </button>
                          
                          <div className="card-slideshow-indicators">
                            {property.images.map((_, index) => (
                              <button
                                key={index}
                                className={`card-indicator ${index === (cardImageIndices[property.id] || 0) ? 'active' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCardImageIndices(prev => ({
                                    ...prev,
                                    [property.id]: index
                                  }));
                                }}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="property-emoji-fallback">
                      <span>🏠</span>
                    </div>
                  )}
                </div>
                <div className="property-actions">
                  <button 
                    className="action-btn view-btn" 
                    title="View Details"
                    onClick={() => openPropertyDetails(property)}
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
                <h3 className="property-title">{property.title || property.name}</h3>
                
                <div className="property-location">
                  <MapPin size={16} />
                  <span>{property.address}</span>
                </div>

                <div className="property-details">
                  <div className="detail-item">
                    <Building2 size={16} />
                    <span>{property.type?.charAt(0).toUpperCase() + property.type?.slice(1)}</span>
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
                  {property.status?.charAt(0).toUpperCase() + property.status?.slice(1)}
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
        {properties.length === 0 && !loading && (
          <div className="empty-state">
            <Building2 size={64} className="empty-icon" />
            <h3>No Properties Yet</h3>
            <p>Start building your property portfolio by adding your first rental property.</p>
            <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
              <p>Debug Info:</p>
              <p>User ID: {user?.uid || 'No user'}</p>
              <p>Properties loaded: {properties.length}</p>
            </div>
            <button 
              className="add-property-btn primary"
              onClick={() => window.location.href = '/landlord/add-property'}
            >
              <Plus size={20} />
              Add Your First Property
            </button>
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
                  <label htmlFor="edit-property-title">Property Title</label>
                  <input
                    type="text"
                    id="edit-property-title"
                    value={newProperty.title}
                    onChange={(e) => setNewProperty({...newProperty, title: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-property-address">Address</label>
                  <AddressInput
                    value={newProperty.address}
                    onChange={(address) => setNewProperty({...newProperty, address})}
                    onPlaceSelected={handleAddressSelect}
                    placeholder="Start typing to search for an address..."
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
                  <label htmlFor="edit-property-description">Property Description</label>
                  <textarea
                    id="edit-property-description"
                    rows="4"
                    value={newProperty.description}
                    onChange={(e) => setNewProperty({...newProperty, description: e.target.value})}
                    placeholder="Describe your property features, amenities, and what makes it special..."
                    className="form-textarea"
                  />
                  <small className="form-help">Provide details about your property to attract quality tenants</small>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-property-images">Add More Images</label>
                  <div className="image-upload-section">
                    <input
                      type="file"
                      id="edit-property-images"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="edit-property-images" className="image-upload-btn">
                      <ImageIcon size={20} />
                      Add Images (Max 10, 5MB each)
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
                    onClick={() => setShowEditProperty(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn" disabled={uploading || uploadingImages}>
                    {uploadingImages ? 'Uploading Images...' : uploading ? 'Updating...' : 'Update Property'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Property Details Modal */}
        {showPropertyDetails && selectedProperty && (
          <div className="modal-overlay" onClick={() => setShowPropertyDetails(false)}>
            <div className="modal large property-details-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{selectedProperty.title || selectedProperty.name}</h3>
                <button className="close-modal-btn" onClick={() => setShowPropertyDetails(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="property-view-content">
                {/* Hero Section with Image and Basic Info */}
                <div className="property-hero">
                  {/* Main Image */}
                  {selectedProperty.images && selectedProperty.images.length > 0 ? (
                    <div className="property-hero-image">
                      <img 
                        src={selectedProperty.images[currentImageIndex].downloadURL} 
                        alt={`${selectedProperty.title} - Image ${currentImageIndex + 1}`}
                        className="hero-image"
                      />
                      
                      {selectedProperty.images.length > 1 && (
                        <>
                          <button className="hero-nav prev" onClick={prevImage}>
                            <ChevronLeft size={24} />
                          </button>
                          <button className="hero-nav next" onClick={nextImage}>
                            <ChevronRight size={24} />
                          </button>
                          
                          <div className="hero-indicators">
                            {selectedProperty.images.map((_, index) => (
                              <button
                                key={index}
                                className={`hero-indicator ${index === currentImageIndex ? 'active' : ''}`}
                                onClick={() => setCurrentImageIndex(index)}
                              />
                            ))}
                          </div>
                          
                          <div className="hero-counter">
                            {currentImageIndex + 1} / {selectedProperty.images.length}
                          </div>
                        </>
                      )}
                      
                      <div className="status-overlay">
                        <span className={`status-badge ${getStatusColor(selectedProperty.status)}`}>
                          {selectedProperty.status?.charAt(0).toUpperCase() + selectedProperty.status?.slice(1)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="no-image-hero">
                      <Building2 size={80} />
                      <p>No images available</p>
                    </div>
                  )}

                  {/* Property Summary Card */}
                  <div className="property-summary-card">
                    <div className="summary-header">
                      <h2 className="property-title">{selectedProperty.title || selectedProperty.name}</h2>
                      <div className="property-location">
                        <MapPin size={18} />
                        <span>{selectedProperty.address}</span>
                      </div>
                    </div>
                    
                    <div className="summary-price">
                      <span className="price-amount">${selectedProperty.rent}</span>
                      <span className="price-period">/week</span>
                    </div>

                    <div className="summary-specs">
                      <div className="spec-badge">
                        <Building2 size={16} />
                        <span>{selectedProperty.type?.charAt(0).toUpperCase() + selectedProperty.type?.slice(1)}</span>
                      </div>
                      <div className="spec-badge">
                        <Bed size={16} />
                        <span>{selectedProperty.bedrooms} bed</span>
                      </div>
                      <div className="spec-badge">
                        <Bath size={16} />
                        <span>{selectedProperty.bathrooms} bath</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property Details Grid */}
                <div className="property-details-grid">
                  {/* Description Section */}
                  {selectedProperty.description && (
                    <div className="detail-card">
                      <div className="card-header">
                        <h3>About This Property</h3>
                      </div>
                      <div className="card-content">
                        <p>{selectedProperty.description}</p>
                      </div>
                    </div>
                  )}

                  {/* Amenities Section */}
                  {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                    <div className="detail-card">
                      <div className="card-header">
                        <h3>Amenities & Features</h3>
                      </div>
                      <div className="card-content">
                        <div className="amenities-grid">
                          {selectedProperty.amenities.map((amenity, index) => (
                            <div key={index} className="amenity-item">
                              <span className="amenity-icon">✓</span>
                              <span className="amenity-name">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Property Information */}
                  <div className="detail-card">
                    <div className="card-header">
                      <h3>Property Information</h3>
                    </div>
                    <div className="card-content">
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Property Type</span>
                          <span className="info-value">{selectedProperty.type?.charAt(0).toUpperCase() + selectedProperty.type?.slice(1)}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Bedrooms</span>
                          <span className="info-value">{selectedProperty.bedrooms}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Bathrooms</span>
                          <span className="info-value">{selectedProperty.bathrooms}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Weekly Rent</span>
                          <span className="info-value">${selectedProperty.rent}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Status</span>
                          <span className="info-value">{selectedProperty.status?.charAt(0).toUpperCase() + selectedProperty.status?.slice(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image Gallery */}
                  {selectedProperty.images && selectedProperty.images.length > 0 && (
                    <div className="detail-card">
                      <div className="card-header">
                        <h3>Photo Gallery</h3>
                        <span className="image-count">{selectedProperty.images.length} photo{selectedProperty.images.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="card-content">
                        <div className="image-gallery">
                          {selectedProperty.images.map((image, index) => (
                            <div 
                              key={index} 
                              className={`gallery-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                            >
                              <img 
                                src={image.downloadURL} 
                                alt={`Property image ${index + 1}`}
                                onClick={() => setCurrentImageIndex(index)}
                              />
                              <div 
                                className={`primary-indicator ${image.isPrimary ? 'active' : 'clickable'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!image.isPrimary) {
                                    setPrimaryImage(selectedProperty.id, index);
                                  }
                                }}
                                title={image.isPrimary ? 'Primary image' : 'Click to set as primary'}
                              >
                                ★
                              </div>
                              <button
                                className="remove-image-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removePropertyImage(selectedProperty.id, index);
                                }}
                                title="Remove image"
                              >
                                <X size={14} />
                              </button>
                              {!image.isPrimary && (
                                <div 
                                  className="set-primary-overlay"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPrimaryImage(selectedProperty.id, index);
                                  }}
                                  title="Set as primary image"
                                >
                                  Set as Primary
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Property Status and Map */}
                <div className="property-status">
                  <h4>Status</h4>
                  <span className={`status-badge ${getStatusColor(selectedProperty.status)}`}>
                    {selectedProperty.status?.charAt(0).toUpperCase() + selectedProperty.status?.slice(1)}
                  </span>
                </div>

                {/* Property Map */}
                {selectedProperty.coordinates && (
                  <div className="property-map-section">
                    <h4>Location</h4>
                    <PropertyMap
                      latitude={selectedProperty.coordinates.latitude}
                      longitude={selectedProperty.coordinates.longitude}
                      address={selectedProperty.address}
                    />
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button 
                  className="action-btn secondary"
                  onClick={() => {
                    setShowPropertyDetails(false);
                    handleEditProperty(selectedProperty);
                  }}
                >
                  <Edit size={16} />
                  Edit Property
                </button>
                <button 
                  className="action-btn danger"
                  onClick={() => {
                    setShowPropertyDetails(false);
                    handleDeleteProperty(selectedProperty.id);
                  }}
                >
                  <Trash2 size={16} />
                  Delete Property
                </button>
                <button 
                  className="action-btn primary"
                  onClick={() => setShowPropertyDetails(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default LandlordProperties;

