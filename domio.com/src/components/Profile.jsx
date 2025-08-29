import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Camera, Shield, Edit3, AtSign, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getUserDocument, updateUserDocument } from '../firebase/auth.js';
import { uploadProfileImage, getProfileImageURL, deleteProfileImage } from '../firebase/storageService.js';
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
      
      // Load profile image from Firebase Storage
      loadProfileImage();
      setIsLoading(false);
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
                    <Camera size={24} />
                  </label>
                )}
                {isImageUploading && (
                  <div className="upload-overlay uploading">
                    <div className="upload-spinner"></div>
                    <span>Uploading...</span>
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
