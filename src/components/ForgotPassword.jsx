import React, { useState } from "react";
import "../styles/ForgotPassword.css";
import p1 from "../assets/p1.jpg";
import { Link, useNavigate } from "react-router-dom";
import { sendPasswordReset } from "../firebase/auth.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setStatus("Please enter your email.");
      return;
    }
    
    setLoading(true);
    setStatus("");
    
    try {
      const result = await sendPasswordReset(email);
      
      if (result.success) {
        setStatus(`Password reset link sent to ${email}! Check your email and follow the instructions to reset your password.`);
      } else {
        setStatus(`Error: ${result.error}`);
      }
    } catch (error) {
      setStatus(`An error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page-wrapper">
      <div className="forgot-container">
      {/* Left Side Image */}
      <div className="forgot-left">
        <img src={p1} alt="Modern house" />
      </div>

      {/* Right Side Form */}
      <div className="forgot-right">
        <button 
          onClick={() => navigate("/")} 
          className="close-btn"
          aria-label="Close"
        >
          ×
        </button>
        <div className="brand">DOMIO.NZ</div>
        <div className="subtitle">Reset your password</div>

        <h2 style={{ fontWeight: "bold", marginBottom: "20px", fontSize: "1.25rem" }}>
          Enter your email to receive a reset link
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="reset-btn" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {status && <div className="status-msg">{status}</div>}

        <div className="forgot-footer">
          Remember your password? <Link to="/login">Sign in</Link>
        </div>
      </div>
      </div>
    </div>
  );
}
