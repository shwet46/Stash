"use client";
import Link from "next/link";
import Button from "../ui/Button";
import { LuPhone as Phone, LuWarehouse as Warehouse, LuTrendingUp as TrendingUp, LuShield as Shield, LuArrowRight as ArrowRight } from 'react-icons/lu';
import { motion } from "framer-motion";

const stats = [
  { value: "10K+", label: "Godowns Digitized" },
  { value: "₹50Cr+", label: "Inventory Tracked" },
  { value: "22", label: "Languages Supported" },
  { value: "99.2%", label: "Voice Accuracy" },
];

export default function HeroSection() {
  return (
    <section className="hero-section" id="hero-section">
      <div className="container relative">
        <div className="hero-grid">
          {/* Left content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="hero-badge">
              <Phone size={14} />
              Voice-First AI Platform
            </div>

            <h1 className="hero-title">
              Run Your{" "}
              <span className="hero-title-highlight">
                Godown
                <svg
                  className="hero-title-svg"
                  viewBox="0 0 200 12"
                  fill="none"
                >
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    d="M2 8C30 2 80 2 100 6C120 10 170 4 198 8"
                    stroke="#D4956A"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              With Just Your Voice
            </h1>

            <p className="hero-desc">
              Manage inventory, orders, suppliers, and payments by speaking in
              Hindi, English, or Hinglish. No smartphone required. No literacy
              needed. Just call and talk.
            </p>

            <div className="hero-actions">
              <Link href="/dashboard">
                <Button size="lg" icon={<ArrowRight size={18} />}>
                  Open Dashboard
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="outline" size="lg">
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Stats row */}
            <div className="hero-stats">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="stat-card"
                >
                  <div className="stat-val">
                    {stat.value}
                  </div>
                  <div className="stat-label">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right illustration */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg-block hidden relative"
          >
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1', maxWidth: '32rem', margin: '0 auto' }}>
              {/* Main card */}
              <div style={{ position: 'absolute', inset: '2rem', backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', border: '1px solid var(--color-divider)', boxShadow: 'var(--shadow-card-hover)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '3rem', height: '3rem', backgroundColor: 'var(--color-brand-600)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Warehouse size={24} style={{ color: 'white' }} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 600, color: 'var(--color-brand-800)' }}>
                      <span className="notranslate" translate="no">Stash</span> Dashboard
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                      Real-time godown management
                    </p>
                  </div>
                </div>

                {/* Mini chart bars */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '8rem', marginBottom: '1.5rem' }}>
                  {[65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95, 68].map(
                    (h, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          borderTopLeftRadius: '0.375rem',
                          borderTopRightRadius: '0.375rem',
                          transition: 'all 0.5s',
                          height: `${h}%`,
                          backgroundColor:
                            i === 10
                              ? "#6B4226"
                              : i === 8
                              ? "#8B5E3C"
                              : "#D4956A",
                          opacity: 0.3 + (h / 100) * 0.7,
                        }}
                      />
                    )
                  )}
                </div>

                {/* Mini stat rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-divider)' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>Basmati Rice</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-success)' }}>
                      2,450 kg
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-divider)' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>Chana Dal</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-warning)' }}>
                      180 kg
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>Sugar</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-error)' }}>
                      45 kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating elements removed per user request */}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
