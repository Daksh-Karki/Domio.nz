import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  User, 
  Home, 
  Building2, 
  FileText, 
  Settings, 
  LogOut, 
  Menu,
  X,
  ArrowLeft
} from 'lucide-react';
import '../styles/UserLayout.css';

const UserLayout = ({ children, title, subtitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // Force a page reload to ensure clean state
    window.location.href = '/';
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      description: 'Overview of your account'
    },
    {
      name: 'Profile',
      icon: User,
      path: '/profile',
      description: 'Manage your personal information'
    },
    {
      name: 'My Properties',
      icon: Building2,
      path: '/my-properties',
      description: 'View and manage your properties'
    },
    {
      name: 'Applications',
      icon: FileText,
      path: '/applications',
      description: 'Track your rental applications'
    },
    {
      name: 'Settings',
      icon: Settings,
      path: '/settings',
      description: 'Account and privacy settings'
    }
  ];

  const currentPath = location.pathname;

  return (
    <div className="user-layout">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button 
            className="back-btn"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
          <button 
            className="close-sidebar-btn"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} className="nav-icon" />
                <div className="nav-content">
                  <span className="nav-name">{item.name}</span>
                  <span className="nav-description">{item.description}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            <button 
              className="menu-btn"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
          
          <div className="top-bar-center">
            <h1 className="page-title">{title}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>

          <div className="top-bar-right">
            <div className="username-badge">
              @{user?.username}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default UserLayout;
