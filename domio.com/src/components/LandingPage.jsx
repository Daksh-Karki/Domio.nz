import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/LandingPage.css";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null); // For now, user is always null (no authentication)
  const navigate = useNavigate();

  const handleSignOut = () => {
    setUser(null);
    navigate("/");
  };

  const featuredListings = [
    { id: 1, title: "Modern Downtown Apartment", location: "Auckland CBD", price: "$650/week", image: "🏢", type: "Apartment", bedrooms: 2, bathrooms: 1 },
    { id: 2, title: "Family Home with Garden", location: "North Shore", price: "$850/week", image: "🏠", type: "House", bedrooms: 4, bathrooms: 2 },
    { id: 3, title: "Luxury Waterfront Condo", location: "Mission Bay", price: "$1,200/week", image: "🌊", type: "Condo", bedrooms: 3, bathrooms: 2 },
    { id: 4, title: "Cozy Studio Unit", location: "Parnell", price: "$450/week", image: "🏘️", type: "Studio", bedrooms: 1, bathrooms: 1 },
    { id: 5, title: "Executive Penthouse", location: "Viaduct Harbour", price: "$1,800/week", image: "🏙️", type: "Penthouse", bedrooms: 3, bathrooms: 3 },
    { id: 6, title: "Charming Cottage", location: "Ponsonby", price: "$720/week", image: "🏡", type: "Cottage", bedrooms: 2, bathrooms: 1 }
  ];

  return (
    <div className="landing-page">
      {/* Debug Info - Removed for production */}

      {/* Light Theme Background */}
      <div className="light-background">
        <div className="gradient-sky"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h1>Domio</h1>
          </div>

          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/properties" className="nav-link">Properties</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </div>

          <div className="nav-auth">
            {user ? (
              <div className="account-dropdown">
                <button className="account-btn">
                  <span className="account-avatar">
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <span className="account-email">{user.email}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <span className="dropdown-email">{user.email}</span>
                  </div>
                  <Link to="/Profile" className="dropdown-item">My Profile</Link>
                  <Link to="/my-properties" className="dropdown-item">My Properties</Link>
                  <Link to="/applications" className="dropdown-item">Applications</Link>
                  <Link to="/settings" className="dropdown-item">Settings</Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleSignOut} className="dropdown-item signout-btn">
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="nav-btn login-btn">Log In</Link>
                <Link to="/signup" className="nav-btn signup-btn">Sign Up</Link>
              </>
            )}
          </div>

          <div className="nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Screen */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            {user ? (
              <>
                Welcome back, {user.email ? user.email.split('@')[0] : 'User'}!
                <span className="hero-subtitle">Ready to find your next home?</span>
              </>
            ) : (
              <>
                Find Your Perfect Home
                <span className="hero-subtitle">in New Zealand</span>
              </>
            )}
          </h1>
          <p className="hero-description">
            {user 
              ? "Continue your property search or manage your existing listings."
              : "Discover thousands of rental properties across New Zealand. Whether you're looking for a cozy apartment in the city or a spacious family home, we've got you covered."
            }
          </p>
          <div className="hero-actions">
            <Link to="/properties" className="hero-btn primary">Browse Properties</Link>
            {user ? (
              <Link to="/my-properties" className="hero-btn secondary">My Properties</Link>
            ) : (
              <Link to="/signup" className="hero-btn secondary">List Your Property</Link>
            )}
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="search-container">
          <h2>Find Your Perfect Home</h2>
          <div className="search-form">
            <input type="text" placeholder="Enter location, suburb, or city..." className="search-input" />
            <select className="search-select">
              <option value="">Property Type</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="townhouse">Townhouse</option>
              <option value="studio">Studio</option>
            </select>
            <select className="search-select">
              <option value="">Bedrooms</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
            <button className="search-btn">Search</button>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="featured-listings">
        <div className="container">
          <div className="section-header">
            <h2>Featured Properties</h2>
            <p>Discover our handpicked selection of premium rental properties</p>
          </div>

          <div className="listings-grid">
            {featuredListings.map((listing) => (
              <div key={listing.id} className="listing-card">
                <div className="listing-image">
                  <span className="listing-emoji">{listing.image}</span>
                  <div className="listing-type">{listing.type}</div>
                </div>
                <div className="listing-content">
                  <h3 className="listing-title">{listing.title}</h3>
                  <p className="listing-location">📍 {listing.location}</p>
                  <div className="listing-details">
                    <span className="detail">🛏️ {listing.bedrooms} bed</span>
                    <span className="detail">🚿 {listing.bathrooms} bath</span>
                  </div>
                  <div className="listing-price">{listing.price}</div>
                  <Link to={`/property/${listing.id}`} className="view-btn">View Details</Link>
                </div>
              </div>
            ))}
          </div>

          <div className="view-all-container">
            <Link to="/properties" className="view-all-btn">View All Properties</Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How Domio Works</h2>
            <p>Your journey to the perfect rental home in just four simple steps</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">🔍</div>
              <h3>Search</h3>
              <p>Browse thousands of properties with our advanced search filters</p>
            </div>
            <div className="step-card">
              <div className="step-icon">💬</div>
              <h3>Connect</h3>
              <p>Message landlords directly and schedule viewings</p>
            </div>
            <div className="step-card">
              <div className="step-icon">📝</div>
              <h3>Apply</h3>
              <p>Submit applications and manage your rental process</p>
            </div>
            <div className="step-card">
              <div className="step-icon">🏠</div>
              <h3>Move In</h3>
              <p>Sign your lease and move into your new home</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">15,000+</div>
              <div className="stat-label">Properties Available</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">75,000+</div>
              <div className="stat-label">Happy Tenants</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">8,500+</div>
              <div className="stat-label">Trusted Landlords</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Find Your Perfect Home?</h2>
            <p>Join over 75,000 happy tenants who have found their ideal rental property through Domio</p>
            <div className="cta-buttons">
              {user ? (
                <Link to="/properties" className="cta-btn primary">Browse Properties</Link>
              ) : (
                <Link to="/signup" className="cta-btn primary">Get Started Today</Link>
              )}
              <Link to="/properties" className="cta-btn secondary">Browse Properties</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Domio</h3>
              <p>Your trusted partner in finding the perfect rental property in New Zealand.</p>
            </div>
            <div className="footer-section">
              <h4>For Tenants</h4>
              <ul>
                <li><Link to="/properties">Browse Properties</Link></li>
                <li><Link to="/how-it-works">How It Works</Link></li>
                <li><Link to="/tenant-guide">Tenant Guide</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>For Landlords</h4>
              <ul>
                <li><Link to="/landlord-signup">List Your Property</Link></li>
                <li><Link to="/landlord-guide">Landlord Guide</Link></li>
                <li><Link to="/pricing">Pricing</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/help">Help Center</Link></li>
                <li><Link to="/terms">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Domio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

