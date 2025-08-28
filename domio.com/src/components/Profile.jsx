import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Phone, Home, ImageUp, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('editProfile');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Get Verified state
  const [documentFile, setDocumentFile] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, processing, verified

  // Load user data on component mount
  useEffect(() => {
    // Simulate loading user data
    setTimeout(() => {
      setUser({ email: "user@example.com", uid: "mock-user-id" });
      setProfileData({
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@example.com',
        phone: '+64 21 123 4567',
        role: 'Tenant',
      });
      setVerificationStatus('verified');
      setIsLoading(false);
    }, 1000);
  }, [navigate]);

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

  const handleRefreshProfile = () => {
    if (!user) return;
    
    setIsLoading(true);
    setMessage('');
    setError('');
    
    // Simulate profile refresh
    setTimeout(() => {
      setMessage('Profile refreshed successfully!');
      setIsLoading(false);
    }, 1000);
  };







  // Show loading state
  if (isLoading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        fontSize: "1.2rem"
      }}>
        <Loader2 className="animate-spin mr-2" />
        Loading profile...
      </div>
    );
  }

  return (
    <div className="profile-fullscreen">
      <div className="profile-wrapper">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <button
            className="sidebar-button active"
          >
            <User size={18} className="sidebar-icon" /> Edit Profile
          </button>
          <button
            className="home-button"
            onClick={() => window.location.href = '/dashboard'}
          >
            <Home size={18} className="sidebar-icon" /> Go to Dashboard
          </button>
        </aside>

        {/* Main Content */}
        <main className="profile-content">
            <>
              <div className="profile-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1>Your Profile</h1>
                  <p>Basic account information from signup.</p>
                </div>
                <button
                  onClick={handleRefreshProfile}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "0.9rem"
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Refresh Profile'}
                </button>
              </div>

              {message && <motion.div className="status-message success">{message}</motion.div>}
              {error && <motion.div className="status-message error">{error}</motion.div>}

              <form onSubmit={handleSaveChanges} className="profile-form">
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
                      name="lastName"
                      placeholder="Last Name"
                      value={profileData.lastName}
                      onChange={handleInputChange}
                      className="text-input"
                    />
                  </div>
                </div>

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
                  <User className="input-icon" size={18} />
                  <select
                    name="role"
                    value={profileData.role}
                    onChange={handleInputChange}
                    className="text-input"
                  >
                    <option value="">Select Role</option>
                    <option value="Tenant">Tenant</option>
                    <option value="Landlord">Landlord</option>
                    <option value="Both">Both</option>
                  </select>
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
        </main>
      </div>
    </div>
  );
};

export default Profile;
