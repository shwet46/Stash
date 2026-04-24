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
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("ADMIN");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isNameValid = name.trim().length >= 2;
  const isPhoneValid = /^[0-9]{10}$/.test(phone);
  const isPasswordValid = password.length >= 6;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!isNameValid) {
      setError("Please enter a valid name (min 2 characters).");
      return;
    }
    if (!isPhoneValid) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!isPasswordValid) {
      setError("Password must be at least 6 characters long.");
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
              <Warehouse size={32} />
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
                  placeholder=" Rajesh Kumar"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <PhoneIcon size={16} />
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit number"
                  className="input-field"
                  required
                />
              </div>
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
                  placeholder="Min. 6 characters"
                  className="input-field has-right-icon"
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
                  className="input-field form-select"
                >
                  <option value="ADMIN">Godown Owner / Admin</option>
                  <option value="WORKER">Worker</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
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
