import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/Login.css";
import { useNavigate } from "react-router-dom";
import p2 from "../assets/p2.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    // Simulate login (no actual authentication)
    setTimeout(() => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: email,
        phone: "+64 21 123 4567",
        role: "Tenant"
      };
      
      login(userData);
      setStatus("Login successful. Redirecting to home...");
      setTimeout(() => {
        navigate("/");
      }, 1000);
      setLoading(false);
    }, 1000);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setStatus("");

    // Simulate Google login
    setTimeout(() => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@gmail.com",
        phone: "+64 21 123 4567",
        role: "Tenant"
      };
      
      login(userData);
      setStatus("Google login successful. Redirecting to home...");
      setTimeout(() => {
        navigate("/");
      }, 1000);
      setGoogleLoading(false);
    }, 1000);
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
      {/* Left Side Image */}
      <div className="login-left">
        <img src={p2} alt="Modern property" />
      </div>

      {/* Right Side Form */}
      <div className="login-right">
        <button 
          onClick={() => navigate("/")} 
          className="close-btn"
          aria-label="Close"
        >
          ×
        </button>
        <div className="brand">DOMIIO.NZ</div>
        <div className="subtitle">Welcome back!</div>

        <h2 style={{ fontWeight: "bold", marginBottom: "20px", fontSize: "1.25rem" }}>
          Sign in to your account
        </h2>

        {/* Google Sign In Button */}
        <button 
          onClick={handleGoogleSignIn} 
          className="google-signin-btn" 
          disabled={googleLoading}
          style={{ marginBottom: "20px", width: "100%" }}
        >
          {googleLoading ? (
            <div className="loading-spinner"></div>
          ) : (
            <>
              <svg className="google-icon" viewBox="0 0 24 24" style={{ width: "20px", height: "20px", marginRight: "8px" }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <div className="divider" style={{ margin: "20px 0", textAlign: "center", color: "#666" }}>
          <span>or</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-options" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <label className="remember-me" style={{ display: "flex", alignItems: "center" }}>
              <input type="checkbox" style={{ marginRight: "8px" }} />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" style={{ color: "#6366f1", textDecoration: "none" }}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {status && <div className="status-msg">{status}</div>}

        <div className="login-footer">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
      </div>
    </div>
  );
}