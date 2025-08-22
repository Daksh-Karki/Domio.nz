import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css"; // Reusing Login styles
import p1 from "../assets/p1.jpg";
import { signUp } from "../firebase";

export default function SignUp() {
  const [role, setRole] = useState("Landlord");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const roles = ["Landlord", "Tenant"];

  const handleRoleClick = (r) => setRole(r);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setStatus("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      setStatus("Password must be at least 6 characters long!");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      await signUp(email, password);
      setStatus(`Account created successfully as a ${role}! Redirecting to login...`);
      
      // Redirect to login after successful signup
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (error) {
      console.error("Signup error:", error);
      setStatus(`Signup failed: ${error.message}`);
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

      {/* Right Side: Signup Form */}
      <div className="login-right">
        <div className="brand">Domio</div>
        <div className="subtitle">Create Your Account</div>

        <h2 style={{ fontWeight: "bold", marginBottom: "20px", fontSize: "1.25rem" }}>
          Sign up for your account
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

        {/* Signup Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
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

          {/* Password */}
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

          {/* Confirm Password */}
          <div className="input-group" style={{ marginBottom: "15px" }}>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ paddingLeft: "12px" }}
            />
          </div>

          <button type="submit" className="signin-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {status && <div className="status-msg">{status}</div>}

        <div className="login-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
