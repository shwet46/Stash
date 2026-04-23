"use client";
import type { Metadata } from "next";
import FeaturesGrid from "@/components/marketing/FeaturesGrid";
import CTASection from "@/components/marketing/CTASection";
import { motion } from "framer-motion";

const detailedFeatures = [
  {
    title: "Voice-First Operations",
    description:
      "The entire system runs over phone calls. Operators manage inventory, orders, and tasks using simple multilingual voice commands. No app installation, no internet on the operator's end, no literacy requirement.",
    highlights: [
      "Hindi, English, and Hinglish support",
      "Feature phone compatible",
      "30-second average interaction time",
      "Natural language understanding via Gemini 3.0 Flash",
    ],
    color: "var(--color-brand-600)"
  },
  {
    title: "Smart Inventory Management",
    description:
      "Real-time stock tracking with voice-based updates. When an operator says 'Chana Dal 500 kg aaya hai', the system automatically updates inventory, checks expiry dates, and flags any discrepancies.",
    highlights: [
      "Voice-based stock entry and correction",
      "Automatic discrepancy detection",
      "Expiry date tracking",
      "Multi-warehouse consolidated view",
    ],
    color: "var(--color-brand-500)"
  },
  {
    title: "AI Stock Intelligence",
    description:
      "Prophet models forecast demand 14 days ahead. XGBoost classifies disruption risk based on weather data, seasonal patterns, and historical trends. Auto-reorder when stock hits threshold.",
    highlights: [
      "14-day demand forecasting",
      "Disruption risk classification",
      "Weather-aware predictions",
      "Automatic supplier outreach",
    ],
    color: "var(--color-brand-700)"
  },
  {
    title: "Supplier Automation",
    description:
      "Automated voice calls to suppliers for price checks, availability, and order placement. Priority-based supplier chains ensure the best supplier is contacted first, with automatic fallback.",
    highlights: [
      "Priority-based supplier selection",
      "Automated outbound calls via Twilio",
      "Price negotiation strategy",
      "Supplier performance tracking",
    ],
    color: "var(--color-brand-800)"
  },
];

export default function FeaturesPage() {
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
              Capabilities
            </span>
            <h1 className="hero-title text-gradient" style={{ marginTop: '1rem', maxWidth: '48rem', margin: '1rem auto' }}>
              Powerful Features for Modern Godowns
            </h1>
            <p className="hero-desc" style={{ maxWidth: '32rem', margin: '0 auto' }}>
              Every feature designed for voice-first interaction and zero learning curve.
            </p>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {detailedFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass"
                style={{
                  padding: '3rem',
                  borderRadius: '2rem',
                  border: '1px solid white',
                  borderLeft: `6px solid ${feature.color}`,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div className="grid-2" style={{ gap: '3rem', alignItems: 'start' }}>
                  <div style={{ flex: 2 }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-brand-900)', marginBottom: '1.5rem' }}>
                      {feature.title}
                    </h2>
                    <p style={{ fontSize: '1.125rem', color: 'var(--color-muted)', lineHeight: 1.7 }}>
                      {feature.description}
                    </p>
                  </div>
                  <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.4)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid white' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-brand-600)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>
                      Key Highlights
                    </h4>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {feature.highlights.map((h, j) => (
                        <li
                          key={j}
                          style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', fontSize: '0.9375rem', color: 'var(--color-brand-800)', fontWeight: 500 }}
                        >
                          <span style={{ width: '0.5rem', height: '0.5rem', backgroundColor: feature.color, borderRadius: '50%', marginTop: '0.375rem', flexShrink: 0 }} />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FeaturesGrid />
      <CTASection />
    </>
  );
}
