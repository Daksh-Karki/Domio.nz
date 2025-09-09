// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import LandingPage from "./components/LandingPage.jsx";
import Login from "./components/Login.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";
import SignUp from "./components/SignUp.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Profile from "./components/Profile.jsx";
import MyProperties from "./components/MyProperties.jsx";
import Applications from "./components/Applications.jsx";
import LandlordProperties from "./components/LandlordProperties.jsx";
import LandlordApplications from "./components/LandlordApplications.jsx";
import LandlordMaintenance from "./components/LandlordMaintenance.jsx";
import LandlordFinancials from "./components/LandlordFinancials.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./styles/Login.css";  // your theme CSS

// Loading component
function LoadingScreen() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px',
      color: '#666'
    }}>
      Loading...
    </div>
  );
}

// Role-based route component
function RoleBasedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Please log in to access this page.</div>;
  }
  
  const userRole = user.role?.toLowerCase();
  const isAllowed = allowedRoles.includes(userRole);
  
  if (!isAllowed) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }
  
  return children;
}

// Main App component with auth loading state
function AppContent() {
  const { loading } = useAuth();
  
  console.log('App: Rendering AppContent, loading:', loading);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Tenant Routes */}
        <Route 
          path="/my-properties" 
          element={
            <RoleBasedRoute allowedRoles={['tenant']}>
              <MyProperties />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="/applications" 
          element={
            <RoleBasedRoute allowedRoles={['tenant']}>
              <Applications />
            </RoleBasedRoute>
          } 
        />
        
        {/* Landlord Routes */}
        <Route 
          path="/landlord/properties" 
          element={
            <RoleBasedRoute allowedRoles={['landlord']}>
              <LandlordProperties />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="/landlord/applications" 
          element={
            <RoleBasedRoute allowedRoles={['landlord']}>
              <LandlordApplications />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="/landlord/maintenance" 
          element={
            <RoleBasedRoute allowedRoles={['landlord']}>
              <LandlordMaintenance />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="/landlord/financials" 
          element={
            <RoleBasedRoute allowedRoles={['landlord']}>
              <LandlordFinancials />
            </RoleBasedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

function App() {
  console.log('App: Rendering App component');
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
