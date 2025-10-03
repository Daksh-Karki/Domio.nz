import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import StartConversation from './StartConversation.jsx';
import Logo from '../assets/Logo.png';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Bed, 
  Bath, 
  Home, 
  Filter, 
  Star, 
  Calendar, 
  User, 
  Eye, 
  Heart,
  ChevronLeft,
  ChevronRight,
  MessageCircle
} from 'lucide-react';
import { getAvailableProperties } from '../firebase/propertyService.js';
import '../styles/BrowseProperties.css';

const BrowseProperties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    location: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [favorites, setFavorites] = useState(new Set());
  const [showStartConversation, setShowStartConversation] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      console.log('Loading available properties...');
      const result = await getAvailableProperties();
      
      console.log('Properties result:', result);
      
      if (result.success) {
        console.log('Properties loaded successfully:', result.data.length, 'properties');
        console.log('Properties data:', result.data);
        setProperties(result.data);
      } else {
        console.error('Error fetching properties:', result.error);
        // Fallback to empty array if no properties found
        setProperties([]);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      // Fallback to empty array on error
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      
      // If no search term or filters, load all available properties
      if (!searchTerm.trim() && Object.values(filters).every(filter => !filter)) {
        await loadProperties();
        return;
      }
      
      // TODO: Implement advanced search with filters
      // For now, just filter existing properties by search term
      const result = await getAvailableProperties();
      if (result.success) {
        let filteredProperties = result.data;
        
        // Filter by search term
        if (searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase();
          filteredProperties = filteredProperties.filter(property => 
            property.title?.toLowerCase().includes(searchLower) ||
            property.address?.toLowerCase().includes(searchLower) ||
            property.city?.toLowerCase().includes(searchLower) ||
            property.description?.toLowerCase().includes(searchLower)
          );
        }
        
        // Apply filters
        if (filters.propertyType) {
          filteredProperties = filteredProperties.filter(property => 
            property.type?.toLowerCase() === filters.propertyType.toLowerCase()
          );
        }
        
        if (filters.minPrice) {
          filteredProperties = filteredProperties.filter(property => 
            property.rent >= parseInt(filters.minPrice)
          );
        }
        
        if (filters.maxPrice) {
          filteredProperties = filteredProperties.filter(property => 
            property.rent <= parseInt(filters.maxPrice)
          );
        }
        
        if (filters.bedrooms) {
          filteredProperties = filteredProperties.filter(property => 
            property.bedrooms >= parseInt(filters.bedrooms)
          );
        }
        
        if (filters.bathrooms) {
          filteredProperties = filteredProperties.filter(property => 
            property.bathrooms >= parseInt(filters.bathrooms)
          );
        }
        
        if (filters.location) {
          const locationLower = filters.location.toLowerCase();
          filteredProperties = filteredProperties.filter(property => 
            property.address?.toLowerCase().includes(locationLower) ||
            property.city?.toLowerCase().includes(locationLower)
          );
        }
        
        setProperties(filteredProperties);
      }
    } catch (error) {
      console.error('Error searching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = async () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      propertyType: '',
      bedrooms: '',
      bathrooms: '',
      location: ''
    });
    setSearchTerm('');
    await loadProperties();
  };

  const sortProperties = (properties, sortBy) => {
    const sorted = [...properties];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => (a.rent || 0) - (b.rent || 0));
      case 'price-high':
        return sorted.sort((a, b) => (b.rent || 0) - (a.rent || 0));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      default:
        return sorted;
    }
  };

  const getPropertyTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'apartment':
        return '🏢';
      case 'house':
        return '🏠';
      case 'studio':
        return '🏘️';
      case 'condo':
        return '🏙️';
      default:
        return '🏠';
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
      month: 'short',
      day: 'numeric'
    });
  };

  const handleFavorite = (propertyId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId);
      } else {
        newFavorites.add(propertyId);
      }
      return newFavorites;
    });
  };

  const handleViewProperty = (propertyId) => {
    // TODO: Navigate to property details page
    console.log('Viewing property:', propertyId);
    alert(`Viewing property ${propertyId}. Property details page coming soon!`);
  };

  const handleMessageLandlord = (property) => {
    setSelectedProperty(property);
    setShowStartConversation(true);
  };

  const handleImageNavigation = (propertyId, direction) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property || !property.images || property.images.length <= 1) return;

    const currentIndex = currentImageIndex[propertyId] || 0;
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % property.images.length;
    } else {
      newIndex = currentIndex === 0 ? property.images.length - 1 : currentIndex - 1;
    }

    setCurrentImageIndex(prev => ({
      ...prev,
      [propertyId]: newIndex
    }));
  };

  const getCurrentImageIndex = (propertyId) => {
    return currentImageIndex[propertyId] || 0;
  };

  const handleConversationStarted = (conversationId) => {
    console.log('Conversation started:', conversationId);
    // You could redirect to the messaging page here
    // navigate('/messaging');
  };

  const sortedProperties = sortProperties(properties, sortBy);

  return (
    <div className="browse-properties-page">
      {/* Navigation Header */}
      <nav className="browse-nav">
        <div className="browse-nav-container">
          <Link to="/" className="browse-nav-logo">
            <img src={Logo} alt="Domio.nz Logo" className="browse-logo-image" />
          </Link>
          
          <div className="browse-nav-menu">
            <Link to="/" className="browse-nav-link">
              <Home size={16} />
              <span>Home</span>
            </Link>
            <Link to="/browse" className="browse-nav-link active">
              <Search size={16} />
              <span>Properties</span>
            </Link>
            <Link to="/about" className="browse-nav-link">
              <User size={16} />
              <span>About</span>
            </Link>
            <Link to="/contact" className="browse-nav-link">
              <MapPin size={16} />
              <span>Contact</span>
            </Link>
          </div>

          <div className="browse-nav-auth">
            {user ? (
              <div className="browse-account-dropdown">
                <button className="browse-account-btn">
                  <div className="browse-account-avatar">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="browse-account-info">
                    <span className="browse-account-username">@{user.username}</span>
                    <span className="browse-account-role">{user.role}</span>
                  </div>
                  <ChevronRight size={16} className="browse-account-arrow" />
                </button>
              </div>
            ) : (
              <div className="browse-auth-buttons">
                <Link to="/login" className="browse-nav-btn browse-login-btn">
                  <User size={16} />
                  <span>Log In</span>
                </Link>
                <Link to="/signup" className="browse-nav-btn browse-signup-btn">
                  <User size={16} />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div className="browse-page-header">
        <div className="browse-container">
          <h1>Browse Properties</h1>
          <p>Find your perfect rental home</p>
        </div>
      </div>

      <div className="browse-properties-wrapper">
        {/* Search Bar */}
        <div className="search-section">
          <div className="search-bar">
            <div className="search-input-group">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search by location, property name, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="search-input"
              />
            </div>
            <button 
              className="search-btn"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>

          {/* Filter Toggle */}
          <div className="filter-controls">
            <button 
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              Filters
            </button>
            
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filters-grid">
              <div className="filter-group">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="City or suburb"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Property Type</label>
                <select
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="studio">Studio</option>
                  <option value="condo">Condo</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Min Price ($/week)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Max Price ($/week)</label>
                <input
                  type="number"
                  placeholder="No limit"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Bedrooms</label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Bathrooms</label>
                <select
                  value={filters.bathrooms}
                  onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </select>
              </div>
            </div>

            <div className="filter-actions">
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear All
              </button>
              <button className="apply-filters-btn" onClick={handleSearch}>
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="results-header">
          <h3>{properties.length} Properties Available</h3>
          <p>Showing available rental properties in Auckland</p>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-logo">
              <img src={Logo} alt="Domio.nz Logo" />
            </div>
            <p>Loading properties...</p>
          </div>
        ) : (
          <div className="properties-grid">
            {sortedProperties.length === 0 ? (
              <div className="empty-state">
                <Home size={64} className="empty-icon" />
                <h3>No Properties Found</h3>
                <p>Try adjusting your search criteria or filters</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button className="clear-filters-btn" onClick={clearFilters}>
                    Clear Filters
                  </button>
                  <button 
                    className="clear-filters-btn" 
                    onClick={() => {
                      alert('To see properties, a landlord needs to create property listings first.\n\nSteps:\n1. Sign up as a landlord\n2. Go to /landlord/properties\n3. Click "Add New Property"\n4. Create some properties\n5. Come back here to browse them!');
                    }}
                    style={{ backgroundColor: '#8b5cf6', color: 'white' }}
                  >
                    How to Add Properties
                  </button>
                  <button 
                    className="clear-filters-btn" 
                    onClick={async () => {
                      console.log('Debug: Checking all properties in database...');
                      try {
                        // Import the function dynamically to avoid circular imports
                        const { getDocs, collection, query } = await import('firebase/firestore');
                        const { db } = await import('../firebase/config.js');
                        
                        const propertiesRef = collection(db, 'properties');
                        const allPropertiesQuery = query(propertiesRef);
                        const querySnapshot = await getDocs(allPropertiesQuery);
                        
                        console.log('All properties in database:', querySnapshot.size);
                        const allProperties = [];
                        querySnapshot.forEach((doc) => {
                          allProperties.push({
                            id: doc.id,
                            ...doc.data()
                          });
                        });
                        console.log('All properties data:', allProperties);
                        
                        alert(`Found ${allProperties.length} total properties in database.\n\nCheck console for details.\n\nFor a property to show here, it needs:\n- status: "available"\n- isActive: true\n- createdAt field`);
                      } catch (error) {
                        console.error('Error checking all properties:', error);
                        alert('Error checking properties. See console for details.');
                      }
                    }}
                    style={{ backgroundColor: '#10b981', color: 'white' }}
                  >
                    Debug: Check All Properties
                  </button>
                </div>
              </div>
            ) : (
              sortedProperties.map((property) => (
                <div key={property.id} className="property-card">
                  <div className="property-image">
                    {property.images && property.images.length > 0 ? (
                      <>
                        <img 
                          src={property.images[getCurrentImageIndex(property.id)].downloadURL} 
                          alt={property.title}
                          className="property-img"
                          onError={(e) => {
                            console.log('Image failed to load:', property.images[getCurrentImageIndex(property.id)]);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="property-placeholder" style={{ display: 'none' }}>
                          <span className="property-emoji">
                            {getPropertyTypeIcon(property.type)}
                          </span>
                        </div>
                        
                        {/* Image Navigation Controls */}
                        {property.images.length > 1 && (
                          <>
                            <button 
                              className="image-nav-btn image-nav-left"
                              onClick={() => handleImageNavigation(property.id, 'prev')}
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <button 
                              className="image-nav-btn image-nav-right"
                              onClick={() => handleImageNavigation(property.id, 'next')}
                            >
                              <ChevronRight size={20} />
                            </button>
                            
                            {/* Image Indicators */}
                            <div className="image-indicators">
                              {property.images.map((_, index) => (
                                <button
                                  key={index}
                                  className={`image-indicator ${index === getCurrentImageIndex(property.id) ? 'active' : ''}`}
                                  onClick={() => setCurrentImageIndex(prev => ({
                                    ...prev,
                                    [property.id]: index
                                  }))}
                                />
                              ))}
                            </div>
                            
                            {/* Image Counter */}
                            <div className="image-counter">
                              {getCurrentImageIndex(property.id) + 1} / {property.images.length}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="property-placeholder">
                        <span className="property-emoji">
                          {getPropertyTypeIcon(property.type)}
                        </span>
                      </div>
                    )}
                    <div className="property-status">
                      {property.status === 'available' ? 'Available' : property.status}
                    </div>
                    <button 
                      className={`favorite-btn ${favorites.has(property.id) ? 'favorited' : ''}`}
                      onClick={() => handleFavorite(property.id)}
                    >
                      <Heart size={16} />
                    </button>
                  </div>

                  <div className="property-content">
                    <h3 className="property-title">{property.title}</h3>
                    <p className="property-location">
                      <MapPin size={14} />
                      {property.address}, {property.city}
                    </p>
                    <div className="property-details">
                      <span className="detail-item">
                        <Bed size={14} />
                        {property.bedrooms} bed
                      </span>
                      <span className="detail-item">
                        <Bath size={14} />
                        {property.bathrooms} bath
                      </span>
                    </div>
                    <div className="property-price">{formatPrice(property.rent)}</div>
                    <div className="property-actions">
                      <button
                        className="view-details-btn"
                        onClick={() => handleViewProperty(property.id)}
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                      <button 
                        className="express-interest-btn"
                        onClick={() => handleMessageLandlord(property)}
                      >
                        <MessageCircle size={16} />
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Start Conversation Modal */}
      {showStartConversation && selectedProperty && (
        <StartConversation
          property={selectedProperty}
          landlordId={selectedProperty.landlordId || selectedProperty.ownerId}
          onClose={() => {
            setShowStartConversation(false);
            setSelectedProperty(null);
          }}
          onConversationStarted={handleConversationStarted}
        />
      )}
    </div>
  );
};

export default BrowseProperties;
