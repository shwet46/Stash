"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LuWarehouse as Warehouse, 
  LuArrowRight as ArrowRight, 
  LuUser as UserIcon, 
  LuPhone as PhoneIcon, 
  LuLock as LockIcon, 
  LuShieldCheck as ShieldIcon, 
  LuEye as EyeIcon, 
  LuEyeOff as EyeOffIcon,
  LuTriangleAlert as AlertIcon
} from "react-icons/lu";
import StashIcon from "@/components/shared/StashIcon";

import Button from "@/components/ui/Button";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ name: false, phone: false, password: false, role: false });
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const isNameValid = name.trim().length >= 2;
  const isPhoneValid = /^[0-9]{10}$/.test(phone);
  const isPasswordValid = password.length >= 6;
  const isRoleValid = role === "ADMIN" || role === "WORKER";
  const nameError = !name
    ? "Full name is required."
    : !isNameValid
    ? "Name must be at least 2 characters."
    : "";
  const phoneError = !phone
    ? "Phone number is required."
    : !isPhoneValid
    ? "Enter a valid 10-digit phone number."
    : "";
  const passwordError = !password
    ? "Password is required."
    : !isPasswordValid
    ? "Password must be at least 6 characters."
    : "";
  const roleError = !role
    ? "Select a role to continue."
    : !isRoleValid
    ? "Please select a valid role."
    : "";
  const showNameError = (touched.name || submitted) && Boolean(nameError);
  const showPhoneError = (touched.phone || submitted) && Boolean(phoneError);
  const showPasswordError = (touched.password || submitted) && Boolean(passwordError);
  const showRoleError = (touched.role || submitted) && Boolean(roleError);
  const isFormValid = isNameValid && isPhoneValid && isPasswordValid && isRoleValid;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitted(true);
    
    if (!isFormValid) {
      setError("Please fix the highlighted fields.");
      return;
    }
    
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/signup`, {
        method: "POST",
        body: JSON.stringify({ name, phone, password, role }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/login?signup=success");
      } else {
        setError(data.detail || "Signup failed.");
      }
    } catch (err) {
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-wrapper">
      
      {/* LEFT SIDE: Brand & Value Prop */}
      <section className="auth-split-left">
        <div className="auth-left-content">
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <StashIcon size={40} />
            </div>
            <span className="auth-brand-text">STASH</span>
          </div>

          <h1 className="auth-hero-title">
            Join the Digital <br />
            <span className="text-gradient">
              Supply Chain.
            </span>
          </h1>
          
          <p className="auth-hero-subtitle">
            Manage your inventory with AI-powered voice commands and real-time automation.
          </p>

          <div className="auth-stats-grid">
            <div>
              <p className="auth-stat-value">Voice-Native</p>
              <p className="auth-stat-label">Interface</p>
            </div>
            <div>
              <p className="auth-stat-value">AI-Driven</p>
              <p className="auth-stat-label">Automation</p>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT SIDE: Signup Form */}
      <main className="auth-split-right">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="auth-form-container"
        >
          <header className="auth-form-header">
            <h2 className="auth-form-title">Create Account</h2>
            <p className="auth-form-subtitle">Join 500+ godowns across India.</p>
          </header>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="alert-box"
              >
                <AlertIcon size={18} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSignup}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <UserIcon size={16} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                  placeholder="Rajesh Kumar"
                  className={`input-field input-field--with-icon ${showNameError ? "input-field--error" : ""}`}
                  autoComplete="name"
                  aria-invalid={showNameError}
                  aria-describedby={showNameError ? "signup-name-error" : "signup-name-help"}
                  required
                />
              </div>
              {showNameError ? (
                <p className="input-error" id="signup-name-error">
                  {nameError}
                </p>
              ) : (
                <p className="input-helper" id="signup-name-help">
                  Use the full name for your account.
                </p>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <PhoneIcon size={16} />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                  placeholder="10-digit number"
                  className={`input-field input-field--with-icon ${showPhoneError ? "input-field--error" : ""}`}
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="tel"
                  aria-invalid={showPhoneError}
                  aria-describedby={showPhoneError ? "signup-phone-error" : "signup-phone-help"}
                  required
                />
              </div>
              {showPhoneError ? (
                <p className="input-error" id="signup-phone-error">
                  {phoneError}
                </p>
              ) : (
                <p className="input-helper" id="signup-phone-help">
                  We will verify this number on first login.
                </p>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <LockIcon size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                  placeholder="Min. 6 characters"
                  className={`input-field input-field--with-icon has-right-icon ${showPasswordError ? "input-field--error" : ""}`}
                  autoComplete="new-password"
                  aria-invalid={showPasswordError}
                  aria-describedby={showPasswordError ? "signup-password-error" : "signup-password-help"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="input-right-icon"
                >
                  {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
              {showPasswordError ? (
                <p className="input-error" id="signup-password-error">
                  {passwordError}
                </p>
              ) : (
                <p className="input-helper" id="signup-password-help">
                  Use at least 6 characters.
                </p>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">Account Role</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <ShieldIcon size={16} />
                </div>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, role: true }))}
                  className={`input-field input-field--with-icon form-select ${showRoleError ? "input-field--error" : ""}`}
                  aria-invalid={showRoleError}
                  aria-describedby={showRoleError ? "signup-role-error" : "signup-role-help"}
                  required
                >
                  <option value="" disabled>
                    Select a role
                  </option>
                  <option value="ADMIN">Godown Owner / Admin</option>
                  <option value="WORKER">Worker</option>
                </select>
              </div>
              {showRoleError ? (
                <p className="input-error" id="signup-role-error">
                  {roleError}
                </p>
              ) : (
                <p className="input-helper" id="signup-role-help">
                  Choose the access level for this account.
                </p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading || !isFormValid} 
              className="auth-submit-btn"
            >
              {loading ? "Creating Account..." : "Sign Up"}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <footer className="auth-footer">
            Already have an account? 
            <Link href="/login" className="auth-footer-link">
              Sign In
            </Link>
          </footer>
        </motion.div>
      </main>
    </div>
  );
}
