"use client";
import { LuMic as Mic, LuPackage as Package, LuBrain as Brain, LuReceipt as Receipt, LuArrowRight as ArrowRight } from 'react-icons/lu';
import { motion } from "framer-motion";

const solutions = [
  {
    icon: Mic,
    title: "Voice Stock Control",
    problem: "Manual tracking leads to errors",
    solution: "Operators simply call and say what arrived. AI updates everything instantly.",
    color: "var(--color-brand-600)"
  },
  {
    icon: Brain,
    title: "Predictive Intelligence",
    problem: "Missed or delayed reorders",
    solution: "ML forecasts demand 14 days ahead and alerts you before you run out.",
    color: "var(--color-brand-500)"
  },
  {
    icon: Package,
    title: "Auto-Coordination",
    problem: "Supplier back-and-forth",
    solution: "Stash handles price checks and order placement via automated calls.",
    color: "var(--color-brand-700)"
  },
  {
    icon: Receipt,
    title: "Digital Billing",
    problem: "Payment delays & gaps",
    solution: "GST invoices and payment reminders sent automatically via Telegram.",
    color: "var(--color-brand-800)"
  },
];

export default function SolutionSection() {
  return (
    <section className="section bg-white" id="solution-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge glass-dark" style={{ color: 'var(--color-success)', borderColor: 'var(--color-success)' }}>
            The Stash Solution
          </span>
          <h2 className="section-title">
            The Future of Godown Management
          </h2>
          <p className="section-desc">
            A voice-first platform that turns complex operations into simple conversations.
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
          className="grid-2"
        >
          {solutions.map((sol, i) => {
            const Icon = sol.icon;
            return (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                }}
                className="feature-card"
                style={{ backgroundColor: 'var(--color-brand-50)', border: '1px solid var(--color-brand-100)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '3rem', height: '3rem', backgroundColor: sol.color, borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 16px ${sol.color}20` }}>
                    <Icon size={24} style={{ color: 'white' }} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-brand-900)' }}>
                    {sol.title}
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="glass" style={{ padding: '1rem', borderRadius: '0.75rem', border: '1px solid white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--color-error)', fontSize: '0.875rem' }}>✕</span>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Old Way</p>
                    </div>
                    <p style={{ fontSize: '0.9375rem', color: 'var(--color-muted)' }}>{sol.problem}</p>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-brand-100)' }}>
                      <ArrowRight size={14} style={{ color: 'var(--color-brand-600)', transform: 'rotate(90deg)' }} />
                    </div>
                  </div>

                  <div style={{ padding: '1rem', borderRadius: '0.75rem', backgroundColor: 'white', border: `1px solid ${sol.color}30`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--color-success)', fontSize: '0.875rem' }}>✓</span>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-brand-700)', fontWeight: 600, textTransform: 'uppercase' }}>With Stash</p>
                    </div>
                    <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-brand-800)' }}>{sol.solution}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
