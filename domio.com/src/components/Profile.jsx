import React, { useState } from 'react';
import { User, Mail, Calendar, Phone, Home, ImageUp, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import '../styles/Profile.css';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    surname: 'Doe',
    email: 'john.doe@example.com',
    dob: '1990-01-01',
    phone: '1234567890',
    address: '123 Main St',
    profileImageUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=john-doe',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('editProfile');

  // Get Verified state
  const [documentFile, setDocumentFile] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, processing, verified

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setTimeout(() => {
      setMessage('Profile updated successfully!');
      setError('');
      setIsUpdating(false);
    }, 1000);
  };

  const handleRandomSticker = () => {
    setProfileData(prev => ({
      ...prev,
      profileImageUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${Math.random()}`,
    }));
    setMessage('New sticker applied!');
  };

  // Handle document upload for verification
  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDocumentFile(file);
    setVerificationStatus('processing');

    // Simulate verification delay (3 sec)
    setTimeout(() => {
      setVerificationStatus('verified');
      setMessage('Your account has been verified! You will receive a confirmation email shortly.');
      setError('');
    }, 3000);
  };

  return (
    <div className="profile-fullscreen">
      <div className="profile-wrapper">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <button
            className={`sidebar-button ${activeTab === 'editProfile' ? 'active' : ''}`}
            onClick={() => setActiveTab('editProfile')}
          >
            <User size={18} className="sidebar-icon" /> Edit Profile
          </button>
          <button
            className={`sidebar-button ${activeTab === 'getVerified' ? 'active' : ''}`}
            onClick={() => setActiveTab('getVerified')}
          >
            <Sparkles size={18} className="sidebar-icon" /> Get Verified
          </button>
          <button
            className="home-button"
            onClick={() => window.location.href = '/'}
          >
            <Home size={18} className="sidebar-icon" /> Go to Home
          </button>
        </aside>

        {/* Main Content */}
        <main className="profile-content">
          {/* Edit Profile Tab */}
          {activeTab === 'editProfile' && (
            <>
              <div className="profile-header">
                <h1>Your Profile</h1>
                <p>Manage your personal information and preferences.</p>
              </div>

              <div className="profile-picture-section">
                <div className="profile-picture-wrapper">
                  <img
                    src={profileData.profileImageUrl}
                    alt="User Avatar"
                    className="profile-picture"
                  />
                  <label className="file-upload-label">
                    <ImageUp className="upload-icon" />
                    <input type="file" className="hidden" />
                  </label>
                </div>
                <button
                  onClick={handleRandomSticker}
                  className="sticker-button"
                  disabled={isUpdating}
                >
                  <Sparkles className="sticker-icon" />
                  Get Random Sticker
                </button>
              </div>

              {message && <motion.div className="status-message success">{message}</motion.div>}
              {error && <motion.div className="status-message error">{error}</motion.div>}

              <form onSubmit={handleSaveChanges} className="profile-form">
  {/* First Name + Last Name side by side */}
  <div className="grid-two-columns">
    <div className="input-wrapper">
      <User className="input-icon" size={18} />
      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        value={profileData.firstName}
        onChange={handleInputChange}
        className="text-input"
      />
    </div>
    <div className="input-wrapper">
      <User className="input-icon" size={18} />
      <input
        type="text"
        name="surname"
        placeholder="Last Name"
        value={profileData.surname}
        onChange={handleInputChange}
        className="text-input"
      />
    </div>
  </div>

  {/* Rest of the inputs */}
  <div className="input-wrapper">
    <Mail className="input-icon" size={18} />
    <input
      type="email"
      name="email"
      placeholder="Email"
      value={profileData.email}
      disabled
      className="text-input disabled-input"
    />
  </div>

  <div className="input-wrapper">
    <Calendar className="input-icon" size={18} />
    <input
      type="date"
      name="dob"
      value={profileData.dob}
      onChange={handleInputChange}
      className="text-input"
    />
  </div>

  <div className="input-wrapper">
    <Phone className="input-icon" size={18} />
    <input
      type="tel"
      name="phone"
      placeholder="Phone Number"
      value={profileData.phone}
      onChange={handleInputChange}
      className="text-input"
    />
  </div>

  <div className="input-wrapper">
    <Home className="input-icon" size={18} />
    <input
      type="text"
      name="address"
      placeholder="Address"
      value={profileData.address}
      onChange={handleInputChange}
      className="text-input"
    />
  </div>

  <button type="submit" className="save-button" disabled={isUpdating}>
    {isUpdating ? (
      <div className="flex-center">
        <Loader2 className="animate-spin mr-2" /> Saving...
      </div>
    ) : (
      'Save Changes'
    )}
  </button>
</form>

            </>
          )}

          {/* Get Verified Tab */}
          {activeTab === 'getVerified' && (
            <div className="verification-section">
              <h2>Verify Your Account</h2>
              <p>Upload a valid ID document to get your account verified. Our team will review it and send you a confirmation email.</p>

              {verificationStatus === 'pending' && (
                <label className="upload-document-label">
                  <input type="file" accept=".jpg,.png,.pdf" onChange={handleDocumentUpload} className="hidden" />
                  <span>Click to Upload Document</span>
                </label>
              )}

              {verificationStatus === 'processing' && (
                <div className="flex-center mt-4">
                  <Loader2 className="animate-spin mr-2" />
                  Processing your document...
                </div>
              )}

              {verificationStatus === 'verified' && (
                <div className="flex-center mt-4 verified">
                  <CheckCircle2 size={24} className="verified-icon" />
                  <span>Your account is verified!</span>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;
