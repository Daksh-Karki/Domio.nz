import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../assets/Logo.png";
import { Home, Search, User, MapPin } from "lucide-react";
import "../styles/LandingPage.css";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    // Force a page reload to ensure clean state
    window.location.href = '/';
  };

  const featuredListings = [
    { id: 1, title: "Modern Downtown Apartment", location: "Auckland CBD", price: "$650/week", image: "🏢", type: "Apartment", bedrooms: 2, bathrooms: 1 },
    { id: 2, title: "Family Home with Garden", location: "North Shore", price: "$850/week", image: "🏠", type: "House", bedrooms: 4, bathrooms: 2 },
    { id: 3, title: "Luxury Waterfront Condo", location: "Mission Bay", price: "$1,200/week", image: "🌊", type: "Condo", bedrooms: 3, bathrooms: 2 },
    { id: 4, title: "Cozy Studio Unit", location: "Parnell", price: "$450/week", image: "🏘️", type: "Studio", bedrooms: 1, bathrooms: 1 },
    { id: 5, title: "Executive Penthouse", location: "Viaduct Harbour", price: "$1,800/week", image: "🏙️", type: "Penthouse", bedrooms: 3, bathrooms: 3 },
    { id: 6, title: "Charming Cottage", location: "Ponsonby", price: "$720/week", image: "🏡", type: "Cottage", bedrooms: 2, bathrooms: 1 }
  ];

  // Show loading state while Firebase auth is initializing
  if (loading) {
    return (
      <div className="landing-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      {/* Light Theme Background */}
      <div className="light-background">
        <div className="gradient-sky"></div>
        <div className="city-background" style={{ backgroundImage: `url('/src/assets/p1.jpg')` }}></div>
        <div className="overlay"></div>
      </div>

      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <img src={Logo} alt="Domio.nz Logo" className="logo-image" />
          </div>

          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <Link to="/" className="nav-link">
              <Home size={16} />
              <span>Home</span>
            </Link>
            <Link to="/browse" className="nav-link">
              <Search size={16} />
              <span>Properties</span>
            </Link>
            <Link to="/about" className="nav-link">
              <User size={16} />
              <span>About</span>
            </Link>
            <Link to="/contact" className="nav-link">
              <MapPin size={16} />
              <span>Contact</span>
            </Link>
          </div>

          <div className="nav-auth">
            {user ? (
              <div className="account-dropdown">
                <button className="account-btn">
                  <span className="account-avatar">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <span className="account-username">@{user.username}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <span className="dropdown-username">@{user.username}</span>
                    <span className="dropdown-name">{user.firstName} {user.lastName}</span>
                  </div>
                  <Link to="/profile" className="dropdown-item">My Profile</Link>
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
                <Link to="/login" className="nav-btn login-btn">
                  <User size={16} />
                  <span>Log In</span>
                </Link>
                <Link to="/signup" className="nav-btn signup-btn">
                  <User size={16} />
                  <span>Sign Up</span>
                </Link>
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
                Welcome back, @{user.username}!
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
            <Link to="/browse" className="hero-btn primary">Browse Properties</Link>
            {user ? (
              <Link to="/my-properties" className="hero-btn secondary">My Properties</Link>
            ) : (
              <Link to="/signup" className="hero-btn secondary">List Your Property</Link>
            )}
          </div>
        </div>
      </section>


      {/* Featured Listings */}
      <section className="featured-listings">
        <div className="container">
          <div className="section-header">
            <h2>Discover Your Perfect Home</h2>
            <p>Explore our carefully curated selection of premium rental properties across New Zealand</p>
          </div>

          <div className="listings-grid">
            {featuredListings.map((listing) => (
              <div key={listing.id} className="listing-card">
                <div className="listing-image">
                  <span className="listing-emoji">{listing.image}</span>
                  <div className="listing-type">{listing.type}</div>
                  <div className="listing-overlay">
                    <Link to={`/property/${listing.id}`} className="quick-view-btn">Quick View</Link>
                  </div>
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
            <Link to="/browse" className="view-all-btn">
              <span>Browse All Properties</span>
              <span className="btn-arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How DOMIO.NZ Works</h2>
            <p>Your journey to the perfect rental home in just four simple steps</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">🔍</div>
              <h3>1. Search & Discover</h3>
              <p>Browse thousands of verified properties with our intelligent search filters and personalized recommendations</p>
            </div>
            <div className="step-card">
              <div className="step-icon">💬</div>
              <h3>2. Connect & Communicate</h3>
              <p>Message landlords directly through our secure platform and schedule convenient property viewings</p>
            </div>
            <div className="step-card">
              <div className="step-icon">📝</div>
              <h3>3. Apply & Secure</h3>
              <p>Submit digital applications with all required documents and track your application status in real-time</p>
            </div>
            <div className="step-card">
              <div className="step-icon">🏠</div>
              <h3>4. Move In & Enjoy</h3>
              <p>Sign your lease digitally and move into your new home with our seamless onboarding process</p>
            </div>
          </div>

        </div>
      </section>




      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>DOMIO.NZ</h3>
              <p>Your trusted partner in finding the perfect rental property in New Zealand.</p>
            </div>
            <div className="footer-section">
              <h4>For Tenants</h4>
              <ul>
                <li><Link to="/browse">Browse Properties</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/signup">Get Started</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>For Landlords</h4>
              <ul>
                <li><Link to="/signup">List Your Property</Link></li>
                <li><Link to="/about">How It Works</Link></li>
                <li><Link to="/login">Landlord Login</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><Link to="/about">Contact Us</Link></li>
                <li><Link to="/browse">Help Center</Link></li>
                <li><Link to="/about">About</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 DOMIO.NZ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

