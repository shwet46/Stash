"use client";
import { LuMic as Mic, LuBrain as Brain, LuUsers as Users, LuReceipt as Receipt, LuMessageSquare as MessageSquare, LuGlobe as Globe } from 'react-icons/lu';
import { motion } from "framer-motion";

const features = [
  {
    icon: Mic,
    title: "Voice-First Operations",
    description: "Manage everything using simple multilingual voice commands. No apps or typing required.",
    accent: "var(--color-brand-600)",
  },
  {
    icon: Brain,
    title: "AI Stock Intelligence",
    description: "Predict demand 14 days ahead and optimize reordering using advanced ML models.",
    accent: "var(--color-brand-500)",
  },
  {
    icon: Users,
    title: "Supplier Automation",
    description: "Automatically coordinate with primary and backup suppliers via automated calls.",
    accent: "var(--color-brand-700)",
  },
  {
    icon: Receipt,
    title: "Smart Billing",
    description: "Auto-generate GST invoices and track buyer credit with automated Telegram reminders.",
    accent: "var(--color-brand-800)",
  },
  {
    icon: MessageSquare,
    title: "AI Negotiation",
    description: "Smart 4-tier price negotiation strategies that maintain your margins automatically.",
    accent: "var(--color-brand-600)",
  },
  {
    icon: Globe,
    title: "22 Language Support",
    description: "Interface and voice processing in all major Indian languages for total accessibility.",
    accent: "var(--color-brand-500)",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="section bg-gradient-mesh" id="features-grid">
      <div className="container">
        <div className="section-header">
          <span className="section-badge glass-dark">
            Capabilities
          </span>
          <h2 className="section-title text-gradient">
            Powerful Features for Modern Godowns
          </h2>
          <p className="section-desc">
            Everything you need to digitize your operations without changing how you work.
          </p>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } },
            hidden: {}
          }}
          className="grid-3"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                }}
                className="feature-card glass"
                style={{ position: 'relative', overflow: 'hidden', padding: '2.5rem 2rem' }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', backgroundColor: feature.accent }} />
                <div
                  className="feature-icon-wrapper"
                  style={{ backgroundColor: `${feature.accent}15`, borderRadius: '1rem', width: '3.5rem', height: '3.5rem', marginBottom: '1.5rem' }}
                >
                  <Icon size={26} style={{ color: feature.accent }} />
                </div>
                <h3 className="feature-title" style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-brand-900)' }}>
                  {feature.title}
                </h3>
                <p className="feature-desc" style={{ fontSize: '1rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
