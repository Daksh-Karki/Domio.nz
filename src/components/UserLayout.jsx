import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  User, 
  Home, 
  Building2, 
  FileText, 
  LogOut, 
  Menu,
  X,
  ArrowLeft,
  Wrench,
  DollarSign,
  Users
} from 'lucide-react';
import '../styles/UserLayout.css';

const UserLayout = ({ children, title, subtitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // Force a page reload to ensure clean state
    window.location.href = '/';
  };

  const isLandlord = user?.role?.toLowerCase() === 'landlord';
  
  const tenantNavigationItems = [
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
    }
  ];

  const landlordNavigationItems = [
    {
      name: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      description: 'Overview of your properties and tenants'
    },
    {
      name: 'Profile',
      icon: User,
      path: '/profile',
      description: 'Manage your personal information'
    },
    {
      name: 'Properties',
      icon: Building2,
      path: '/landlord/properties',
      description: 'Manage your rental properties'
    },
    {
      name: 'Applications',
      icon: FileText,
      path: '/landlord/applications',
      description: 'Review tenant applications'
    },
    {
      name: 'Maintenance',
      icon: Wrench,
      path: '/landlord/maintenance',
      description: 'Manage maintenance requests'
    },
    {
      name: 'Financials',
      icon: DollarSign,
      path: '/landlord/financials',
      description: 'Track income and expenses'
    }
  ];

  const navigationItems = isLandlord ? landlordNavigationItems : tenantNavigationItems;

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
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button 
            className="back-btn"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={20} />
            {!sidebarCollapsed && "Back to Home"}
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
                title={sidebarCollapsed ? item.name : undefined}
              >
                <Icon size={20} className="nav-icon" />
                {!sidebarCollapsed && (
                  <div className="nav-content">
                    <span className="nav-name">{item.name}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout} title={sidebarCollapsed ? "Sign Out" : undefined}>
            <LogOut size={20} />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
          <button 
            className="collapse-toggle-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
            {!sidebarCollapsed && <span>{sidebarCollapsed ? "Expand" : "Collapse"}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top Bar */}
        <header className={`top-bar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="top-bar-left">
            <button 
              className="menu-btn"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="page-header">
              <h1 className="page-title">{title}</h1>
              {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>
          </div>

          <div className="top-bar-right">
            <div className="user-profile">
              <div className="user-avatar">
                <span className="avatar-text">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="user-info">
                <span className="username">@{user?.username}</span>
                <span className="user-role">{user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1) || 'User'}</span>
              </div>
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
