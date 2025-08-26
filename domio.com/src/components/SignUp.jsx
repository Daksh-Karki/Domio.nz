import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp, signInWithGoogle } from "../firebase";
import "../styles/SignUp.css";

export default function SignUp() {
  const [step, setStep] = useState(1);

  // Step 1
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [dob, setDob] = useState("");

  // Step 2
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // General
  const [role, setRole] = useState("Landlord");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const roles = ["Landlord", "Tenant"];

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
    const errors = {};

    if (step === 1) {
      if (!firstName) errors.firstName = "First name is required";
      if (!surname) errors.surname = "Surname is required";
      if (!dob) errors.dob = "Date of birth is required";
    }

    if (step === 2) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) errors.email = "Email is required";
      else if (!emailPattern.test(email)) errors.email = "Invalid email address";

      if (!password) errors.password = "Password is required";
      else if (!validatePassword(password))
        errors.password =
          "Password must be 6+ chars, include uppercase, number, special char";

      if (!confirmPassword) errors.confirmPassword = "Confirm your password";
      else if (password !== confirmPassword)
        errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      if (step === 2) {
        handleSubmit();
      } else {
        setStep((prev) => prev + 1);
      }
    }
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setFieldErrors({});

    try {
      await signUp(email, password);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      setFieldErrors({ general: `Signup failed: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setFieldErrors({});

    try {
      await signInWithGoogle();
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      setFieldErrors({ general: `Google signup failed: ${error.message}` });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="signup-page">
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

      {/* SignUp Form */}
      <div className="signup-container">
        <div className="form-header">
          <h1 className="signup-title">Create Account</h1>
          <p className="signup-subtitle">Join Domio today</p>
        </div>

        {/* Google Sign Up Button */}
        <div className="google-signup-section">
          <button 
            onClick={handleGoogleSignUp} 
            className="google-signup-btn" 
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

        <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="signup-form">
          {/* Step 1 */}
          {step === 1 && (
            <>
              <h2 className="step-header">Tell us about yourself</h2>
              
              <div className="input-group">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, firstName: "" }));
                  }}
                  className={`form-input ${fieldErrors.firstName ? "input-error" : ""}`}
                  required
                />
                {fieldErrors.firstName && <div className="field-error">{fieldErrors.firstName}</div>}
              </div>

              <div className="input-group">
                <input
                  type="text"
                  placeholder="Surname"
                  value={surname}
                  onChange={(e) => {
                    setSurname(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, surname: "" }));
                  }}
                  className={`form-input ${fieldErrors.surname ? "input-error" : ""}`}
                  required
                />
                {fieldErrors.surname && <div className="field-error">{fieldErrors.surname}</div>}
              </div>

              <div className="input-group">
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => {
                    setDob(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, dob: "" }));
                  }}
                  className={`form-input ${fieldErrors.dob ? "input-error" : ""}`}
                  required
                />
                {fieldErrors.dob && <div className="field-error">{fieldErrors.dob}</div>}
              </div>

              <button type="button" onClick={nextStep} className="signup-button">
                Next
              </button>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <h2 className="step-header">Create your account</h2>

              <div className="input-group">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  className={`form-input ${fieldErrors.email ? "input-error" : ""}`}
                  required
                />
                {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
              </div>

              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  className={`form-input ${fieldErrors.password ? "input-error" : ""}`}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

                {/* Password Requirements */}
                <div className="password-requirements">
                  <div className={password.length >= 6 ? "requirement valid" : "requirement"}>
                    Minimum 6 characters
                  </div>
                  <div className={/[A-Z]/.test(password) ? "requirement valid" : "requirement"}>
                    At least 1 uppercase letter
                  </div>
                  <div className={/[0-9]/.test(password) ? "requirement valid" : "requirement"}>
                    At least 1 number
                  </div>
                  <div className={/[^A-Za-z0-9]/.test(password) ? "requirement valid" : "requirement"}>
                    At least 1 special character
                  </div>
                </div>

                {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
              </div>

              <div className="input-group">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }}
                  className={`form-input ${fieldErrors.confirmPassword ? "input-error" : ""}`}
                  required
                />
                {fieldErrors.confirmPassword && <div className="field-error">{fieldErrors.confirmPassword}</div>}
              </div>

              <div className="form-navigation">
                <button type="button" onClick={prevStep} className="signup-button secondary">
                  Back
                </button>
                <button type="button" onClick={nextStep} className="signup-button">
                  Create Account
                </button>
              </div>
            </>
          )}
        </form>

        {fieldErrors.general && <div className="field-error">{fieldErrors.general}</div>}

        <div className="signup-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
