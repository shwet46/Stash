"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LuWarehouse as Warehouse, LuArrowRight as ArrowRight } from "react-icons/lu";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      phone,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid phone number or password");
    } else {
      router.push("/dashboard");
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
            Welcome to <span className="notranslate" translate="no">Stash</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
            Sign in to manage your godown operations
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--color-error)', fontSize: '0.875rem', borderRadius: '0.5rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">
              Phone Number or Username
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-input"
              placeholder="e.g. admin or user"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" style={{ width: '100%', justifyContent: 'center' }} size="lg">
            Sign In <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
          </Button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-divider)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
            Don't have an account? <Link href="/signup" style={{ color: 'var(--color-brand-600)', fontWeight: 600 }}>Create Account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
