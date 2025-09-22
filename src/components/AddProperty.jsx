import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import UserLayout from './UserLayout.jsx';
import { 
  ArrowLeft,
  MapPin,
  Building2,
  DollarSign,
  Bed,
  Bath,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { createProperty } from '../firebase/propertyService.js';
import { uploadPropertyImages } from '../firebase/documentService.js';
import AddressInput from './AddressInput.jsx';
import PropertyMap from './PropertyMap.jsx';
import '../styles/shared.css';

const AddProperty = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
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
    images: []
  });

  const handleAddressSelect = (placeData) => {
    console.log('Address selected:', placeData);
    setPropertyCoordinates({
      latitude: placeData.latitude,
      longitude: placeData.longitude
    });
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (selectedImages.length + files.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }
    
    // Check file sizes (max 5MB each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('Some files are too large. Maximum size is 5MB per image.');
      return;
    }
    
    setSelectedImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    if (!user) {
      console.error('No user found');
      alert('You must be logged in to add a property');
      return;
    }
    
    // Check if user is a landlord (allow if no role is set for testing)
    if (user.role && user.role.toLowerCase() !== 'landlord') {
      console.error('User is not a landlord:', user.role);
      alert('Only landlords can add properties. Your role: ' + (user.role || 'none'));
      return;
    }
    
    console.log('User role check passed:', user.role || 'no role set');
    
    // Validate required fields
    if (!newProperty.title || !newProperty.title.trim()) {
      alert('Please enter a property title');
      return;
    }
    
    if (!newProperty.address || !newProperty.address.trim()) {
      alert('Please enter a property address');
      return;
    }
    
    if (!newProperty.rent || parseFloat(newProperty.rent) <= 0) {
      alert('Please enter a valid weekly rent amount');
      return;
    }
    
    console.log('Starting property creation...', { 
      user: user.uid, 
      userRole: user.role,
      propertyData: newProperty,
      selectedImages: selectedImages.length,
      coordinates: propertyCoordinates
    });
    setLoading(true);
    try {
      const propertyData = {
        ...newProperty,
        landlordId: user.uid,
        rent: parseFloat(newProperty.rent) || 0,
        status: 'available',
        amenities: newProperty.amenities || [],
        coordinates: propertyCoordinates
      };
      
      console.log('Creating property with data:', propertyData);
      const result = await createProperty(propertyData);
      console.log('Property creation result:', result);
      if (result.success) {
        // Upload images if any were selected
        if (selectedImages.length > 0) {
          setUploadingImages(true);
          try {
            const uploadResult = await uploadPropertyImages(result.data.id, selectedImages, user.uid);
            if (!uploadResult.success) {
              console.error('Error uploading images:', uploadResult.error);
              alert('Property created but failed to upload images: ' + uploadResult.error);
            }
          } catch (error) {
            console.error('Error uploading images:', error);
            alert('Property created but failed to upload images: ' + error.message);
          } finally {
            setUploadingImages(false);
          }
        }
        
        // Reset form and redirect
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
          images: []
        });
        setSelectedImages([]);
        setPropertyCoordinates(null);
        
        // Show success message and redirect
        alert('Property added successfully!');
        window.location.href = '/landlord/properties';
      } else {
        alert('Error creating property: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating property:', error);
      alert('Error creating property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewProperty(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <UserLayout 
      title="Add New Property" 
      subtitle="Create a new property listing"
    >
      <div className="add-property-container">
        <div className="page-header">
          <button 
            className="back-btn"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>

        <div className="add-property-form-container">
          <form 
            onSubmit={(e) => {
              console.log('Form onSubmit triggered');
              handleAddProperty(e);
            }} 
            className="add-property-form"
          >
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label htmlFor="property-title">Property Title</label>
                <input
                  type="text"
                  id="property-title"
                  value={newProperty.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter a descriptive title for your property"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="property-address">Address</label>
                <AddressInput
                  value={newProperty.address}
                  onChange={(address) => handleInputChange('address', address)}
                  onPlaceSelected={handleAddressSelect}
                  placeholder="Start typing to search for an address..."
                  required
                />
              </div>

              {propertyCoordinates && (
                <div className="property-map-section">
                  <h4>Property Location</h4>
                  <PropertyMap 
                    latitude={propertyCoordinates.latitude}
                    longitude={propertyCoordinates.longitude}
                    address={newProperty.address}
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="property-type">Property Type</label>
                  <select
                    id="property-type"
                    value={newProperty.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
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
                    onChange={(e) => handleInputChange('rent', e.target.value)}
                    placeholder="0.00"
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
                    max="20"
                    value={newProperty.bedrooms}
                    onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value))}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="property-bathrooms">Bathrooms</label>
                  <input
                    type="number"
                    id="property-bathrooms"
                    min="1"
                    max="10"
                    value={newProperty.bathrooms}
                    onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Property Details</h3>
              
              <div className="form-group">
                <label htmlFor="property-description">Property Description</label>
                <textarea
                  id="property-description"
                  rows="4"
                  value={newProperty.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your property features, amenities, and what makes it special..."
                  className="form-textarea"
                />
                <small className="form-help">Provide details about your property to attract quality tenants</small>
              </div>

              <div className="form-group">
                <label htmlFor="property-amenities">Amenities</label>
                <div className="amenities-grid">
                  {[
                    'Parking', 'Balcony', 'Garden', 'Swimming Pool', 'Gym', 
                    'Laundry', 'Air Conditioning', 'Heating', 'WiFi', 'Pet Friendly',
                    'Furnished', 'Unfurnished', 'Near Transport', 'Security'
                  ].map(amenity => (
                    <label key={amenity} className="amenity-checkbox">
                      <input
                        type="checkbox"
                        checked={newProperty.amenities.includes(amenity)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewProperty(prev => ({
                              ...prev,
                              amenities: [...prev.amenities, amenity]
                            }));
                          } else {
                            setNewProperty(prev => ({
                              ...prev,
                              amenities: prev.amenities.filter(a => a !== amenity)
                            }));
                          }
                        }}
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Property Images</h3>
              
              <div className="form-group">
                <label htmlFor="property-images">Upload Images</label>
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
                    <Upload size={20} />
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
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <small className="form-help">Upload high-quality photos to showcase your property</small>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  console.log('Debug info:', {
                    user: user,
                    newProperty: newProperty,
                    selectedImages: selectedImages.length,
                    coordinates: propertyCoordinates,
                    loading: loading,
                    uploadingImages: uploadingImages
                  });
                  alert('Check console for debug info');
                }}
              >
                Debug
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  console.log('Test button clicked - form should work');
                  // Test form submission directly
                  handleAddProperty(new Event('submit'));
                }}
              >
                Test Submit
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || uploadingImages}
                onClick={(e) => {
                  console.log('Add Property button clicked');
                  if (!loading && !uploadingImages) {
                    console.log('Button not disabled, proceeding with form submission');
                  } else {
                    console.log('Button is disabled:', { loading, uploadingImages });
                  }
                }}
              >
                {loading ? 'Creating Property...' : 
                 uploadingImages ? 'Uploading Images...' : 
                 'Add Property'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </UserLayout>
  );
};

export default AddProperty;
