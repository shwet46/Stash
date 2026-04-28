"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LuWarehouse as Warehouse, 
  LuArrowRight as ArrowRight, 
  LuPhone as PhoneIcon, 
  LuLock as LockIcon, 
  LuEye as EyeIcon, 
  LuEyeOff as EyeOffIcon,
  LuTriangleAlert as AlertIcon
} from "react-icons/lu";
import StashIcon from "@/components/shared/StashIcon";

import Button from "@/components/ui/Button";
import Link from "next/link";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ phone: false, password: false });
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const isPhoneValid = /^\d{10}$/.test(phone);
  const isPasswordValid = password.length >= 6;
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
  const showPhoneError = (touched.phone || submitted) && Boolean(phoneError);
  const showPasswordError = (touched.password || submitted) && Boolean(passwordError);
  const isFormValid = isPhoneValid && isPasswordValid;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitted(true);
    if (!isFormValid) {
      setError("Please fix the highlighted fields.");
      return;
    }
    
    setLoading(true);
    try {
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
      const res = await signIn("credentials", {
        phone,
        password,
        redirect: false,
        callbackUrl,
      });

      if (res?.error || !res?.ok) {
        setError("Invalid credentials. Please try again.");
      } else {
        const target = res.url || callbackUrl;
        if (target.startsWith("http")) {
          window.location.assign(target);
        } else {
          router.replace(target);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred.");
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
            The OS for <br />
            <span className="text-gradient">
              India&apos;s Godowns.
            </span>
          </h1>
          
          <p className="auth-hero-subtitle">
            Streamline inventory, manage suppliers, and automate your supply chain with our voice-first AI platform.
          </p>

          <div className="auth-stats-grid">
            <div>
              <p className="auth-stat-value">500+</p>
              <p className="auth-stat-label">Warehouses</p>
            </div>
            <div>
              <p className="auth-stat-value">99.9%</p>
              <p className="auth-stat-label">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT SIDE: Login Form */}
      <main className="auth-split-right">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="auth-form-container"
        >
          <header className="auth-form-header">
            <h2 className="auth-form-title">Welcome Back</h2>
            <p className="auth-form-subtitle">Please enter your details to sign in.</p>
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

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label className="input-label">
                Phone Number
              </label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <PhoneIcon size={16} />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                  placeholder="10-digit phone number"
                  className={`input-field input-field--with-icon ${showPhoneError ? "input-field--error" : ""}`}
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  aria-invalid={showPhoneError}
                  aria-describedby={showPhoneError ? "login-phone-error" : "login-phone-help"}
                  required
                />
              </div>
              {showPhoneError ? (
                <p className="input-error" id="login-phone-error">
                  {phoneError}
                </p>
              ) : (
                <p className="input-helper" id="login-phone-help">
                  Use the mobile number linked to your account.
                </p>
              )}
            </div>

            <div className="input-group">
              <div className="input-label-wrapper">
                <label className="input-label">
                  Password
                </label>
                <Link href="/forgot" className="input-link">
                  Forgot Password?
                </Link>
              </div>
              <div className="input-wrapper">
                <div className="input-icon">
                  <LockIcon size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                  placeholder="••••••••"
                  className={`input-field input-field--with-icon has-right-icon ${showPasswordError ? "input-field--error" : ""}`}
                  autoComplete="current-password"
                  aria-invalid={showPasswordError}
                  aria-describedby={showPasswordError ? "login-password-error" : "login-password-help"}
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
                <p className="input-error" id="login-password-error">
                  {passwordError}
                </p>
              ) : (
                <p className="input-helper" id="login-password-help">
                  Minimum 6 characters.
                </p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading || !isFormValid} 
              className="auth-submit-btn"
            >
              {loading ? "Verifying..." : "Sign In"}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <footer className="auth-footer">
            New to Stash? 
            <Link href="/signup" className="auth-footer-link">
              Create an account
            </Link>
          </footer>
        </motion.div>
      </main>
    </div>
  );
}
