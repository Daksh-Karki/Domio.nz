import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import UserLayout from './UserLayout.jsx';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Building2, 
  MapPin, 
  DollarSign,
  User,
  Phone,
  Mail,
  Calendar,
  Star,
  Eye,
  MessageSquare,
  Download
} from 'lucide-react';
import '../styles/Applications.css';

const LandlordApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    // Simulate loading applications
    setTimeout(() => {
      setApplications([
        {
          id: 1,
          propertyId: 2,
          propertyName: "Family Home with Garden",
          propertyAddress: "456 Main St, North Shore",
          propertyType: "House",
          propertyPrice: "$850/week",
          propertyBedrooms: 4,
          propertyBathrooms: 2,
          appliedDate: "2024-01-20",
          status: "Pending",
          applicantName: "Mike Wilson",
          applicantEmail: "mike.wilson@example.com",
          applicantPhone: "+64 21 123 4567",
          applicantAge: 28,
          applicantOccupation: "Software Engineer",
          applicantIncome: 85000,
          applicantEmployer: "Tech Corp Ltd",
          references: [
            {
              name: "Jane Smith",
              relationship: "Previous Landlord",
              phone: "+64 21 234 5678",
              email: "jane.smith@example.com"
            },
            {
              name: "Bob Johnson",
              relationship: "Employer",
              phone: "+64 21 345 6789",
              email: "bob.johnson@techcorp.com"
            }
          ],
          emergencyContact: {
            name: "Sarah Wilson",
            relationship: "Sister",
            phone: "+64 21 456 7890"
          },
          pets: "None",
          smoking: "Non-smoker",
          moveInDate: "2024-02-15",
          leaseLength: "12 months",
          additionalInfo: "Looking for a family home with garden for my dog. Very responsible tenant with excellent references.",
          documents: ["ID", "Income Statement", "References", "Bank Statement"]
        },
        {
          id: 2,
          propertyId: 2,
          propertyName: "Family Home with Garden",
          propertyAddress: "456 Main St, North Shore",
          propertyType: "House",
          propertyPrice: "$850/week",
          propertyBedrooms: 4,
          propertyBathrooms: 2,
          appliedDate: "2024-01-18",
          status: "Under Review",
          applicantName: "Lisa Brown",
          applicantEmail: "lisa.brown@example.com",
          applicantPhone: "+64 21 567 8901",
          applicantAge: 32,
          applicantOccupation: "Marketing Manager",
          applicantIncome: 95000,
          applicantEmployer: "Marketing Solutions Inc",
          references: [
            {
              name: "Tom Davis",
              relationship: "Previous Landlord",
              phone: "+64 21 678 9012",
              email: "tom.davis@example.com"
            },
            {
              name: "Emma Wilson",
              relationship: "Employer",
              phone: "+64 21 789 0123",
              email: "emma.wilson@marketingsolutions.com"
            },
            {
              name: "David Lee",
              relationship: "Personal Reference",
              phone: "+64 21 890 1234",
              email: "david.lee@example.com"
            }
          ],
          emergencyContact: {
            name: "Mark Brown",
            relationship: "Brother",
            phone: "+64 21 901 2345"
          },
          pets: "1 cat (indoor)",
          smoking: "Non-smoker",
          moveInDate: "2024-02-01",
          leaseLength: "24 months",
          additionalInfo: "Professional couple looking for a long-term rental. We take excellent care of properties and have never missed a rent payment.",
          documents: ["ID", "Income Statement", "References", "Bank Statement", "Pet References"]
        },
        {
          id: 3,
          propertyId: 1,
          propertyName: "Modern Downtown Apartment",
          propertyAddress: "123 Queen St, Auckland CBD",
          propertyType: "Apartment",
          propertyPrice: "$650/week",
          propertyBedrooms: 2,
          propertyBathrooms: 1,
          appliedDate: "2024-01-15",
          status: "Approved",
          applicantName: "Alex Chen",
          applicantEmail: "alex.chen@example.com",
          applicantPhone: "+64 21 012 3456",
          applicantAge: 25,
          applicantOccupation: "Graphic Designer",
          applicantIncome: 65000,
          applicantEmployer: "Creative Agency Ltd",
          references: [
            {
              name: "Maria Garcia",
              relationship: "Previous Landlord",
              phone: "+64 21 123 4567",
              email: "maria.garcia@example.com"
            }
          ],
          emergencyContact: {
            name: "Jenny Chen",
            relationship: "Mother",
            phone: "+64 21 234 5678"
          },
          pets: "None",
          smoking: "Non-smoker",
          moveInDate: "2024-02-01",
          leaseLength: "12 months",
          additionalInfo: "Young professional looking for a modern apartment in the city center.",
          documents: ["ID", "Income Statement", "References"]
        },
        {
          id: 4,
          propertyId: 3,
          propertyName: "Cozy Studio Unit",
          propertyAddress: "789 Parnell Rd, Parnell",
          propertyType: "Studio",
          propertyPrice: "$450/week",
          propertyBedrooms: 1,
          propertyBathrooms: 1,
          appliedDate: "2024-01-12",
          status: "Rejected",
          applicantName: "Sam Taylor",
          applicantEmail: "sam.taylor@example.com",
          applicantPhone: "+64 21 345 6789",
          applicantAge: 22,
          applicantOccupation: "Student",
          applicantIncome: 25000,
          applicantEmployer: "Part-time at Cafe",
          references: [
            {
              name: "Parent Reference",
              relationship: "Parent",
              phone: "+64 21 456 7890",
              email: "parent@example.com"
            }
          ],
          emergencyContact: {
            name: "Parent Taylor",
            relationship: "Parent",
            phone: "+64 21 456 7890"
          },
          pets: "None",
          smoking: "Non-smoker",
          moveInDate: "2024-02-01",
          leaseLength: "6 months",
          additionalInfo: "University student looking for affordable accommodation.",
          documents: ["ID", "Student ID", "Parent Guarantee"],
          rejectionReason: "Income too low for property requirements"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleApplicationAction = (applicationId, action, reason = '') => {
    setApplications(prev => 
      prev.map(app => 
        app.id === applicationId 
          ? { 
              ...app, 
              status: action,
              rejectionReason: action === 'Rejected' ? reason : undefined,
              reviewedDate: new Date().toISOString().split('T')[0]
            }
          : app
      )
    );
    setShowApplicationDetails(false);
  };

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

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status.toLowerCase() === filter.toLowerCase();
  });

  const getFilterStats = () => {
    return {
      total: applications.length,
      pending: applications.filter(app => app.status === 'Pending').length,
      underReview: applications.filter(app => app.status === 'Under Review').length,
      approved: applications.filter(app => app.status === 'Approved').length,
      rejected: applications.filter(app => app.status === 'Rejected').length
    };
  };

  if (loading) {
    return (
      <UserLayout title="Tenant Applications" subtitle="Loading applications...">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading tenant applications...</p>
        </div>
      </UserLayout>
    );
  }

  const stats = getFilterStats();

  return (
    <UserLayout 
      title="Tenant Applications" 
      subtitle="Review and manage rental applications"
    >
      <div className="applications-wrapper">
        {/* Header Stats */}
        <div className="applications-header">
          <div className="applications-stats">
            <div className="stat-item">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total Applications</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.underReview}</span>
              <span className="stat-label">Under Review</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.approved}</span>
              <span className="stat-label">Approved</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.rejected}</span>
              <span className="stat-label">Rejected</span>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button 
              className={`filter-btn ${filter === 'under review' ? 'active' : ''}`}
              onClick={() => setFilter('under review')}
            >
              Under Review
            </button>
            <button 
              className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
              onClick={() => setFilter('approved')}
            >
              Approved
            </button>
            <button 
              className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
              onClick={() => setFilter('rejected')}
            >
              Rejected
            </button>
          </div>
        </div>

        {/* Applications List */}
        <div className="applications-list">
          {filteredApplications.map((application) => (
            <div key={application.id} className="application-card">
              <div className="application-header">
                <div className="application-id">
                  <FileText size={16} />
                  <span>APP-{application.id.toString().padStart(3, '0')}</span>
                </div>
                <div className={`application-status ${getStatusColor(application.status)}`}>
                  {getStatusIcon(application.status)}
                  <span>{application.status}</span>
                </div>
              </div>

              <div className="application-content">
                <div className="property-info">
                  <h3 className="property-title">{application.propertyName}</h3>
                  
                  <div className="property-details">
                    <div className="detail-item">
                      <Building2 size={16} />
                      <span>{application.propertyType}</span>
                    </div>
                    <div className="detail-item">
                      <MapPin size={16} />
                      <span>{application.propertyAddress}</span>
                    </div>
                    <div className="detail-item">
                      <DollarSign size={16} />
                      <span>{application.propertyPrice}</span>
                    </div>
                    <div className="detail-item">
                      <span>{application.propertyBedrooms} bed, {application.propertyBathrooms} bath</span>
                    </div>
                  </div>
                </div>

                <div className="applicant-info">
                  <div className="applicant-header">
                    <User size={16} />
                    <span className="applicant-name">{application.applicantName}</span>
                    <span className="applicant-age">({application.applicantAge} years old)</span>
                  </div>
                  
                  <div className="applicant-details">
                    <div className="detail-row">
                      <Mail size={14} />
                      <span>{application.applicantEmail}</span>
                    </div>
                    <div className="detail-row">
                      <Phone size={14} />
                      <span>{application.applicantPhone}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Occupation:</span>
                      <span className="detail-value">{application.applicantOccupation}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Income:</span>
                      <span className="detail-value">${application.applicantIncome.toLocaleString()}/year</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Applied:</span>
                      <span className="detail-value">{formatDate(application.appliedDate)}</span>
                    </div>
                  </div>
                </div>

                {application.rejectionReason && (
                  <div className="rejection-reason">
                    <AlertCircle size={16} />
                    <span>Rejection Reason: {application.rejectionReason}</span>
                  </div>
                )}
              </div>

              <div className="application-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => {
                    setSelectedApplication(application);
                    setShowApplicationDetails(true);
                  }}
                >
                  <Eye size={16} />
                  View Details
                </button>
                
                {application.status === 'Pending' && (
                  <>
                    <button 
                      className="action-btn success"
                      onClick={() => handleApplicationAction(application.id, 'Approved')}
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button 
                      className="action-btn danger"
                      onClick={() => {
                        const reason = prompt('Please provide a reason for rejection:');
                        if (reason) {
                          handleApplicationAction(application.id, 'Rejected', reason);
                        }
                      }}
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </>
                )}
                
                {application.status === 'Under Review' && (
                  <>
                    <button 
                      className="action-btn success"
                      onClick={() => handleApplicationAction(application.id, 'Approved')}
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button 
                      className="action-btn danger"
                      onClick={() => {
                        const reason = prompt('Please provide a reason for rejection:');
                        if (reason) {
                          handleApplicationAction(application.id, 'Rejected', reason);
                        }
                      }}
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredApplications.length === 0 && (
          <div className="empty-state">
            <FileText size={64} className="empty-icon" />
            <h3>No Applications Found</h3>
            <p>No applications match your current filter.</p>
            <button 
              className="filter-btn"
              onClick={() => setFilter('all')}
            >
              View All Applications
            </button>
          </div>
        )}

        {/* Application Details Modal */}
        {showApplicationDetails && selectedApplication && (
          <div className="modal-overlay" onClick={() => setShowApplicationDetails(false)}>
            <div className="modal large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Application Details - {selectedApplication.applicantName}</h3>
                <button className="close-modal-btn" onClick={() => setShowApplicationDetails(false)}>
                  ×
                </button>
              </div>
              
              <div className="modal-content">
                <div className="details-section">
                  <h4>Property Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Property:</span>
                      <span className="value">{selectedApplication.propertyName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Address:</span>
                      <span className="value">{selectedApplication.propertyAddress}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Type:</span>
                      <span className="value">{selectedApplication.propertyType}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Rent:</span>
                      <span className="value">{selectedApplication.propertyPrice}</span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h4>Applicant Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Name:</span>
                      <span className="value">{selectedApplication.applicantName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Age:</span>
                      <span className="value">{selectedApplication.applicantAge} years old</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Email:</span>
                      <span className="value">{selectedApplication.applicantEmail}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Phone:</span>
                      <span className="value">{selectedApplication.applicantPhone}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Occupation:</span>
                      <span className="value">{selectedApplication.applicantOccupation}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Employer:</span>
                      <span className="value">{selectedApplication.applicantEmployer}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Annual Income:</span>
                      <span className="value">${selectedApplication.applicantIncome.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h4>References</h4>
                  {selectedApplication.references.map((ref, index) => (
                    <div key={index} className="reference-item">
                      <div className="reference-header">
                        <span className="reference-name">{ref.name}</span>
                        <span className="reference-relationship">{ref.relationship}</span>
                      </div>
                      <div className="reference-details">
                        <div className="detail-row">
                          <Phone size={14} />
                          <span>{ref.phone}</span>
                        </div>
                        <div className="detail-row">
                          <Mail size={14} />
                          <span>{ref.email}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="details-section">
                  <h4>Additional Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Pets:</span>
                      <span className="value">{selectedApplication.pets}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Smoking:</span>
                      <span className="value">{selectedApplication.smoking}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Move-in Date:</span>
                      <span className="value">{formatDate(selectedApplication.moveInDate)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Lease Length:</span>
                      <span className="value">{selectedApplication.leaseLength}</span>
                    </div>
                  </div>
                  
                  {selectedApplication.additionalInfo && (
                    <div className="additional-info">
                      <span className="label">Additional Information:</span>
                      <p className="value">{selectedApplication.additionalInfo}</p>
                    </div>
                  )}
                </div>

                <div className="details-section">
                  <h4>Emergency Contact</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Name:</span>
                      <span className="value">{selectedApplication.emergencyContact.name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Relationship:</span>
                      <span className="value">{selectedApplication.emergencyContact.relationship}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Phone:</span>
                      <span className="value">{selectedApplication.emergencyContact.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h4>Documents</h4>
                  <div className="documents-list">
                    {selectedApplication.documents.map((doc, index) => (
                      <div key={index} className="document-item">
                        <FileText size={16} />
                        <span>{doc}</span>
                        <button className="download-btn">
                          <Download size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                {selectedApplication.status === 'Pending' && (
                  <>
                    <button 
                      className="action-btn success"
                      onClick={() => {
                        handleApplicationAction(selectedApplication.id, 'Approved');
                        setShowApplicationDetails(false);
                      }}
                    >
                      <CheckCircle size={16} />
                      Approve Application
                    </button>
                    <button 
                      className="action-btn danger"
                      onClick={() => {
                        const reason = prompt('Please provide a reason for rejection:');
                        if (reason) {
                          handleApplicationAction(selectedApplication.id, 'Rejected', reason);
                          setShowApplicationDetails(false);
                        }
                      }}
                    >
                      <XCircle size={16} />
                      Reject Application
                    </button>
                  </>
                )}
                <button 
                  className="action-btn secondary"
                  onClick={() => setShowApplicationDetails(false)}
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

export default LandlordApplications;

