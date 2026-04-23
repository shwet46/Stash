"use client";
import type { Metadata } from "next";
import CTASection from "@/components/marketing/CTASection";
import { LuTarget as Target, LuHeart as Heart, LuLightbulb as Lightbulb, LuGlobe as Globe } from 'react-icons/lu';
import { motion } from "framer-motion";

const values = [
  {
    icon: Target,
    title: "Accessibility First",
    description:
      "Technology should work for everyone — regardless of literacy level, smartphone access, or technical skill. Voice is the most natural interface.",
    color: "var(--color-brand-600)"
  },
  {
    icon: Heart,
    title: "Built for India",
    description:
      "Every design decision is made with India's godown operators in mind — from multilingual support to GST compliance to Hinglish voice recognition.",
    color: "var(--color-brand-500)"
  },
  {
    icon: Lightbulb,
    title: "AI That Assists",
    description:
      "Our AI augments human decision-making. Price negotiations require owner approval. Humans stay in total control.",
    color: "var(--color-brand-700)"
  },
  {
    icon: Globe,
    title: "Inclusive Growth",
    description:
      "Aligned with UN Sustainable Development Goals. We measure success in the number of small businesses we empower.",
    color: "var(--color-brand-800)"
  },
];

const teamMembers = [
  {
    name: "Shweta Behera",
    role: "Founder & Lead Developer",
    bio: "Full-stack developer passionate about building AI solutions for India's unorganized sector. Previously worked on AgriSaathi, a multimodal RAG-powered Telegram bot for farmers.",
  },
];

export default function AboutPage() {
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
              Our Story
            </span>
            <h1 className="hero-title text-gradient" style={{ marginTop: '1rem', maxWidth: '48rem', margin: '1rem auto' }}>
              Transforming India&apos;s Supply Chain With Voice AI
            </h1>
            <p className="hero-desc" style={{ maxWidth: '32rem', margin: '0 auto' }}>
              Building the voice-native operating system for India&apos;s 12 million godown operators.
            </p>
          </motion.div>

          {/* Mission */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ maxWidth: '48rem', margin: '0 auto 6rem auto' }}
          >
            <div className="glass" style={{ borderRadius: '2rem', padding: '3rem', border: '1px solid white', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-brand-900)', marginBottom: '1.5rem' }}>
                Our Mission
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <p style={{ fontSize: '1.125rem', color: 'var(--color-muted)', lineHeight: 1.7 }}>
                  Godown operations in India are still largely manual and unstructured. Operators rely on phone calls, paper registers, and memory. Existing software is too complex, resulting in low adoption.
                </p>
                <p style={{ fontSize: '1.125rem', color: 'var(--color-brand-800)', lineHeight: 1.7, fontWeight: 500 }}>
                  Stash transforms this by providing a voice-first, AI-powered platform that works through simple phone calls. No smartphone needed. No literacy required. Just call and talk.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Values */}
          <div style={{ marginBottom: '6rem' }}>
            <div className="section-header">
              <h2 className="section-title">Our Core Values</h2>
            </div>
            <div className="grid-2">
              {values.map((value, i) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="feature-card glass"
                    style={{ padding: '2rem' }}
                  >
                    <div style={{ width: '3.5rem', height: '3.5rem', backgroundColor: `${value.color}10`, borderRadius: '1rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                      <Icon size={24} style={{ color: value.color }} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-brand-900)', marginBottom: '1rem' }}>
                      {value.title}
                    </h3>
                    <p style={{ fontSize: '1rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
                      {value.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Team */}
          <div style={{ marginBottom: '6rem' }}>
            <div className="section-header">
              <h2 className="section-title">The Team</h2>
            </div>
            <div style={{ maxWidth: '32rem', margin: '0 auto' }}>
              {teamMembers.map((member, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="feature-card glass"
                  style={{ textAlign: 'center', padding: '3rem' }}
                >
                  <div style={{ width: '6rem', height: '6rem', backgroundColor: 'var(--color-brand-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', border: '4px solid white', boxShadow: 'var(--shadow-card)' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-brand-700)' }}>
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-brand-900)' }}>
                    {member.name}
                  </h3>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-brand-600)', marginTop: '0.25rem' }}>
                    {member.role}
                  </p>
                  <p style={{ fontSize: '1rem', color: 'var(--color-muted)', marginTop: '1.5rem', lineHeight: 1.7 }}>
                    {member.bio}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
