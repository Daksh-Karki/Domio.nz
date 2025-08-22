import React, { useState } from "react";
import "../styles/ForgotPassword.css";
import p2 from "../assets/p2.jpg";
import { resetPassword } from "../firebase";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setStatus("Please enter your email.");
      return;
    }
    
    setLoading(true);
    setStatus("");
    
    try {
      await resetPassword(email);
      setStatus(`Password reset link sent to ${email}! Check your email.`);
    } catch (error) {
      console.error("Password reset error:", error);
      setStatus(`Password reset failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      {/* Left Side Image */}
      <div className="forgot-left">
        <img src={p2} alt="Modern house" />
      </div>

      {/* Right Side Form */}
      <div className="forgot-right">
        <div className="brand">Domio</div>
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
  );
}
