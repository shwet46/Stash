"use client";
import { LuPhone as Phone, LuBrain as Brain, LuZap as Zap, LuCheck as CheckCircle } from 'react-icons/lu';
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: Phone,
    title: "Call Stash",
    description: "Dial the Stash number. No app, login, or internet needed on your end. Works from any phone.",
    details: ["Feature phone support", "Caller recognition", "Hindi/English/Hinglish"]
  },
  {
    number: "02",
    icon: Brain,
    title: "AI Analysis",
    description: "Gemini 3.0 Flash extracts intent and products from your speech in real-time.",
    details: ["Real-time transcription", "Intent extraction", "Entity detection"]
  },
  {
    number: "03",
    icon: Zap,
    title: "Instant Action",
    description: "Stash updates inventory, places orders, or triggers supplier calls automatically.",
    details: ["Live inventory sync", "Auto-order creation", "Supplier coordination"]
  },
  {
    number: "04",
    icon: CheckCircle,
    title: "Confirmation",
    description: "Hear a voice confirmation on the call and receive Telegram updates instantly.",
    details: ["Multilingual voice confirmation", "Telegram alerts", "Dashboard sync"]
  },
];

export default function HowItWorksSection() {
  return (
    <section className="section bg-gradient-mesh" id="how-it-works-section" style={{ backgroundColor: 'var(--color-brand-50)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-badge glass-dark">
            The Workflow
          </span>
          <h2 className="section-title text-gradient">
            From Voice to Action in Seconds
          </h2>
          <p className="section-desc">
            Experience the simplicity of India&apos;s first voice-native godown platform.
          </p>
        </div>

        <div style={{ position: 'relative', marginTop: '4rem' }}>
          {/* Main timeline line */}
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '4px', background: 'linear-gradient(to bottom, var(--color-brand-200), var(--color-brand-500), var(--color-brand-200))', transform: 'translateX(-50%)', borderRadius: '2px', opacity: 0.3 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                  key={i}
                  style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: isEven ? 'flex-start' : 'flex-end' }}
                >
                  {/* Timeline dot */}
                  <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '4rem', height: '4rem', backgroundColor: 'white', border: '4px solid var(--color-brand-500)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, boxShadow: '0 0 20px rgba(179, 107, 65, 0.2)' }}>
                    <span style={{ color: 'var(--color-brand-700)', fontWeight: 800, fontSize: '1.25rem' }}>
                      {step.number}
                    </span>
                  </div>

                  {/* Content Card */}
                  <div
                    className="feature-card glass"
                    style={{ width: '42%', padding: '2rem', borderRadius: '1.5rem' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div style={{ width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand-600)' }}>
                        <Icon size={32} />
                      </div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-brand-900)' }}>
                        {step.title}
                      </h3>
                    </div>
                    <p style={{ fontSize: '1.0625rem', color: 'var(--color-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                      {step.description}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {step.details.map((detail, j) => (
                        <span
                          key={j}
                          style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem', borderRadius: '2rem', backgroundColor: 'var(--color-brand-100)', color: 'var(--color-brand-800)', fontWeight: 600 }}
                        >
                          {detail}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
