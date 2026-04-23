"use client";
import type { Metadata } from "next";
import HowItWorksSection from "@/components/marketing/HowItWorksSection";
import CTASection from "@/components/marketing/CTASection";
import { motion } from "framer-motion";
import { LuMic as Mic, LuTerminal as Terminal } from 'react-icons/lu';

const voiceExamples = [
  {
    transcript: '"Chana Dal 500 kg aaya hai, lot number 2847"',
    language: "Hinglish",
    intent: "Stock Arrival",
    action: "Inventory updated: Chana Dal +500 kg, Lot #2847 recorded",
  },
  {
    transcript: '"Ramesh bhai ka order kya status hai?"',
    language: "Hindi",
    intent: "Order Status",
    action: "Order #STH-4821 for Ramesh: 200 kg Rice, dispatched, ETA tomorrow",
  },
  {
    transcript: '"Sugar ka stock kitna bacha hai?"',
    language: "Hinglish",
    intent: "Stock Query",
    action: "Current stock: Sugar 45 kg (below threshold 100 kg). Auto-reorder triggered.",
  },
  {
    transcript: '"Place order for 1000 kg wheat flour"',
    language: "English",
    intent: "Order Placed",
    action: "Order created. Calling Supplier: Anand Trading Co.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="section bg-gradient-mesh" style={{ paddingTop: '8rem' }}>
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
            style={{ marginBottom: '5rem' }}
          >
            <span className="section-badge glass-dark">
              The Process
            </span>
            <h1 className="hero-title text-gradient" style={{ marginTop: '1rem', maxWidth: '48rem', margin: '1rem auto' }}>
              From Voice to Action in Seconds
            </h1>
            <p className="hero-desc" style={{ maxWidth: '32rem', margin: '0 auto' }}>
              See how a simple phone call powers an entire supply chain operation.
            </p>
          </motion.div>
        </div>
      </section>

      <HowItWorksSection />

      {/* Voice Examples */}
      <section className="section bg-white">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Voice Command Examples</h2>
            <p className="section-desc">
              Real examples of how operators interact with Stash using natural voice commands.
            </p>
          </div>

          <div className="grid-2">
            {voiceExamples.map((ex, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="feature-card glass"
                style={{ padding: '2rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.25rem 0.625rem', borderRadius: '1rem', backgroundColor: 'var(--color-brand-100)', color: 'var(--color-brand-700)', textTransform: 'uppercase' }}>
                    {ex.language}
                  </span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.25rem 0.625rem', borderRadius: '1rem', backgroundColor: 'var(--color-brand-50)', color: 'var(--color-brand-500)', textTransform: 'uppercase' }}>
                    {ex.intent}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: 'var(--color-brand-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mic size={18} style={{ color: 'white' }} />
                  </div>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-brand-900)', fontStyle: 'italic', lineHeight: 1.4 }}>
                    {ex.transcript}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', backgroundColor: 'var(--color-brand-50)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid var(--color-brand-100)' }}>
                  <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Terminal size={14} style={{ color: 'var(--color-brand-600)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-brand-700)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>System Action</p>
                    <p style={{ fontSize: '0.9375rem', color: 'var(--color-brand-800)', fontWeight: 500 }}>{ex.action}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
