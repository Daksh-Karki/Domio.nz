import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, logOut } from "../firebase";
import "../styles/Login.css"; // Reusing styles for now

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        // No user is signed in, redirect to login
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
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

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
        gap: "20px" 
      }}>
        <div style={{
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          border: "1px solid #e9ecef"
        }}>
          <h3 style={{ margin: "0 0 15px 0", color: "#333" }}>Property Management</h3>
          <p style={{ color: "#666", margin: 0 }}>
            Manage your properties, view tenants, and handle maintenance requests.
          </p>
        </div>

        <div style={{
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          border: "1px solid #e9ecef"
        }}>
          <h3 style={{ margin: "0 0 15px 0", color: "#333" }}>Financial Overview</h3>
          <p style={{ color: "#666", margin: 0 }}>
            Track rent payments, expenses, and generate financial reports.
          </p>
        </div>

        <div style={{
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          border: "1px solid #e9ecef"
        }}>
          <h3 style={{ margin: "0 0 15px 0", color: "#333" }}>Communication</h3>
          <p style={{ color: "#666", margin: 0 }}>
            Send messages to tenants and receive maintenance notifications.
          </p>
        </div>
      </div>
    </div>
  );
}

