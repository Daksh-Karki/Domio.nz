import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Camera, Shield, Edit3, AtSign, X, FileText, Upload, Download, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getUserDocument, updateUserDocument } from '../firebase/auth.js';
import { uploadProfileImage, getProfileImageURL, deleteDocument, uploadDocument, getUserDocuments } from '../firebase/storageService.js';
import UserLayout from './UserLayout.jsx';
import '../styles/Profile.css';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    role: '',
    about: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState('ID');
  const [isDocumentUploading, setIsDocumentUploading] = useState(false);

  const documentTypes = [
    { label: 'ID', value: 'ID' },
    { label: 'Proof of Income', value: 'Proof of Income' },
    { label: 'Proof of Address', value: 'Proof of Address' },
    { label: 'Employment Letter', value: 'Employment Letter' },
    { label: 'Bank Statement', value: 'Bank Statement' },
    { label: 'Other', value: 'Other' },
  ];

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Load user data and profile image on component mount
  useEffect(() => {
    if (user) {
      const profileDataToSet = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || '',
        about: user.about || 'I am a responsible tenant looking for a comfortable place to call home.',
      };
      setProfileData(profileDataToSet);
      
      // Load profile image and documents, then set loading to false
      const loadData = async () => {
        try {
          await Promise.all([
            loadProfileImage(),
            loadDocuments()
          ]);
        } catch (error) {
          console.error('Error loading profile data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadData();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);



  // Load profile image from Firebase Storage
  const loadProfileImage = async () => {
    if (!user?.uid) return;
    
    try {
      const result = await getProfileImageURL(user.uid);
      if (result.success && result.url) {
        setProfileImage(result.url);
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
      // Generate random sticker on error
      setRandomSticker(generateRandomSticker());
    }
  };

  // Load documents from Firebase Storage
  const loadDocuments = async () => {
    if (!user?.uid) return;

    try {
      const result = await getUserDocuments(user.uid);
      if (result.success) {
        setDocuments(result.documents);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  // Function to refresh user data from Firestore
  const refreshUserData = async () => {
    if (!user?.uid) return;
    
    try {
      const userDoc = await getUserDocument(user.uid);
      if (userDoc.success) {
        const freshData = {
          firstName: userDoc.data.firstName || '',
          lastName: userDoc.data.lastName || '',
          username: userDoc.data.username || '',
          email: userDoc.data.email || '',
          phone: userDoc.data.phone || '',
          role: userDoc.data.role || '',
          about: userDoc.data.about || '',
        };
        setProfileData(freshData);
      }
    } catch (error) {
      console.error('Profile: Error refreshing user data:', error);
    }
  };

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    setMessage('');
    setError('');

    try {
      const result = await updateUserDocument(user.uid, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        username: profileData.username,
        phone: profileData.phone,
        about: profileData.about
      });

      if (result.success) {
        setMessage('Profile updated successfully!');
        await refreshUserData();
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('An error occurred while updating your profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.uid) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setIsImageUploading(true);
    setError('');

    try {
      // Upload image to Firebase Storage
      const result = await uploadProfileImage(user.uid, file);
      
      if (result.success) {
        setProfileImage(result.url);
        setMessage('Profile image updated successfully!');
      } else {
        setError('Failed to upload image: ' + result.error);
      }
    } catch (error) {
      setError('Error uploading image: ' + error.message);
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleImageClick = () => {
    if (profileImage) {
      setShowImageModal(true);
    }
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.uid) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('application/pdf') && !file.type.startsWith('application/msword') && !file.type.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setError('Please select a valid document file (PDF, DOC, DOCX, JPG, PNG)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Document size should be less than 10MB');
      return;
    }

    setIsDocumentUploading(true);
    setError('');

    try {
      // Upload document to Firebase Storage
      const result = await uploadDocument(user.uid, file, selectedDocumentType);
      
      if (result.success) {
        const newDocument = {
          fileName: result.fileName,
          originalName: result.fileName,
          documentType: result.documentType,
          size: result.size,
          url: result.url,
          timestamp: new Date(result.timestamp).toISOString(),
        };
        setDocuments(prev => [...prev, newDocument]);
        setMessage('Document uploaded successfully!');
        setShowUploadModal(false);
      } else {
        setError('Failed to upload document: ' + result.error);
      }
    } catch (error) {
      setError('Error uploading document: ' + error.message);
    } finally {
      setIsDocumentUploading(false);
    }
  };

  const handleDocumentDelete = async (fileName, documentType) => {
    if (!user?.uid) return;

    if (window.confirm(`Are you sure you want to delete this ${documentType} document?`)) {
      try {
        const result = await deleteDocument(user.uid, documentType, fileName);
        if (result.success) {
          setDocuments(prev => prev.filter(doc => doc.fileName !== fileName));
          setMessage('Document deleted successfully!');
        } else {
          setError('Failed to delete document: ' + result.error);
        }
      } catch (error) {
        setError('Error deleting document: ' + error.message);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="fullscreen-loading">
        <div className="loading-container">
          <div className="loading-logo">
            <img src="/src/assets/Logo.png" alt="Domio.nz Logo" />
          </div>
          <p>Loading your profile...</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <UserLayout 
      title="Profile Settings" 
      subtitle="Manage your account information and preferences"
    >
      <div className="profile-content-wrapper">
        <div className="profile-grid">
          {/* Left Column - Profile Picture */}
          <div className="profile-picture-section">
            <div className="picture-container">
              <div 
                className={`profile-picture-wrapper ${profileImage ? 'clickable' : ''}`}
                onClick={handleImageClick}
              >
                        {profileImage ? (
          <img src={profileImage} alt="Profile" className="profile-picture" />
        ) : (
          <div className="profile-placeholder">
            <span className="profile-letter">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
        )}

              </div>
              
              {/* Hidden file input - always accessible */}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="profile-image-input"
              />
              
              <button
                className="change-photo-btn"
                onClick={() => document.getElementById('profile-image-input').click()}
                disabled={isImageUploading}
              >
                {isImageUploading ? 'Uploading...' : 'Change Photo'}
              </button>
            </div>
            
            {/* Account Status */}
            <div className="account-status">
              <div className="status-item">
                <Shield size={16} />
                <span>Account Status</span>
                <div className="status-badge verified">Verified</div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="profile-form-section">
            <div className="form-container">
              <h2>Personal Information</h2>
              
              {message && (
                <div className="success-message">
                  {message}
                </div>
              )}
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <form onSubmit={handleSaveChanges} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="username">
                    <AtSign size={16} className="label-icon" />
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={profileData.username}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your username"
                  />
                  <small className="form-help">This will be your unique identifier on the platform</small>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    disabled
                    className="form-input disabled"
                    placeholder="Your email address"
                  />
                  <small className="form-help">Email cannot be changed</small>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">Account Type</label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={profileData.role}
                    disabled
                    className="form-input disabled"
                    placeholder="Your account type"
                  />
                  <small className="form-help">Account type cannot be changed</small>
                </div>

                <div className="form-group">
                  <label htmlFor="about">
                    <Edit3 size={16} className="label-icon" />
                    About Me
                  </label>
                  <textarea
                    id="about"
                    name="about"
                    value={profileData.about}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Tell us about yourself, your preferences, lifestyle, or anything else you'd like landlords to know..."
                    rows={6}
                  />
                  <small className="form-help">This information helps landlords understand you better</small>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="save-button" 
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="documents-section">
          <div className="documents-container">
            <div className="documents-header">
              <h2>
                <FileText size={24} className="section-icon" />
                Documents
              </h2>
              <p>Upload important documents to complete your profile and speed up rental applications</p>
            </div>

            {/* Document Upload Area */}
            <div className="document-upload-area" onClick={() => setShowUploadModal(true)}>
              <div className="upload-content">
                <div className="upload-icon">
                  <Upload size={48} />
                </div>
                <h3>Upload Documents</h3>
                <p>Click here to upload your important documents</p>
                <div className="upload-hint">
                  <small>Supported formats: PDF, DOC, DOCX, JPG, PNG (Max size: 10MB)</small>
                </div>
              </div>
            </div>

            {/* Documents List */}
            <div className="documents-list">
              {documents.length === 0 ? (
                <div className="no-documents">
                  <FileText size={48} />
                  <p>No documents uploaded yet</p>
                  <small>Upload your first document to get started</small>
                </div>
              ) : (
                documents.map((doc, index) => (
                  <div key={index} className="document-item">
                    <div className="document-info">
                      <div className="document-icon">
                        <FileText size={20} />
                      </div>
                      <div className="document-details">
                        <h4>{doc.originalName}</h4>
                        <p className="document-meta">
                          {doc.documentType.charAt(0).toUpperCase() + doc.documentType.slice(1)} • 
                          {doc.size > 0 ? ` ${formatFileSize(doc.size)} •` : ''} 
                          {formatDate(doc.timestamp)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="document-actions">
                      <button
                        className="action-btn view-btn"
                        onClick={() => {
                          // Validate URL before opening
                          if (doc.url && (doc.url.startsWith('https://') || doc.url.startsWith('http://'))) {
                            window.open(doc.url, '_blank');
                          } else {
                            alert('Invalid document URL');
                          }
                        }}
                        title="View document"
                      >
                        <Eye size={20} />
                      </button>
                      <a
                        href={doc.url}
                        download={doc.originalName}
                        className="action-btn download-btn"
                        title="Download document"
                      >
                        <Download size={20} />
                      </a>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDocumentDelete(doc.fileName, doc.documentType)}
                        title="Delete document"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Document Upload Modal */}
        {showUploadModal && (
          <div className="upload-modal-overlay" onClick={() => setShowUploadModal(false)}>
            <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Upload Document</h3>
                <button className="close-modal-btn" onClick={() => setShowUploadModal(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="modal-content">
                <div className="upload-form">
                  <div className="form-group">
                    <label htmlFor="document-type">Document Type</label>
                    <select
                      id="document-type"
                      value={selectedDocumentType}
                      onChange={(e) => setSelectedDocumentType(e.target.value)}
                      className="form-select"
                    >
                      {documentTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="document-file">Select File</label>
                    <div className="file-input-wrapper">
                      <input
                        type="file"
                        id="document-file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleDocumentUpload}
                        className="file-input"
                      />
                      <label htmlFor="document-file" className="file-input-label">
                        <div className="file-input-content">
                          <Upload size={24} />
                          <span>Choose a file or drag it here</span>
                          <small>PDF, DOC, DOCX, JPG, PNG up to 10MB</small>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {isDocumentUploading && (
                    <div className="upload-progress">
                      <div className="progress-bar">
                        <div className="progress-fill"></div>
                      </div>
                      <span>Uploading document...</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setShowUploadModal(false)}
                  disabled={isDocumentUploading}
                >
                  Cancel
                </button>
                <button
                  className="upload-btn"
                  onClick={() => document.getElementById('document-file').click()}
                  disabled={isDocumentUploading}
                >
                  {isDocumentUploading ? 'Uploading...' : 'Select File'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Preview Modal */}
        {showImageModal && (
          <div className="image-modal-overlay" onClick={closeImageModal}>
            <div className="image-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Profile Picture</h3>
                <button className="close-modal-btn" onClick={closeImageModal}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-content">
                        {profileImage ? (
          <img src={profileImage} alt="Profile" className="modal-image" />
        ) : (
          <div className="modal-letter">
            <span className="profile-letter-large">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
        )}
              </div>
              <div className="modal-actions">
                <button
                  className="upload-new-btn"
                  onClick={() => {
                    document.getElementById('profile-image-input').click();
                    closeImageModal();
                  }}
                >
                  <Camera size={16} />
                  Upload New Photo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default Profile;
