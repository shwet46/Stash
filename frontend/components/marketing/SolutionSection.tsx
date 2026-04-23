"use client";
import { LuMic as Mic, LuPackage as Package, LuBrain as Brain, LuTruck as Truck, LuReceipt as Receipt, LuChartBar as BarChart3, LuArrowRight as ArrowRight } from 'react-icons/lu';
import { motion } from "framer-motion";

const solutions = [
  {
    icon: Mic,
    title: "Voice-Based Stock Updates",
    problem: "Manual stock tracking leads to errors",
    solution:
      "Operators simply call and say 'Chana Dal 500 kg aaya hai' — AI updates inventory instantly with real-time syncing.",
  },
  {
    icon: Brain,
    title: "AI Predicts & Auto-Reorders",
    problem: "Missed or delayed reorders",
    solution:
      "Machine learning forecasts demand 14 days ahead. When stock drops below threshold, suppliers are contacted automatically.",
  },
  {
    icon: Package,
    title: "Automated Supplier Coordination",
    problem: "Constant back-and-forth with suppliers",
    solution:
      "<span class=\"notranslate\" translate=\"no\">Stash</span> handles price negotiation, availability checks, and order placement via automated voice calls to suppliers.",
  },
  {
    icon: Receipt,
    title: "Automated Billing & Reminders",
    problem: "Payment delays and poor cash flow tracking",
    solution:
      "GST invoices auto-generated, credit tracked per buyer, payment reminders sent via Telegram in buyer's language.",
  },
];

export default function SolutionSection() {
  return (
    <section className="section" id="solution-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge" style={{ backgroundColor: 'var(--color-success)', color: 'white', opacity: 0.9 }}>
            The Solution
          </span>
          <h2 className="section-title">
            How <span className="notranslate" translate="no">Stash</span> Solves It
          </h2>
          <p className="section-desc">
            A voice-first, AI-powered platform that brings together inventory,
            orders, supplier coordination, billing, and delivery into one
            seamless system.
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
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'var(--color-brand-600)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} style={{ color: 'white' }} />
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-brand-800)' }}>
                    {sol.title}
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--color-error)', fontSize: '0.875rem', fontWeight: 500, marginTop: '0.125rem' }}>
                      ✗
                    </span>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>{sol.problem}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <ArrowRight
                      size={16}
                      style={{ color: 'var(--color-brand-400)', transform: 'rotate(90deg)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--color-success)', fontSize: '0.875rem', fontWeight: 500, marginTop: '0.125rem' }}>
                      ✓
                    </span>
                    <p 
                      style={{ fontSize: '0.875rem', color: 'var(--color-brand-700)' }}
                      dangerouslySetInnerHTML={{ __html: sol.solution }}
                    />
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
