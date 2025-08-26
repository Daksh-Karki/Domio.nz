import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Login.css";
import { signIn, signInWithGoogle, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      console.log("Login: Attempting to sign in with email:", email);
      const userCredential = await signIn(email, password);
      console.log("Login: Sign in successful, user:", userCredential.user.email);
      
      // Force a refresh of the auth state
      await userCredential.user.reload();
      
      setStatus(`Login successful. Redirecting to home...`);
      // Reduced timeout to ensure faster redirect
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      setStatus(`Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setStatus("");

    try {
      console.log("Login: Attempting Google sign in");
      const userCredential = await signInWithGoogle();
      console.log("Login: Google sign in successful, user:", userCredential.user.email);
      
      // Force a refresh of the auth state
      await userCredential.user.reload();
      
      setStatus(`Google login successful. Redirecting to home...`);
      // Reduced timeout to ensure faster redirect
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("Google login error:", error);
      setStatus(`Google login failed: ${error.message}`);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Auckland City Night Background */}
      <div className="city-background">
        <div className="night-sky"></div>
        <div className="city-skyline">
          <div className="building building-1"></div>
          <div className="building building-2"></div>
          <div className="building building-3"></div>
          <div className="building building-4"></div>
          <div className="building building-5"></div>
        </div>
        <div className="stars">
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
        </div>
      </div>

      {/* Login Form */}
      <div className="login-container">
        <div className="form-header">
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">Welcome back to Domio</p>
        </div>

        {/* Google Sign In Button */}
        <div className="google-signin-section">
          <button 
            onClick={handleGoogleSignIn} 
            className="google-signin-btn" 
            disabled={googleLoading}
          >
            {googleLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>
          
          <div className="divider">
            <span>or</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" className="checkbox" />
              <span className="label-text">Remember me</span>
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {status && <div className="status-message">{status}</div>}

        <div className="create-account">
          <Link to="/signup">Create Account</Link>
        </div>
      </div>
    </div>
  );
}