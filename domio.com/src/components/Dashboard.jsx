import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Home, DollarSign, Wrench, Users } from "lucide-react";
import "../styles/Login.css"; // Reusing styles for now

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [financialRecords, setFinancialRecords] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [newProperty, setNewProperty] = useState({
    name: '',
    address: '',
    type: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    rent: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate user login and load mock data
    setTimeout(() => {
      setUser({ email: "user@example.com", uid: "mock-user-id" });
      loadDashboardData();
      setLoading(false);
    }, 1000);
  }, [navigate]);

  const loadDashboardData = () => {
    // Load mock data
    setProperties([
      { id: 1, name: "Downtown Apartment", address: "123 Queen St, Auckland", type: "apartment", bedrooms: 2, bathrooms: 1, rent: 650 },
      { id: 2, name: "Family House", address: "456 Main St, Auckland", type: "house", bedrooms: 4, bathrooms: 2, rent: 850 }
    ]);
    setFinancialRecords([
      { id: 1, type: "income", amount: 1500, description: "Rent payment", date: "2024-01-15" },
      { id: 2, type: "expense", amount: 200, description: "Maintenance", date: "2024-01-10" }
    ]);
    setMaintenanceRequests([
      { id: 1, property: "Downtown Apartment", issue: "Leaky faucet", status: "pending", date: "2024-01-20" }
    ]);
  };

  const handleLogout = () => {
    setUser(null);
    navigate("/login");
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    if (!user) return;

    // Simulate adding property
    const newProp = {
      id: properties.length + 1,
      ...newProperty,
      rent: parseFloat(newProperty.rent) || 0
    };
    
    setProperties([...properties, newProp]);
    setShowAddProperty(false);
    setNewProperty({
      name: '',
      address: '',
      type: 'apartment',
      bedrooms: 1,
      bathrooms: 1,
      rent: ''
    });
  };

  const getTotalRent = () => {
    return properties.reduce((total, property) => total + (property.rent || 0), 0);
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        fontSize: "1.2rem"
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "30px",
        padding: "20px",
        backgroundColor: "#f8f9fa",
        borderRadius: "10px"
      }}>
        <div>
          <h1 style={{ margin: 0, color: "#333" }}>Welcome to Domio</h1>
          <p style={{ margin: "5px 0 0 0", color: "#666" }}>
            Logged in as: {user?.email}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={() => navigate('/profile')}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "1rem"
            }}
          >
            Profile
          </button>
          <button 
            onClick={handleLogout}
            style={{
              padding: "10px 20px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "1rem"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
        gap: "20px",
        marginBottom: "30px"
      }}>
        <div style={{
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          border: "1px solid #e9ecef",
          display: "flex",
          alignItems: "center",
          gap: "15px"
        }}>
          <Home size={40} color="#007bff" />
          <div>
            <h3 style={{ margin: 0, color: "#333" }}>{properties.length}</h3>
            <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>Properties</p>
          </div>
        </div>

        <div style={{
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          border: "1px solid #e9ecef",
          display: "flex",
          alignItems: "center",
          gap: "15px"
        }}>
          <DollarSign size={40} color="#28a745" />
          <div>
            <h3 style={{ margin: 0, color: "#333" }}>${getTotalRent().toLocaleString()}</h3>
            <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>Total Monthly Rent</p>
          </div>
        </div>

        <div style={{
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          border: "1px solid #e9ecef",
          display: "flex",
          alignItems: "center",
          gap: "15px"
        }}>
          <Wrench size={40} color="#ffc107" />
          <div>
            <h3 style={{ margin: 0, color: "#333" }}>{maintenanceRequests.length}</h3>
            <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>Maintenance Requests</p>
          </div>
        </div>
      </div>

      {/* Properties Section */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        border: "1px solid #e9ecef",
        marginBottom: "30px"
      }}>
        <div style={{
          padding: "20px",
          borderBottom: "1px solid #e9ecef",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h3 style={{ margin: 0, color: "#333" }}>Your Properties</h3>
          <button
            onClick={() => setShowAddProperty(true)}
            style={{
              padding: "10px 15px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px"
            }}
          >
            <Plus size={16} />
            Add Property
          </button>
        </div>

        <div style={{ padding: "20px" }}>
          {properties.length === 0 ? (
            <p style={{ color: "#666", textAlign: "center", margin: "40px 0" }}>
              No properties yet. Add your first property to get started!
            </p>
          ) : (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
              gap: "20px" 
            }}>
              {properties.map((property) => (
                <div key={property.id} style={{
                  padding: "15px",
                  border: "1px solid #e9ecef",
                  borderRadius: "8px",
                  backgroundColor: "#f8f9fa"
                }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>{property.name}</h4>
                  <p style={{ margin: "5px 0", color: "#666", fontSize: "0.9rem" }}>{property.address}</p>
                  <p style={{ margin: "5px 0", color: "#666", fontSize: "0.9rem" }}>
                    {property.bedrooms} bed, {property.bathrooms} bath
                  </p>
                  <p style={{ margin: "10px 0 0 0", color: "#28a745", fontWeight: "bold" }}>
                    ${property.rent}/month
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Property Modal */}
      {showAddProperty && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "10px",
            width: "90%",
            maxWidth: "500px",
            maxHeight: "90vh",
            overflow: "auto"
          }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#333" }}>Add New Property</h3>
            <form onSubmit={handleAddProperty}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", color: "#333" }}>Property Name</label>
                <input
                  type="text"
                  value={newProperty.name}
                  onChange={(e) => setNewProperty({...newProperty, name: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    fontSize: "1rem"
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", color: "#333" }}>Address</label>
                <input
                  type="text"
                  value={newProperty.address}
                  onChange={(e) => setNewProperty({...newProperty, address: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    fontSize: "1rem"
                  }}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", color: "#333" }}>Bedrooms</label>
                  <input
                    type="number"
                    min="1"
                    value={newProperty.bedrooms}
                    onChange={(e) => setNewProperty({...newProperty, bedrooms: parseInt(e.target.value)})}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      fontSize: "1rem"
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", color: "#333" }}>Bathrooms</label>
                  <input
                    type="number"
                    min="1"
                    value={newProperty.bathrooms}
                    onChange={(e) => setNewProperty({...newProperty, bathrooms: parseInt(e.target.value)})}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      fontSize: "1rem"
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "5px", color: "#333" }}>Monthly Rent ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProperty.rent}
                  onChange={(e) => setNewProperty({...newProperty, rent: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    fontSize: "1rem"
                  }}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowAddProperty(false)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer"
                  }}
                >
                  Add Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


