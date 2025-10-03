import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import UserLayout from './UserLayout.jsx';
import Logo from '../assets/Logo.png';
import { 
  Home, 
  FileText, 
  Star, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Eye,
  Download,
  Edit,
  Trash2,
  TrendingUp,
  Building2,
  User,
  MapPin,
  Bed,
  Bath
} from 'lucide-react';
import { 
  getTenantApplications, 
  getApplicationStats 
} from '../firebase/applicationService.js';
import { 
  getTenantRentals, 
  getRentalStats, 
  getUpcomingRentDue 
} from '../firebase/rentalService.js';
import { 
  getTenantReviews 
} from '../firebase/reviewService.js';
import { getProperty } from '../firebase/propertyService.js';
// import ReviewModal from './ReviewModal.jsx';
import '../styles/TenantDashboard.css';

const TenantDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dashboard data
  const [applications, setApplications] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [upcomingRent, setUpcomingRent] = useState([]);
  
  // Statistics
  const [appStats, setAppStats] = useState({});
  const [rentalStats, setRentalStats] = useState({});
  
  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data to avoid Firebase errors
      // TODO: Replace with real Firebase calls once collections are set up
      
      // Mock applications data
      setApplications([
        {
          id: '1',
          propertyId: 'prop1',
          status: 'pending',
          createdAt: new Date(),
          property: {
            title: 'Modern Downtown Apartment',
            address: '123 Queen Street, Auckland',
            rent: 650
          }
        }
      ]);

      // Mock rentals data
      setRentals([
        {
          id: '1',
          propertyId: 'prop1',
          status: 'active',
          monthlyRent: 650,
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          property: {
            title: 'Modern Downtown Apartment',
            address: '123 Queen Street, Auckland',
            bedrooms: 2,
            bathrooms: 1
          }
        }
      ]);

      // Mock reviews data
      setReviews([]);

      // Mock upcoming rent
      setUpcomingRent([]);

      // Mock stats
      setAppStats({
        total: 1,
        pending: 1,
        approved: 0,
        rejected: 0,
        withdrawn: 0
      });

      setRentalStats({
        total: 1,
        active: 1,
        completed: 0,
        terminated: 0,
        currentRent: 650
      });

    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWriteReview = (rental) => {
    setSelectedRental(rental);
    setShowReviewModal(true);
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

  const formatPrice = (price) => {
    return `$${price?.toLocaleString()}/week`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'withdrawn':
        return 'status-withdrawn';
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'terminated':
        return 'status-terminated';
      default:
        return 'status-pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock size={16} />;
      case 'approved':
        return <CheckCircle size={16} />;
      case 'rejected':
        return <AlertCircle size={16} />;
      case 'withdrawn':
        return <AlertCircle size={16} />;
      case 'active':
        return <CheckCircle size={16} />;
      case 'completed':
        return <CheckCircle size={16} />;
      case 'terminated':
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  if (loading) {
    return (
      <UserLayout title="Dashboard" subtitle="Loading your dashboard...">
        <div className="loading-container">
          <div className="loading-logo">
            <img src={Logo} alt="Domio.nz Logo" />
          </div>
          <p>Loading your dashboard...</p>
        </div>
      </UserLayout>
    );
  }

  // Debug: Add console log to see if component renders
  console.log('TenantDashboard rendering for user:', user);

  if (error) {
    return (
      <UserLayout title="Dashboard" subtitle="Error loading dashboard">
        <div className="error-container">
          <AlertCircle size={64} className="error-icon" />
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={loadDashboardData}>
            Try Again
          </button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout 
      title="Dashboard" 
      subtitle="Welcome back! Here's your rental overview"
    >
      <div className="tenant-dashboard-wrapper">
        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', marginBottom: '20px' }}>
          <h2>Tenant Dashboard</h2>
          <p>Welcome, {user?.firstName || 'User'}!</p>
          <p>This is a test to see if the component renders.</p>
        </div>
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FileText size={32} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{appStats.total || 0}</h3>
              <p className="stat-label">Applications</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Home size={32} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{rentalStats.active || 0}</h3>
              <p className="stat-label">Active Rentals</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Star size={32} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{reviews.length}</h3>
              <p className="stat-label">Reviews Written</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <DollarSign size={32} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">${rentalStats.currentRent?.toLocaleString() || 0}</h3>
              <p className="stat-label">Current Rent</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'rentals' ? 'active' : ''}`}
            onClick={() => setActiveTab('rentals')}
          >
            My Rentals
          </button>
          <button 
            className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            Applications
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-content">
              {/* Upcoming Rent */}
              {upcomingRent.length > 0 && (
                <div className="dashboard-section">
                  <h3>Upcoming Rent Due</h3>
                  <div className="rent-due-list">
                    {upcomingRent.map((rental) => (
                      <div key={rental.id} className="rent-due-item">
                        <div className="rent-info">
                          <h4>{rental.property?.title || 'Property'}</h4>
                          <p>{rental.property?.address || 'Address not available'}</p>
                        </div>
                        <div className="rent-details">
                          <span className="rent-amount">{formatPrice(rental.monthlyRent)}</span>
                          <span className="rent-date">Due {formatDate(rental.dueDate)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Applications */}
              <div className="dashboard-section">
                <div className="section-header">
                  <h3>Recent Applications</h3>
                  <button 
                    className="view-all-btn"
                    onClick={() => setActiveTab('applications')}
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
                    applications.map((application) => (
                      <div key={application.id} className="application-item">
                        <div className="application-info">
                          <h4>{application.property?.title || 'Property Not Found'}</h4>
                          <p>{application.property?.address || 'Address not available'}</p>
                          <span className={`status-badge ${getStatusColor(application.status)}`}>
                            {getStatusIcon(application.status)}
                            {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
                          </span>
                        </div>
                        <div className="application-actions">
                          <button 
                            className="action-btn"
                            onClick={() => window.open(`/property/${application.propertyId}`, '_blank')}
                          >
                            <Eye size={16} />
                            View
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Current Rentals */}
              <div className="dashboard-section">
                <div className="section-header">
                  <h3>Current Rentals</h3>
                  <button 
                    className="view-all-btn"
                    onClick={() => setActiveTab('rentals')}
                  >
                    View All
                  </button>
                </div>
                <div className="rentals-list">
                  {rentals.filter(r => r.status === 'active').length === 0 ? (
                    <div className="empty-state">
                      <Home size={48} />
                      <p>No active rentals</p>
                      <small>Your current rental properties will appear here</small>
                    </div>
                  ) : (
                    rentals.filter(r => r.status === 'active').map((rental) => (
                      <div key={rental.id} className="rental-item">
                        <div className="rental-info">
                          <h4>{rental.property?.title || 'Property'}</h4>
                          <p>{rental.property?.address || 'Address not available'}</p>
                          <div className="rental-specs">
                            <span><Bed size={14} /> {rental.property?.bedrooms || 0} bed</span>
                            <span><Bath size={14} /> {rental.property?.bathrooms || 0} bath</span>
                          </div>
                        </div>
                        <div className="rental-details">
                          <span className="rent-amount">{formatPrice(rental.monthlyRent)}</span>
                          <div className="rental-actions">
                            <button 
                              className="action-btn"
                              onClick={() => handleWriteReview(rental)}
                            >
                              <Star size={16} />
                              Review
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rentals' && (
            <div className="rentals-content">
              <div className="section-header">
                <h3>My Rentals</h3>
                <div className="rental-stats">
                  <span>Active: {rentalStats.active || 0}</span>
                  <span>Completed: {rentalStats.completed || 0}</span>
                  <span>Total: {rentalStats.total || 0}</span>
                </div>
              </div>
              
              <div className="rentals-grid">
                {rentals.length === 0 ? (
                  <div className="empty-state">
                    <Home size={64} />
                    <h3>No Rentals Yet</h3>
                    <p>Your rental history will appear here once you have active or past rentals.</p>
                  </div>
                ) : (
                  rentals.map((rental) => (
                    <div key={rental.id} className="rental-card">
                      <div className="rental-header">
                        <h4>{rental.property?.title || 'Property'}</h4>
                        <span className={`status-badge ${getStatusColor(rental.status)}`}>
                          {getStatusIcon(rental.status)}
                          {rental.status?.charAt(0).toUpperCase() + rental.status?.slice(1)}
                        </span>
                      </div>
                      
                      <div className="rental-content">
                        <div className="rental-location">
                          <MapPin size={16} />
                          <span>{rental.property?.address || 'Address not available'}</span>
                        </div>
                        
                        <div className="rental-specs">
                          <span><Bed size={16} /> {rental.property?.bedrooms || 0} bed</span>
                          <span><Bath size={16} /> {rental.property?.bathrooms || 0} bath</span>
                        </div>
                        
                        <div className="rental-details">
                          <div className="detail-row">
                            <span>Rent:</span>
                            <span>{formatPrice(rental.monthlyRent)}</span>
                          </div>
                          <div className="detail-row">
                            <span>Start Date:</span>
                            <span>{formatDate(rental.startDate)}</span>
                          </div>
                          <div className="detail-row">
                            <span>End Date:</span>
                            <span>{formatDate(rental.endDate)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="rental-actions">
                        <button 
                          className="action-btn primary"
                          onClick={() => window.open(`/property/${rental.propertyId}`, '_blank')}
                        >
                          <Eye size={16} />
                          View Property
                        </button>
                        {rental.status === 'active' && (
                          <button 
                            className="action-btn secondary"
                            onClick={() => handleWriteReview(rental)}
                          >
                            <Star size={16} />
                            Write Review
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="applications-content">
              <div className="section-header">
                <h3>My Applications</h3>
                <div className="application-stats">
                  <span>Pending: {appStats.pending || 0}</span>
                  <span>Approved: {appStats.approved || 0}</span>
                  <span>Rejected: {appStats.rejected || 0}</span>
                </div>
              </div>
              
              <div className="applications-grid">
                {applications.length === 0 ? (
                  <div className="empty-state">
                    <FileText size={64} />
                    <h3>No Applications Yet</h3>
                    <p>Start applying to properties to see your applications here.</p>
                  </div>
                ) : (
                  applications.map((application) => (
                    <div key={application.id} className="application-card">
                      <div className="application-header">
                        <h4>{application.property?.title || 'Property Not Found'}</h4>
                        <span className={`status-badge ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
                        </span>
                      </div>
                      
                      <div className="application-content">
                        <div className="application-location">
                          <MapPin size={16} />
                          <span>{application.property?.address || 'Address not available'}</span>
                        </div>
                        
                        <div className="application-details">
                          <div className="detail-row">
                            <span>Applied:</span>
                            <span>{formatDate(application.createdAt)}</span>
                          </div>
                          <div className="detail-row">
                            <span>Rent:</span>
                            <span>{formatPrice(application.property?.rent)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="application-actions">
                        <button 
                          className="action-btn primary"
                          onClick={() => window.open(`/property/${application.propertyId}`, '_blank')}
                        >
                          <Eye size={16} />
                          View Property
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-content">
              <div className="section-header">
                <h3>My Reviews</h3>
                <button 
                  className="write-review-btn"
                  onClick={() => setShowReviewModal(true)}
                >
                  <Plus size={16} />
                  Write Review
                </button>
              </div>
              
              <div className="reviews-grid">
                {reviews.length === 0 ? (
                  <div className="empty-state">
                    <Star size={64} />
                    <h3>No Reviews Yet</h3>
                    <p>Write reviews for your rental properties to help other tenants.</p>
                    <button 
                      className="write-review-btn"
                      onClick={() => setShowReviewModal(true)}
                    >
                      <Plus size={16} />
                      Write Your First Review
                    </button>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <h4>{review.propertyTitle || 'Property'}</h4>
                        <div className="review-rating">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={16} 
                              className={i < (review.rating || 0) ? 'filled' : 'empty'} 
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="review-content">
                        <p>{review.comment}</p>
                        <div className="review-meta">
                          <span>Written {formatDate(review.createdAt)}</span>
                          <span>•</span>
                          <span>{review.type === 'property' ? 'Property Review' : 'Landlord Review'}</span>
                        </div>
                      </div>
                      
                      <div className="review-actions">
                        <button className="action-btn secondary">
                          <Edit size={16} />
                          Edit
                        </button>
                        <button className="action-btn danger">
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Review Modal - TODO: Implement ReviewModal component */}
        {showReviewModal && (
          <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Write Review</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowReviewModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-content">
                <p>Review functionality coming soon!</p>
                <button 
                  className="cancel-btn"
                  onClick={() => setShowReviewModal(false)}
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

export default TenantDashboard;
