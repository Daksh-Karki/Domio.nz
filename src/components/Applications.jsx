import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import UserLayout from './UserLayout.jsx';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Building2, MapPin, DollarSign, Eye, Trash2, ExternalLink } from 'lucide-react';
import { getTenantApplications, withdrawApplication } from '../firebase/applicationService.js';
import { getProperty } from '../firebase/propertyService.js';
import Logo from '../assets/Logo.png';
import '../styles/shared.css';
import '../styles/Applications.css';

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [user]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getTenantApplications(user.uid);
      if (result.success) {
        // Load property details for each application
        const applicationsWithDetails = await Promise.all(
          result.data.map(async (application) => {
            try {
              const propertyResult = await getProperty(application.propertyId);
              if (propertyResult.success) {
                return {
                  ...application,
                  property: propertyResult.data
                };
              }
              return application;
            } catch (error) {
              console.error('Error loading property details:', error);
              return application;
            }
          })
        );
        
        setApplications(applicationsWithDetails);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to load applications');
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawApplication = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    try {
      const result = await withdrawApplication(applicationId, user.uid);
      if (result.success) {
        // Update local state
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: 'withdrawn' }
              : app
          )
        );
        alert('Application withdrawn successfully');
      } else {
        alert('Error withdrawing application: ' + result.error);
      }
    } catch (error) {
      console.error('Error withdrawing application:', error);
      alert('Error withdrawing application. Please try again.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock size={16} className="status-icon pending" />;
      case 'approved':
        return <CheckCircle size={16} className="status-icon approved" />;
      case 'rejected':
        return <XCircle size={16} className="status-icon rejected" />;
      case 'withdrawn':
        return <XCircle size={16} className="status-icon withdrawn" />;
      default:
        return <Clock size={16} className="status-icon pending" />;
    }
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
      default:
        return 'status-pending';
    }
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

  if (loading) {
    return (
      <UserLayout title="Applications" subtitle="Loading your applications...">
        <div className="loading-container">
          <div className="loading-logo">
            <img src={Logo} alt="Domio.nz Logo" />
          </div>
          <p>Loading your applications...</p>
        </div>
      </UserLayout>
    );
  }

  if (error) {
    return (
      <UserLayout title="Applications" subtitle="Error loading applications">
        <div className="error-container">
          <AlertCircle size={64} className="error-icon" />
          <h3>Error Loading Applications</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={loadApplications}>
            Try Again
          </button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout 
      title="My Applications" 
      subtitle="Track your rental applications"
    >
      <div className="applications-wrapper">
        {/* Header Stats */}
        <div className="applications-header">
          <div className="applications-stats">
            <div className="stat-item">
              <span className="stat-number">{applications.length}</span>
              <span className="stat-label">Total Applications</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {applications.filter(app => app.status === 'Pending').length}
              </span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {applications.filter(app => app.status === 'Approved').length}
              </span>
              <span className="stat-label">Approved</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {applications.filter(app => app.status === 'Rejected').length}
              </span>
              <span className="stat-label">Rejected</span>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="applications-list">
          {applications.map((application) => (
            <div key={application.id} className="application-card">
              <div className="application-header">
                <div className="application-id">
                  <FileText size={16} />
                  <span>APP-{application.id.slice(-6).toUpperCase()}</span>
                </div>
                <div className={`application-status ${getStatusColor(application.status)}`}>
                  {getStatusIcon(application.status)}
                  <span>{application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}</span>
                </div>
              </div>

              <div className="application-content">
                <div className="property-info">
                  <h3 className="property-title">
                    {application.property?.title || 'Property Not Found'}
                  </h3>
                  
                  <div className="property-details">
                    <div className="detail-item">
                      <Building2 size={16} />
                      <span>{application.property?.type?.charAt(0).toUpperCase() + application.property?.type?.slice(1) || 'Unknown'}</span>
                    </div>
                    <div className="detail-item">
                      <MapPin size={16} />
                      <span>{application.property?.address || 'Location Unknown'}</span>
                    </div>
                    <div className="detail-item">
                      <DollarSign size={16} />
                      <span>{formatPrice(application.property?.rent)}</span>
                    </div>
                  </div>
                </div>

                <div className="application-details">
                  <div className="detail-row">
                    <span className="detail-label">Applied:</span>
                    <span className="detail-value">{formatDate(application.createdAt)}</span>
                  </div>
                  {application.message && (
                    <div className="detail-row">
                      <span className="detail-label">Message:</span>
                      <span className="detail-value">{application.message}</span>
                    </div>
                  )}
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
                {application.status?.toLowerCase() === 'pending' && (
                  <button 
                    className="action-btn danger"
                    onClick={() => handleWithdrawApplication(application.id)}
                  >
                    <Trash2 size={16} />
                    Withdraw
                  </button>
                )}
                {application.status?.toLowerCase() === 'approved' && (
                  <button className="action-btn success">
                    <CheckCircle size={16} />
                    Accept Offer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {applications.length === 0 && (
          <div className="empty-state">
            <FileText size={64} className="empty-icon" />
            <h3>No Applications Yet</h3>
            <p>Start applying for properties to see your applications here.</p>
            <button className="browse-properties-btn">
              Browse Properties
            </button>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default Applications;
