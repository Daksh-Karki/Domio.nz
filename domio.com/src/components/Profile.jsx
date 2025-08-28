import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Camera, Shield, Edit3, AtSign, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
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
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || '',
        about: user.about || 'I am a responsible tenant looking for a comfortable place to call home. I enjoy a quiet environment and take good care of properties.',
      });
      setIsLoading(false);
    } else {
      // If no user, redirect to login
      navigate('/login');
    }
  }, [user, navigate]);

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

    // Simulate profile update
    setTimeout(() => {
      setMessage('Profile updated successfully!');
      setIsUpdating(false);
    }, 1000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setProfileImage(e.target.result);
      reader.readAsDataURL(file);
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

  // Show loading state
  if (isLoading) {
    return (
      <UserLayout title="Profile" subtitle="Loading your profile...">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </UserLayout>
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
                    <User size={48} />
                  </div>
                )}
                {!profileImage && (
                  <label className="upload-overlay">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                    <Camera size={24} />
                  </label>
                )}
              </div>
              <button
                className="change-photo-btn"
                onClick={() => document.querySelector('input[type="file"]').click()}
              >
                Change Photo
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
                <img src={profileImage} alt="Profile" className="modal-image" />
              </div>
              <div className="modal-actions">
                <button
                  className="upload-new-btn"
                  onClick={() => {
                    document.querySelector('input[type="file"]').click();
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
