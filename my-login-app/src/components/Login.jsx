import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Login.css";
import p1 from "../assets/p1.jpg";

export default function Login() {
  const [role, setRole] = useState("Landlord");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminId, setAdminId] = useState("");
  const [status, setStatus] = useState("");

  const roles = ["Landlord", "Tenant", "Admin"];

  const handleRoleClick = (r) => setRole(r);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (role === "Admin" && (!email || !adminId || !password)) {
      setStatus("Please enter your Email, Admin ID, and Password.");
      return;
    }

    setStatus(`Login successful as a ${role}! Redirecting to dashboard...`);
    console.log(
      `Login attempt successful for role: ${role}, email: ${email}, Admin ID: ${adminId}`
    );
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

          <button type="submit" className="signin-btn">
            Sign in
          </button>
        </form>

        {status && <div className="status-msg">{status}</div>}

        <div className="login-footer">
          Don't have an account? <a href="#">Sign up</a>
        </div>
      </div>
    </div>
  );
}
