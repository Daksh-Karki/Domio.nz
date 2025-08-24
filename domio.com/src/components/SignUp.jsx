import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "../firebase";
import "../styles/SignUp.css";
import bgImage from "../assets/p3.jpg";

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

  // Step 3
  const [idFile, setIdFile] = useState(null);

  // General
  const [role, setRole] = useState("Landlord");
  const [loading, setLoading] = useState(false);
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
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idFile) {
      setFieldErrors({ idFile: "Please upload a valid ID!" });
      return;
    }

    setLoading(true);
    setFieldErrors({});

    try {
      await signUp(email, password);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setFieldErrors({ general: `Signup failed: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="login-right">
        <div className="brand">Domio</div>
        <div className="subtitle">Create Your Account</div>

        <form onSubmit={handleSubmit}>
          {/* Step 1 */}
          {step === 1 && (
            <>
              <h2 className="step-header">Step 1: Tell us about yourself</h2>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, firstName: "" }));
                  }}
                  className={fieldErrors.firstName ? "input-error" : ""}
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
                  className={fieldErrors.surname ? "input-error" : ""}
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
                  className={fieldErrors.dob ? "input-error" : ""}
                  required
                />
                {fieldErrors.dob && <div className="field-error">{fieldErrors.dob}</div>}
              </div>
              <button type="button" onClick={nextStep} className="signin-btn">
                Next
              </button>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <h2 className="step-header">Step 2: Create your account</h2>

              <div className="input-group">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  className={fieldErrors.email ? "input-error" : ""}
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
                  className={fieldErrors.password ? "input-error" : ""}
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
                  className={fieldErrors.confirmPassword ? "input-error" : ""}
                  required
                />
                {fieldErrors.confirmPassword && <div className="field-error">{fieldErrors.confirmPassword}</div>}
              </div>

              <div className="form-navigation">
                <button type="button" onClick={prevStep} className="signin-btn secondary">
                  Back
                </button>
                <button type="button" onClick={nextStep} className="signin-btn">
                  Next
                </button>
              </div>
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <>
              <h2 className="step-header">Step 3: Verify your identity</h2>
              <p className="instructions">
                To complete your registration, please upload a clear image of a valid
                government-issued ID (e.g., Driver's License, Passport).
              </p>
              <div className="input-group">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    setIdFile(e.target.files[0]);
                    setFieldErrors((prev) => ({ ...prev, idFile: "" }));
                  }}
                  className={fieldErrors.idFile ? "input-error" : ""}
                  required
                />
                {fieldErrors.idFile && <div className="field-error">{fieldErrors.idFile}</div>}
              </div>
              <div className="form-navigation">
                <button type="button" onClick={prevStep} className="signin-btn secondary">
                  Back
                </button>
                <button type="submit" className="signin-btn" disabled={loading}>
                  {loading ? "Creating Account..." : "Submit"}
                </button>
              </div>
            </>
          )}
        </form>

        {fieldErrors.general && <div className="field-error">{fieldErrors.general}</div>}

        <div className="login-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
