import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../assets/Logo.png';
import HiAnimation from '../assets/Hi_animation.gif';
import { 
  Users, 
  Home, 
  Shield, 
  Heart, 
  Star, 
  CheckCircle,
  Award,
  Globe,
  Search,
  User,
  MapPin
} from 'lucide-react';
import '../styles/About.css';

const About = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <Home size={48} />,
      title: "Quality Properties",
      description: "Carefully vetted rental properties across New Zealand with detailed listings and high-quality photos."
    },
    {
      icon: <Shield size={48} />,
      title: "Secure Platform",
      description: "Your data and transactions are protected with enterprise-grade security and privacy measures."
    },
    {
      icon: <Users size={48} />,
      title: "Trusted Community",
      description: "Join thousands of satisfied tenants and landlords who have found their perfect match through our platform."
    },
    {
      icon: <Heart size={48} />,
      title: "24/7 Support",
      description: "Our dedicated support team is always here to help you with any questions or concerns."
    }
  ];

  const stats = [
    { number: "15,000+", label: "Properties Available" },
    { number: "75,000+", label: "Happy Tenants" },
    { number: "8,500+", label: "Trusted Landlords" },
    { number: "24/7", label: "Customer Support" }
  ];

  const values = [
    {
      icon: <CheckCircle size={32} />,
      title: "Transparency",
      description: "Clear pricing, honest listings, and open communication between all parties."
    },
    {
      icon: <Star size={32} />,
      title: "Quality",
      description: "We maintain high standards for all properties and user experiences on our platform."
    },
    {
      icon: <Award size={32} />,
      title: "Excellence",
      description: "Committed to providing the best rental experience in New Zealand."
    },
    {
      icon: <Globe size={32} />,
      title: "Accessibility",
      description: "Making quality rental properties accessible to everyone across New Zealand."
    }
  ];

  return (
    <div className="about-page">
      {/* Navigation Header */}
      <nav className="about-nav">
        <div className="about-nav-container">
          <Link to="/" className="about-nav-logo">
            <img src={Logo} alt="Domio.nz Logo" className="about-logo-image" />
          </Link>
          
              <div className="about-nav-menu">
                <Link to="/" className="about-nav-link">
                  <Home size={16} />
                  <span>Home</span>
                </Link>
                <Link to="/browse" className="about-nav-link">
                  <Search size={16} />
                  <span>Properties</span>
                </Link>
                <Link to="/about" className="about-nav-link active">
                  <User size={16} />
                  <span>About</span>
                </Link>
                <Link to="/contact" className="about-nav-link">
                  <MapPin size={16} />
                  <span>Contact</span>
                </Link>
              </div>

          <div className="about-nav-auth">
            {user ? (
              <div className="about-account-dropdown">
                <button className="about-account-btn">
                  <span className="about-account-avatar">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <span className="about-account-username">@{user.username}</span>
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="about-nav-btn about-login-btn">
                  <User size={16} />
                  <span>Log In</span>
                </Link>
                <Link to="/signup" className="about-nav-btn about-signup-btn">
                  <User size={16} />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-container">
          <h1>About DOMIO.NZ</h1>
          <p className="about-hero-subtitle">
            Your trusted partner in finding the perfect rental property in New Zealand
          </p>
          <p className="about-hero-description">
            We're revolutionizing the rental market by connecting tenants with quality landlords, 
            making the process simple, transparent, and stress-free for everyone involved.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="about-container">
          <div className="mission-content">
            <div className="mission-text">
              <h2>Our Mission</h2>
              <p>
                At DOMIO.NZ, we believe everyone deserves a place to call home. Our mission is to 
                simplify the rental process by providing a platform that connects quality tenants 
                with trusted landlords across New Zealand.
              </p>
              <p>
                We're committed to transparency, quality, and creating a community where both 
                tenants and landlords can thrive. Whether you're looking for your first rental 
                or managing multiple properties, we're here to make the experience seamless.
              </p>
            </div>
            <div className="mission-image">
              <div className="mission-placeholder">
                <Home size={80} />
                <span>Building Communities</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="about-container">
          <div className="section-header">
            <h2>Why Choose DOMIO.NZ?</h2>
            <p>We're committed to providing the best rental experience in New Zealand</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="about-container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="about-container">
          <div className="section-header">
            <h2>Our Values</h2>
            <p>The principles that guide everything we do</p>
          </div>
          
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">
                  {value.icon}
                </div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="about-container">
          <div className="story-content">
            <div className="story-text">
              <h2>Our Story</h2>
              <p>
                DOMIO.NZ was founded with a simple vision: to make finding and renting properties 
                in New Zealand as easy as possible. We noticed that the rental market was fragmented, 
                with outdated processes and lack of transparency.
              </p>
              <p>
                Today, we're proud to be New Zealand's fastest-growing rental platform, connecting 
                thousands of tenants with quality properties every month. Our team is passionate 
                about technology, community, and making a positive impact on how people find their homes.
              </p>
              <div className="story-cta">
                <Link to="/browse" className="story-btn primary">
                  Browse Properties
                </Link>
                {!user && (
                  <Link to="/signup" className="story-btn secondary">
                    Join Our Community
                  </Link>
                )}
              </div>
            </div>
            <div className="story-image">
              <div className="story-animation">
                <img 
                  src={HiAnimation} 
                  alt="Hi Animation" 
                  className="hi-animation-gif"
                />
                <span>Growing Together</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="about-container">
          <div className="cta-content">
            <h2>Ready to Find Your Perfect Home?</h2>
            <p>Join thousands of satisfied tenants who have found their ideal rental property through DOMIO.NZ</p>
            <div className="cta-buttons">
              <Link to="/browse" className="cta-btn primary">Browse Properties</Link>
              {!user && (
                <Link to="/signup" className="cta-btn secondary">Get Started Today</Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="about-footer">
        <div className="about-container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>DOMIO.NZ</h3>
              <p>Your trusted partner in finding the perfect rental property in New Zealand.</p>
            </div>
            <div className="footer-section">
              <h4>For Tenants</h4>
              <ul>
                <li><Link to="/browse">Browse Properties</Link></li>
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
            <p>&copy; 2024 DOMIO.NZ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
