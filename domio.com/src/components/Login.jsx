import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Login.css";
import p1 from "../assets/p1.jpg";
import { signIn, auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [role, setRole] = useState("Landlord");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminId, setAdminId] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const roles = ["Landlord", "Tenant", "Admin"];

  const handleRoleClick = (r) => setRole(r);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      if (role === "Admin" && (!email || !adminId || !password)) {
        setStatus("Please enter your Email, Admin ID, and Password.");
        return;
      }

      // For now, handle Admin login separately (you can implement custom admin logic later)
      if (role === "Admin") {
        setStatus("Admin login functionality coming soon!");
        return;
      }

      // Use Firebase authentication for Landlord and Tenant
      await signIn(email, password);
      setStatus(`Login successful as a ${role}! Redirecting to dashboard...`);
      
      // Redirect to dashboard after successful login
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
      
    } catch (error) {
      console.error("Login error:", error);
      setStatus(`Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Side: Image */}
      <div className="login-left">
        <img src={p1} alt="Modern house" />
      </div>

      {/* Right Side: Login Form */}
      <div className="login-right">
        <div className="brand">Domio</div>
        <div className="subtitle">Your Property Management Dashboard</div>

        <h2 style={{ fontWeight: "bold", marginBottom: "20px", fontSize: "1.25rem" }}>
          Sign in to your account
        </h2>

        {/* Role Selection */}
        <div className="role-selection">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => handleRoleClick(r)}
              className={r === role ? "active" : ""}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {role === "Admin" ? (
            <>
              {/* Admin Email */}
              <div className="input-group" style={{ marginBottom: "15px" }}>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: "12px" }}
                />
              </div>

              {/* Admin ID & Password side by side */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <input
                    type="text"
                    placeholder="Admin ID"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    required
                    style={{ paddingLeft: "12px" }}
                  />
                </div>

                <div className="input-group" style={{ flex: 1 }}>
                  <input
                    type="password"
                    placeholder="Admin Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingLeft: "12px" }}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Regular Email */}
              <div className="input-group" style={{ marginBottom: "15px" }}>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: "12px" }}
                />
              </div>

              {/* Regular Password */}
              <div className="input-group" style={{ marginBottom: "15px" }}>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: "12px" }}
                />
              </div>
            </>
          )}

          {role !== "Admin" && (
            <div className="form-controls">
            <label>
                <input type="checkbox" />
                <span style={{ marginLeft: "5px" }}>Remember me</span>
            </label>
            <Link to="/forgot-password">Forgot your password?</Link>
            </div>
          )}

          <button type="submit" className="signin-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {status && <div className="status-msg">{status}</div>}

        <div className="login-footer">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
