import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import UserLayout from './UserLayout.jsx';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Building2, MapPin, DollarSign } from 'lucide-react';
import '../styles/shared.css';

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading applications
    setTimeout(() => {
      setApplications([
        {
          id: 1,
          propertyTitle: "Modern Downtown Apartment",
          propertyLocation: "Auckland CBD",
          propertyPrice: "$650/week",
          propertyType: "Apartment",
          appliedDate: "2024-01-15",
          status: "Pending",
          landlordName: "John Smith",
          applicationId: "APP-001"
        },
        {
          id: 2,
          propertyTitle: "Family Home with Garden",
          propertyLocation: "North Shore",
          propertyPrice: "$850/week",
          propertyType: "House",
          appliedDate: "2024-01-10",
          status: "Approved",
          landlordName: "Sarah Johnson",
          applicationId: "APP-002"
        },
        {
          id: 3,
          propertyTitle: "Cozy Studio Unit",
          propertyLocation: "Parnell",
          propertyPrice: "$450/week",
          propertyType: "Studio",
          appliedDate: "2024-01-08",
          status: "Rejected",
          landlordName: "Mike Wilson",
          applicationId: "APP-003"
        },
        {
          id: 4,
          propertyTitle: "Luxury Waterfront Condo",
          propertyLocation: "Mission Bay",
          propertyPrice: "$1,200/week",
          propertyType: "Condo",
          appliedDate: "2024-01-05",
          status: "Under Review",
          landlordName: "Lisa Brown",
          applicationId: "APP-004"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock size={16} className="status-icon pending" />;
      case 'Approved':
        return <CheckCircle size={16} className="status-icon approved" />;
      case 'Rejected':
        return <XCircle size={16} className="status-icon rejected" />;
      case 'Under Review':
        return <AlertCircle size={16} className="status-icon review" />;
      default:
        return <Clock size={16} className="status-icon pending" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Approved':
        return 'status-approved';
      case 'Rejected':
        return 'status-rejected';
      case 'Under Review':
        return 'status-review';
      default:
        return 'status-pending';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <UserLayout title="Applications" subtitle="Loading your applications...">
        <div className="loading-container">
          <div className="loading-logo">
            <img src="/src/assets/Logo.png" alt="Domio.nz Logo" />
          </div>
          <p>Loading your applications...</p>
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
                  <span>{application.applicationId}</span>
                </div>
                <div className={`application-status ${getStatusColor(application.status)}`}>
                  {getStatusIcon(application.status)}
                  <span>{application.status}</span>
                </div>
              </div>

              <div className="application-content">
                <div className="property-info">
                  <h3 className="property-title">{application.propertyTitle}</h3>
                  
                  <div className="property-details">
                    <div className="detail-item">
                      <Building2 size={16} />
                      <span>{application.propertyType}</span>
                    </div>
                    <div className="detail-item">
                      <MapPin size={16} />
                      <span>{application.propertyLocation}</span>
                    </div>
                    <div className="detail-item">
                      <DollarSign size={16} />
                      <span>{application.propertyPrice}</span>
                    </div>
                  </div>
                </div>

                <div className="application-details">
                  <div className="detail-row">
                    <span className="detail-label">Landlord:</span>
                    <span className="detail-value">{application.landlordName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Applied:</span>
                    <span className="detail-value">{formatDate(application.appliedDate)}</span>
                  </div>
                </div>
              </div>

              <div className="application-actions">
                <button className="action-btn primary">View Details</button>
                {application.status === 'Pending' && (
                  <button className="action-btn secondary">Withdraw</button>
                )}
                {application.status === 'Approved' && (
                  <button className="action-btn success">Accept</button>
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
