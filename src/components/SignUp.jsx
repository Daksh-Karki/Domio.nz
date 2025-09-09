import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUpWithEmail, signInWithGoogle } from "../firebase/auth.js";
import "../styles/SignUP.css";
import p3 from "../assets/p3.jpg";
import { useAuth } from "../context/AuthContext";

export default function SignUp() {
  const [step, setStep] = useState(1);

  // Step 1
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // General
  const [role, setRole] = useState("Tenant");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if user is already logged in
  React.useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const roles = ["Tenant", "Landlord"];

  // Password strength helper
  const getPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;

    if (strength <= 1) return "Weak";
    if (strength === 2 || strength === 3) return "Medium";
    if (strength === 4) return "Strong";
  };

  // Password validation
  const validatePassword = (pass) => {
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);
    const hasUpper = /[A-Z]/.test(pass);
    return pass.length >= 6 && hasNumber && hasSpecial && hasUpper;
  };

  const nextStep = () => {
    if (step < 2) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const validateStep1 = () => {
    const errors = {};
    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";
    if (!username.trim()) errors.username = "Username is required";
    if (!phone.trim()) errors.phone = "Phone number is required";
    
    // Username validation
    if (username.trim() && !/^[a-zA-Z0-9_]{3,20}$/.test(username.trim())) {
      errors.username = "Username must be 3-20 characters, letters, numbers, and underscores only";
    }
    
    return errors;
  };

  const validateStep2 = () => {
    const errors = {};
    if (!email.trim()) errors.email = "Email is required";
    if (!validatePassword(password)) {
      errors.password = "Password must be at least 6 characters with uppercase, number, and special character";
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    return errors;
  };

  const handleNextStep = () => {
    const errors = validateStep1();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    nextStep();
  };

  const handleSubmit = async () => {
    const errors = validateStep2();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setFieldErrors({});

    try {
      const userData = {
        firstName,
        lastName,
        username: username.trim().toLowerCase(),
        email,
        phone,
        role: role.toLowerCase(),
        about: 'I am a responsible tenant looking for a comfortable place to call home.'
      };

      const result = await signUpWithEmail(email, password, userData);
      
      if (result.success) {
        setFieldErrors({ general: "Account created successfully! Redirecting..." });
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setFieldErrors({ general: `Signup failed: ${result.error}` });
      }
    } catch (error) {
      setFieldErrors({ general: `An error occurred: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setFieldErrors({});

    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        setFieldErrors({ general: "Google signup successful! Redirecting..." });
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setFieldErrors({ general: `Google signup failed: ${result.error}` });
      }
    } catch (error) {
      setFieldErrors({ general: `An error occurred: ${error.message}` });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="signup-page-wrapper">
      <div className="signup-container">
      {/* Left Side Image */}
      <div className="signup-left">
        <img src={p3} alt="Beautiful property" />
      </div>

      {/* Right Side Form */}
      <div className="signup-right">
        <button 
          onClick={() => navigate("/")} 
          className="close-btn"
          aria-label="Close"
        >
          ×
        </button>
        <div className="brand">DOMIO.NZ</div>
        <div className="subtitle">Join us today!</div>

        <h2 style={{ fontWeight: "bold", marginBottom: "20px", fontSize: "1.25rem" }}>
          Create your account
        </h2>

        {/* Google Sign Up Button */}
        <button 
          onClick={handleGoogleSignUp} 
          className="google-signup-btn" 
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

        {/* Multi-step form */}
        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
            <div style={{ marginBottom: "15px", color: "#666", fontSize: "14px" }}>
              Step 1 of 2: Personal Information
            </div>
            
            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <div className="input-group" style={{ flex: 1 }}>
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                {fieldErrors.firstName && <span className="field-error">{fieldErrors.firstName}</span>}
              </div>

              <div className="input-group" style={{ flex: 1 }}>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
                {fieldErrors.lastName && <span className="field-error">{fieldErrors.lastName}</span>}
              </div>
            </div>

            <div className="input-group">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
            </div>

            <div className="input-group">
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
            </div>

            <div className="input-group">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "6px" }}
              >
                {roles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="signup-btn">
              Next Step
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div style={{ marginBottom: "15px", color: "#666", fontSize: "14px" }}>
              Step 2 of 2: Account Details
            </div>

            <div className="input-group">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
            </div>

            <div className="input-group">
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    position: "absolute", 
                    right: "10px", 
                    top: "50%", 
                    transform: "translateY(-50%)", 
                    background: "none", 
                    border: "none", 
                    color: "#666", 
                    cursor: "pointer" 
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {password && (
                <div style={{ 
                  fontSize: "12px", 
                  marginTop: "5px", 
                  color: getPasswordStrength(password) === "Strong" ? "#22c55e" : 
                         getPasswordStrength(password) === "Medium" ? "#f59e0b" : "#ef4444" 
                }}>
                  Strength: {getPasswordStrength(password)}
                </div>
              )}
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
            </div>

            <div className="button-group">
              <button 
                type="button" 
                onClick={prevStep} 
                className="back-btn"
              >
                Back
              </button>
              <button 
                type="submit" 
                className="signup-btn primary" 
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>
        )}

        {fieldErrors.general && <div className="status-msg">{fieldErrors.general}</div>}

        <div className="signup-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
      </div>
    </div>
  );
}