"use client";
import Link from "next/link";
import Button from "../ui/Button";
import { LuPhone as Phone, LuWarehouse as Warehouse, LuArrowRight as ArrowRight, LuMic as Mic } from 'react-icons/lu';
import { motion } from "framer-motion";

const stats = [
  { value: "10K+", label: "Godowns Digitized" },
  { value: "₹50Cr+", label: "Inventory Tracked" },
  { value: "99.2%", label: "Voice Accuracy" },
  { value: "24/7", label: "Smart Support" },
];

export default function HeroSection() {
  return (
    <section className="hero-section bg-gradient-mesh" id="hero-section" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
      <div className="container relative">
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '30rem', height: '30rem', background: 'radial-gradient(circle, rgba(193, 132, 85, 0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', zIndex: 0 }} />
        
        <div className="hero-grid" style={{ position: 'relative', zIndex: 1 }}>
          {/* Left content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="hero-badge glass-dark" style={{ border: '1px solid var(--color-brand-200)', color: 'var(--color-brand-800)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ display: 'flex', width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: 'var(--color-success)', animation: 'pulse 2s infinite' }} />
                Voice-First AI Platform
              </div>
            </div>

            <h1 className="hero-title" style={{ marginBottom: '1.5rem' }}>
              Run Your{" "}
              <span className="hero-title-highlight text-gradient">
                Godown
                <svg
                  className="hero-title-svg"
                  viewBox="0 0 200 12"
                  fill="none"
                >
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, delay: 0.5 }}
                    d="M2 8C30 2 80 2 100 6C120 10 170 4 198 8"
                    stroke="var(--color-brand-400)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              With Just Your Voice
            </h1>

            <p className="hero-desc" style={{ fontSize: '1.25rem', marginBottom: '2.5rem' }}>
              The future of supply chain is verbal. Speak in 
              <span style={{ color: 'var(--color-brand-700)', fontWeight: 600 }}> Hindi, English, or Hinglish</span>. 
              No complex apps. Just talk to Stash and let AI handle the rest.
            </p>

            <div className="hero-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center' }}>
              <Link href="/dashboard">
                <Button size="lg" icon={<ArrowRight size={20} />}>
                  Launch Dashboard
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="outline" size="lg" style={{ backgroundColor: 'white' }}>
                  Explore Features
                </Button>
              </Link>
            </div>

            {/* Stats row */}
            <div className="hero-stats" style={{ marginTop: '4rem' }}>
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="stat-card glass"
                  style={{ border: '1px solid var(--color-brand-100)' }}
                >
                  <div className="stat-val text-gradient">
                    {stat.value}
                  </div>
                  <div className="stat-label">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right illustration */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg-block hidden relative"
          >
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1.1', maxWidth: '36rem', margin: '0 auto' }}>
              {/* Dashboard Preview Card */}
              <div className="glass" style={{ position: 'absolute', inset: '0', borderRadius: '1.5rem', padding: '2rem', border: '1px solid white', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '3.5rem', height: '3.5rem', backgroundColor: 'var(--color-brand-600)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(179, 107, 65, 0.2)' }}>
                      <Warehouse size={28} style={{ color: 'white' }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-brand-900)' }}>
                        <span className="notranslate" translate="no">Stash</span> AI
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
                        <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-muted)' }}>Listening...</p>
                      </div>
                    </div>
                  </div>
                  <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: 'var(--color-brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand-600)' }}>
                    <Mic size={20} />
                  </div>
                </div>

                {/* Visualizer Mockup */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '5rem', marginBottom: '2.5rem', justifyContent: 'center' }}>
                  {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.4, 0.9, 0.7, 0.5, 0.8, 0.6].map((v, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [`${v * 60}%`, `${v * 100}%`, `${v * 60}%`] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                      style={{ width: '6px', backgroundColor: 'var(--color-brand-500)', borderRadius: '3px' }}
                    />
                  ))}
                </div>

                {/* Content mockup */}
                <div style={{ background: 'white', borderRadius: '1.25rem', padding: '1.5rem', border: '1px solid var(--color-brand-100)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-brand-800)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Inventory Activity</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {[
                      { name: 'Sona Masoori Rice', qty: '4,500 kg', status: 'In Stock' },
                      { name: 'Refined Oil', qty: '120 tins', status: 'Low Stock' },
                      { name: 'Wheat Flour', qty: '850 kg', status: 'Ordered' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-muted)' }}>{item.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-brand-800)' }}>{item.qty}</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.625rem', borderRadius: '1rem', backgroundColor: item.status === 'Low Stock' ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-brand-50)', color: item.status === 'Low Stock' ? '#E11D48' : 'var(--color-brand-600)' }}>{item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
