"use client";
import type { Metadata } from "next";
import TechStackSection from "@/components/marketing/TechStackSection";
import CTASection from "@/components/marketing/CTASection";
import { motion } from "framer-motion";

const architecture = [
  {
    layer: "Presentation Layer",
    description: "Next.js 14 with App Router, Custom CSS Design Tokens, Framer Motion, and Recharts.",
    color: "var(--color-brand-600)",
  },
  {
    layer: "API Layer",
    description: "FastAPI with async endpoints, NextAuth.js for authentication, and JWT-based security.",
    color: "var(--color-brand-500)",
  },
  {
    layer: "AI / ML Layer",
    description: "Gemini 3.0 Flash for NLP, Prophet for demand forecasting, and XGBoost for risk classification.",
    color: "var(--color-brand-700)",
  },
  {
    layer: "Communication Layer",
    description: "Twilio Voice for telephony, Telegram Bot API for alerts, and Google Cloud TTS for responses.",
    color: "var(--color-brand-800)",
  },
  {
    layer: "Data Layer",
    description: "PostgreSQL 16 with PostGIS, Redis for caching, and BigQuery for analytical processing.",
    color: "var(--color-brand-600)",
  },
  {
    layer: "Infrastructure Layer",
    description: "Google Cloud Run, Firebase Hosting, Cloud Pub/Sub, and GitHub Actions CI/CD.",
    color: "var(--color-brand-500)",
  },
];

export default function TechStackPage() {
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
              Architecture
            </span>
            <h1 className="hero-title text-gradient" style={{ marginTop: '1rem', maxWidth: '48rem', margin: '1rem auto' }}>
              Enterprise-Grade Tech Stack
            </h1>
            <p className="hero-desc" style={{ maxWidth: '32rem', margin: '0 auto' }}>
              Built on Google Cloud with open-source foundations for maximum reliability.
            </p>
          </motion.div>

          {/* Architecture layers */}
          <div style={{ maxWidth: '42rem', margin: '0 auto 6rem auto' }}>
            <h2 className="section-title" style={{ fontSize: '1.75rem', marginBottom: '3rem' }}>
              System Architecture
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {architecture.map((layer, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass"
                  style={{ padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid white', display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: `6px solid ${layer.color}` }}
                >
                  <div
                    style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: layer.color, color: 'white', fontWeight: 800, fontSize: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-brand-900)', marginBottom: '0.25rem' }}>
                      {layer.layer}
                    </h3>
                    <p style={{ fontSize: '0.9375rem', color: 'var(--color-muted)', lineHeight: 1.5 }}>{layer.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <TechStackSection />
      <CTASection />
    </>
  );
}
