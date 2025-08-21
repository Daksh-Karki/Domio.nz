import React, { useState } from "react";
import "../styles/ForgotPassword.css";
import p2 from "../assets/p2.jpg";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setStatus("Please enter your email.");
      return;
    }
    setStatus(`Password reset link sent to ${email}!`);
    console.log(`Password reset requested for: ${email}`);
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

          <button type="submit" className="reset-btn">
            Send Reset Link
          </button>
        </form>

        {status && <div className="status-msg">{status}</div>}

        <div className="forgot-footer">
          Remember your password? <a href="/login">Sign in</a>
        </div>
      </div>
    </div>
  );
}
