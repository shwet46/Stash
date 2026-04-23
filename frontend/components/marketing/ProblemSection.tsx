"use client";
import { LuTriangleAlert as AlertTriangle, LuClock as Clock, LuPhoneOff as PhoneOff, LuCoins as Coins } from 'react-icons/lu';
import { motion } from "framer-motion";

const problems = [
  {
    icon: AlertTriangle,
    title: "Manual Stock Tracking",
    description: "Godown operators rely on paper registers. Stock discrepancies of 10-15% are common, leading to lost revenue.",
    stat: "₹2.3L",
    statLabel: "Avg. annual loss",
    borderColor: "#E11D48",
  },
  {
    icon: Clock,
    title: "Delayed Reorders",
    description: "Operators discover stockouts only when customers call. By then, it's too late — lead times are 3-7 days.",
    stat: "40%",
    statLabel: "Orders lost",
    borderColor: "#F59E0B",
  },
  {
    icon: PhoneOff,
    title: "Supplier Chaos",
    description: "Price negotiation and delivery coordination happen over 20+ daily phone calls. It's exhausting and slow.",
    stat: "3hrs",
    statLabel: "Daily call time",
    borderColor: "#7C4530",
  },
  {
    icon: Coins,
    title: "Cash Flow Gaps",
    description: "Credit tracking is manual. Payment reminders are forgotten. GST invoices are rarely generated on time.",
    stat: "60%",
    statLabel: "Overdue payments",
    borderColor: "#E11D48",
  },
];

export default function ProblemSection() {
  return (
    <section className="section bg-gradient-mesh" id="problem-section" style={{ backgroundColor: 'var(--color-brand-50)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-badge glass-dark" style={{ color: 'var(--color-error)' }}>
            The Industry Challenge
          </span>
          <h2 className="section-title">
            India&apos;s Godowns Are Stuck in the Past
          </h2>
          <p className="section-desc">
            Traditional operations are manual, unstructured, and inefficient. These leaks cost money and time every single day.
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
          {problems.map((problem, i) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
                }}
                className="feature-card glass"
                style={{ borderTop: `4px solid ${problem.borderColor}` }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                  <div
                    style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: `${problem.borderColor}10` }}
                  >
                    <Icon
                      size={24}
                      style={{ color: problem.borderColor }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-brand-900)', marginBottom: '0.75rem' }}>
                      {problem.title}
                    </h3>
                    <p style={{ fontSize: '1rem', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                      {problem.description}
                    </p>
                    <div className="glass-dark" style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', borderRadius: '0.75rem', padding: '0.75rem 1.25rem', border: '1px solid var(--color-brand-100)' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: problem.borderColor }}>
                        {problem.stat}
                      </span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-brand-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {problem.statLabel}
                      </span>
                    </div>
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
