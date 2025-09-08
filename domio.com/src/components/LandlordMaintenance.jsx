import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import UserLayout from './UserLayout.jsx';
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Building2, 
  User,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  Plus,
  Eye,
  Edit,
  MessageSquare,
  FileText,
  Star
} from 'lucide-react';
import '../styles/Applications.css';

const LandlordMaintenance = () => {
  const { user } = useAuth();
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [showAddRequest, setShowAddRequest] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, in-progress, completed, cancelled
  const [newRequest, setNewRequest] = useState({
    propertyId: '',
    propertyName: '',
    issue: '',
    description: '',
    priority: 'medium',
    category: 'general'
  });

  useEffect(() => {
    // Simulate loading maintenance requests
    setTimeout(() => {
      setMaintenanceRequests([
        {
          id: 1,
          propertyId: 1,
          propertyName: "Downtown Apartment",
          propertyAddress: "123 Queen St, Auckland CBD",
          tenantName: "John Smith",
          tenantEmail: "john@example.com",
          tenantPhone: "+64 21 123 4567",
          issue: "Leaky faucet in kitchen",
          description: "The kitchen faucet has been dripping continuously for the past week. It's getting worse and wasting water.",
          category: "plumbing",
          priority: "medium",
          status: "pending",
          reportedDate: "2024-01-20",
          reportedTime: "14:30",
          estimatedCost: 150,
          actualCost: null,
          assignedContractor: null,
          contractorName: null,
          contractorPhone: null,
          scheduledDate: null,
          completedDate: null,
          images: ["faucet1.jpg", "faucet2.jpg"],
          tenantNotes: "Please fix as soon as possible as it's affecting water bill",
          contractorNotes: null,
          followUpRequired: false
        },
        {
          id: 2,
          propertyId: 2,
          propertyName: "Family Home with Garden",
          propertyAddress: "456 Main St, North Shore",
          tenantName: "Mike Wilson",
          tenantEmail: "mike@example.com",
          tenantPhone: "+64 21 234 5678",
          issue: "Heating system not working",
          description: "The central heating system stopped working yesterday. The house is getting very cold, especially at night.",
          category: "heating",
          priority: "high",
          status: "in-progress",
          reportedDate: "2024-01-18",
          reportedTime: "09:15",
          estimatedCost: 300,
          actualCost: null,
          assignedContractor: "HVAC Solutions Ltd",
          contractorName: "Tom Johnson",
          contractorPhone: "+64 21 345 6789",
          scheduledDate: "2024-01-22",
          completedDate: null,
          images: ["heating1.jpg"],
          tenantNotes: "Urgent - house is very cold",
          contractorNotes: "Diagnosed as faulty thermostat. Parts ordered, will complete by Friday.",
          followUpRequired: true
        },
        {
          id: 3,
          propertyId: 3,
          propertyName: "Cozy Studio Unit",
          propertyAddress: "789 Parnell Rd, Parnell",
          tenantName: "Sarah Johnson",
          tenantEmail: "sarah@example.com",
          tenantPhone: "+64 21 345 6789",
          issue: "Window latch broken",
          description: "The bedroom window latch is broken and the window won't stay closed properly. It's a security concern.",
          category: "security",
          priority: "high",
          status: "completed",
          reportedDate: "2024-01-15",
          reportedTime: "16:45",
          estimatedCost: 80,
          actualCost: 75,
          assignedContractor: "Quick Fix Handyman",
          contractorName: "Bob Smith",
          contractorPhone: "+64 21 456 7890",
          scheduledDate: "2024-01-17",
          completedDate: "2024-01-17",
          images: ["window1.jpg", "window2.jpg"],
          tenantNotes: "Security issue - please prioritize",
          contractorNotes: "Replaced latch mechanism. Window now secure.",
          followUpRequired: false
        },
        {
          id: 4,
          propertyId: 1,
          propertyName: "Downtown Apartment",
          propertyAddress: "123 Queen St, Auckland CBD",
          tenantName: "John Smith",
          tenantEmail: "john@example.com",
          tenantPhone: "+64 21 123 4567",
          issue: "Light fixture not working",
          description: "The light fixture in the living room stopped working. Tried changing the bulb but it still doesn't work.",
          category: "electrical",
          priority: "low",
          status: "pending",
          reportedDate: "2024-01-19",
          reportedTime: "20:00",
          estimatedCost: 120,
          actualCost: null,
          assignedContractor: null,
          contractorName: null,
          contractorPhone: null,
          scheduledDate: null,
          completedDate: null,
          images: ["light1.jpg"],
          tenantNotes: "Not urgent, can wait a few days",
          contractorNotes: null,
          followUpRequired: false
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleStatusUpdate = (requestId, newStatus) => {
    setMaintenanceRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              status: newStatus,
              completedDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : request.completedDate
            }
          : request
      )
    );
  };

  const handleAssignContractor = (requestId, contractorInfo) => {
    setMaintenanceRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              assignedContractor: contractorInfo.name,
              contractorName: contractorInfo.contactName,
              contractorPhone: contractorInfo.phone,
              scheduledDate: contractorInfo.scheduledDate,
              status: 'in-progress'
            }
          : request
      )
    );
  };

  const handleAddRequest = async (e) => {
    e.preventDefault();
    const newReq = {
      id: maintenanceRequests.length + 1,
      ...newRequest,
      status: 'pending',
      reportedDate: new Date().toISOString().split('T')[0],
      reportedTime: new Date().toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' }),
      estimatedCost: 0,
      actualCost: null,
      assignedContractor: null,
      contractorName: null,
      contractorPhone: null,
      scheduledDate: null,
      completedDate: null,
      images: [],
      tenantNotes: '',
      contractorNotes: null,
      followUpRequired: false
    };
    
    setMaintenanceRequests([...maintenanceRequests, newReq]);
    setShowAddRequest(false);
    setNewRequest({
      propertyId: '',
      propertyName: '',
      issue: '',
      description: '',
      priority: 'medium',
      category: 'general'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="status-icon pending" />;
      case 'in-progress':
        return <AlertCircle size={16} className="status-icon in-progress" />;
      case 'completed':
        return <CheckCircle size={16} className="status-icon completed" />;
      case 'cancelled':
        return <XCircle size={16} className="status-icon cancelled" />;
      default:
        return <Clock size={16} className="status-icon pending" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'in-progress':
        return 'status-review';
      case 'completed':
        return 'status-approved';
      case 'cancelled':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredRequests = maintenanceRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const getFilterStats = () => {
    return {
      total: maintenanceRequests.length,
      pending: maintenanceRequests.filter(req => req.status === 'pending').length,
      inProgress: maintenanceRequests.filter(req => req.status === 'in-progress').length,
      completed: maintenanceRequests.filter(req => req.status === 'completed').length,
      cancelled: maintenanceRequests.filter(req => req.status === 'cancelled').length
    };
  };

  if (loading) {
    return (
      <UserLayout title="Maintenance Management" subtitle="Loading maintenance requests...">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading maintenance requests...</p>
        </div>
      </UserLayout>
    );
  }

  const stats = getFilterStats();

  return (
    <UserLayout 
      title="Maintenance Management" 
      subtitle="Manage maintenance requests and contractors"
    >
      <div className="applications-wrapper">
        {/* Header Stats */}
        <div className="applications-header">
          <div className="applications-stats">
            <div className="stat-item">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total Requests</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.inProgress}</span>
              <span className="stat-label">In Progress</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                ${maintenanceRequests
                  .filter(req => req.actualCost)
                  .reduce((total, req) => total + req.actualCost, 0)
                  .toLocaleString()}
              </span>
              <span className="stat-label">Total Cost</span>
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
              className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
              onClick={() => setFilter('in-progress')}
            >
              In Progress
            </button>
            <button 
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
            <button 
              className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilter('cancelled')}
            >
              Cancelled
            </button>
          </div>

          <button 
            className="add-property-btn"
            onClick={() => setShowAddRequest(true)}
          >
            <Plus size={16} />
            Add Request
          </button>
        </div>

        {/* Maintenance Requests List */}
        <div className="applications-list">
          {filteredRequests.map((request) => (
            <div key={request.id} className="application-card">
              <div className="application-header">
                <div className="application-id">
                  <Wrench size={16} />
                  <span>REQ-{request.id.toString().padStart(3, '0')}</span>
                </div>
                <div className="application-status">
                  <span className={`priority-badge ${getPriorityColor(request.priority)}`}>
                    {request.priority.toUpperCase()}
                  </span>
                  <div className={`application-status ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    <span>{request.status.replace('-', ' ').toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div className="application-content">
                <div className="property-info">
                  <h3 className="property-title">{request.propertyName}</h3>
                  
                  <div className="property-details">
                    <div className="detail-item">
                      <Building2 size={16} />
                      <span>{request.propertyAddress}</span>
                    </div>
                    <div className="detail-item">
                      <User size={16} />
                      <span>Tenant: {request.tenantName}</span>
                    </div>
                    <div className="detail-item">
                      <Calendar size={16} />
                      <span>Reported: {formatDate(request.reportedDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="applicant-info">
                  <h4 className="issue-title">{request.issue}</h4>
                  <p className="issue-description">{request.description}</p>
                  
                  <div className="request-details">
                    <div className="detail-row">
                      <span className="detail-label">Category:</span>
                      <span className="detail-value">{request.category}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Estimated Cost:</span>
                      <span className="detail-value">${request.estimatedCost}</span>
                    </div>
                    {request.actualCost && (
                      <div className="detail-row">
                        <span className="detail-label">Actual Cost:</span>
                        <span className="detail-value">${request.actualCost}</span>
                      </div>
                    )}
                    {request.assignedContractor && (
                      <div className="detail-row">
                        <span className="detail-label">Contractor:</span>
                        <span className="detail-value">{request.assignedContractor}</span>
                      </div>
                    )}
                    {request.scheduledDate && (
                      <div className="detail-row">
                        <span className="detail-label">Scheduled:</span>
                        <span className="detail-value">{formatDate(request.scheduledDate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {request.tenantNotes && (
                  <div className="tenant-notes">
                    <MessageSquare size={16} />
                    <span>Tenant Notes: {request.tenantNotes}</span>
                  </div>
                )}
              </div>

              <div className="application-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => {
                    setSelectedRequest(request);
                    setShowRequestDetails(true);
                  }}
                >
                  <Eye size={16} />
                  View Details
                </button>
                
                {request.status === 'pending' && (
                  <>
                    <button 
                      className="action-btn success"
                      onClick={() => {
                        const contractorName = prompt('Enter contractor name:');
                        const contactName = prompt('Enter contact person:');
                        const phone = prompt('Enter phone number:');
                        const scheduledDate = prompt('Enter scheduled date (YYYY-MM-DD):');
                        
                        if (contractorName && contactName && phone && scheduledDate) {
                          handleAssignContractor(request.id, {
                            name: contractorName,
                            contactName,
                            phone,
                            scheduledDate
                          });
                        }
                      }}
                    >
                      <User size={16} />
                      Assign Contractor
                    </button>
                    <button 
                      className="action-btn danger"
                      onClick={() => handleStatusUpdate(request.id, 'cancelled')}
                    >
                      <XCircle size={16} />
                      Cancel
                    </button>
                  </>
                )}
                
                {request.status === 'in-progress' && (
                  <button 
                    className="action-btn success"
                    onClick={() => {
                      const actualCost = prompt('Enter actual cost:');
                      if (actualCost) {
                        setMaintenanceRequests(prev => 
                          prev.map(req => 
                            req.id === request.id 
                              ? { ...req, actualCost: parseFloat(actualCost) }
                              : req
                          )
                        );
                        handleStatusUpdate(request.id, 'completed');
                      }
                    }}
                  >
                    <CheckCircle size={16} />
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredRequests.length === 0 && (
          <div className="empty-state">
            <Wrench size={64} className="empty-icon" />
            <h3>No Maintenance Requests Found</h3>
            <p>No requests match your current filter.</p>
            <button 
              className="filter-btn"
              onClick={() => setFilter('all')}
            >
              View All Requests
            </button>
          </div>
        )}

        {/* Add Request Modal */}
        {showAddRequest && (
          <div className="modal-overlay" onClick={() => setShowAddRequest(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add Maintenance Request</h3>
                <button className="close-modal-btn" onClick={() => setShowAddRequest(false)}>
                  ×
                </button>
              </div>
              
              <form onSubmit={handleAddRequest} className="modal-form">
                <div className="form-group">
                  <label htmlFor="property-name">Property</label>
                  <input
                    type="text"
                    id="property-name"
                    value={newRequest.propertyName}
                    onChange={(e) => setNewRequest({...newRequest, propertyName: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="issue">Issue Title</label>
                  <input
                    type="text"
                    id="issue"
                    value={newRequest.issue}
                    onChange={(e) => setNewRequest({...newRequest, issue: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    rows="3"
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      value={newRequest.category}
                      onChange={(e) => setNewRequest({...newRequest, category: e.target.value})}
                      required
                    >
                      <option value="general">General</option>
                      <option value="plumbing">Plumbing</option>
                      <option value="electrical">Electrical</option>
                      <option value="heating">Heating</option>
                      <option value="security">Security</option>
                      <option value="appliance">Appliance</option>
                      <option value="structural">Structural</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="priority">Priority</label>
                    <select
                      id="priority"
                      value={newRequest.priority}
                      onChange={(e) => setNewRequest({...newRequest, priority: e.target.value})}
                      required
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowAddRequest(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Add Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Request Details Modal */}
        {showRequestDetails && selectedRequest && (
          <div className="modal-overlay" onClick={() => setShowRequestDetails(false)}>
            <div className="modal large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Maintenance Request Details - {selectedRequest.issue}</h3>
                <button className="close-modal-btn" onClick={() => setShowRequestDetails(false)}>
                  ×
                </button>
              </div>
              
              <div className="modal-content">
                <div className="details-section">
                  <h4>Request Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Request ID:</span>
                      <span className="value">REQ-{selectedRequest.id.toString().padStart(3, '0')}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Status:</span>
                      <span className={`value ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Priority:</span>
                      <span className={`value ${getPriorityColor(selectedRequest.priority)}`}>
                        {selectedRequest.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Category:</span>
                      <span className="value">{selectedRequest.category}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Reported:</span>
                      <span className="value">{formatDate(selectedRequest.reportedDate)} at {selectedRequest.reportedTime}</span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h4>Property Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Property:</span>
                      <span className="value">{selectedRequest.propertyName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Address:</span>
                      <span className="value">{selectedRequest.propertyAddress}</span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h4>Tenant Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Name:</span>
                      <span className="value">{selectedRequest.tenantName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Email:</span>
                      <span className="value">{selectedRequest.tenantEmail}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Phone:</span>
                      <span className="value">{selectedRequest.tenantPhone}</span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h4>Issue Details</h4>
                  <div className="detail-grid">
                    <div className="detail-item full-width">
                      <span className="label">Issue:</span>
                      <span className="value">{selectedRequest.issue}</span>
                    </div>
                    <div className="detail-item full-width">
                      <span className="label">Description:</span>
                      <p className="value">{selectedRequest.description}</p>
                    </div>
                    {selectedRequest.tenantNotes && (
                      <div className="detail-item full-width">
                        <span className="label">Tenant Notes:</span>
                        <p className="value">{selectedRequest.tenantNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedRequest.assignedContractor && (
                  <div className="details-section">
                    <h4>Contractor Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="label">Company:</span>
                        <span className="value">{selectedRequest.assignedContractor}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Contact:</span>
                        <span className="value">{selectedRequest.contractorName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Phone:</span>
                        <span className="value">{selectedRequest.contractorPhone}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Scheduled:</span>
                        <span className="value">{formatDate(selectedRequest.scheduledDate)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="details-section">
                  <h4>Cost Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Estimated Cost:</span>
                      <span className="value">${selectedRequest.estimatedCost}</span>
                    </div>
                    {selectedRequest.actualCost && (
                      <div className="detail-item">
                        <span className="label">Actual Cost:</span>
                        <span className="value">${selectedRequest.actualCost}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedRequest.contractorNotes && (
                  <div className="details-section">
                    <h4>Contractor Notes</h4>
                    <p className="value">{selectedRequest.contractorNotes}</p>
                  </div>
                )}

                {selectedRequest.images.length > 0 && (
                  <div className="details-section">
                    <h4>Images</h4>
                    <div className="images-grid">
                      {selectedRequest.images.map((image, index) => (
                        <div key={index} className="image-item">
                          <FileText size={16} />
                          <span>{image}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button 
                  className="action-btn secondary"
                  onClick={() => setShowRequestDetails(false)}
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

export default LandlordMaintenance;

