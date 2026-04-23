"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LuWarehouse as Warehouse, LuArrowRight as ArrowRight } from "react-icons/lu";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ADMIN"); // Default to ADMIN for testing
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/signup`, {
        method: "POST",
        body: JSON.stringify({
          name,
          phone,
          password,
          role,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/login?signup=success");
      } else {
        setError(data.detail || "Signup failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="auth-card"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '3rem', height: '3rem', backgroundColor: 'var(--color-brand-600)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Warehouse size={24} style={{ color: 'white' }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-brand-800)' }}>
            Create an Account
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
            Join <span className="notranslate" translate="no">Stash</span> to manage your supply chain
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--color-error)', fontSize: '0.875rem', borderRadius: '0.5rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="e.g. Rajesh Kumar"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-input"
              placeholder="e.g. 9876543210"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="form-input"
              style={{ backgroundColor: 'white' }}
            >
              <option value="ADMIN">Godown Owner (Admin)</option>
              <option value="OPERATOR">Godown Operator</option>
              <option value="WORKER">Worker</option>
            </select>
          </div>

          <Button type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }} size="lg">
            {loading ? "Creating Account..." : "Sign Up"} <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
          </Button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
            Already have an account? <Link href="/login" style={{ color: 'var(--color-brand-600)', fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
