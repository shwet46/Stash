import { LuTriangleAlert as AlertTriangle, LuClock as Clock, LuPhoneOff as PhoneOff, LuCoins as Coins } from 'react-icons/lu';

const problems = [
  {
    icon: AlertTriangle,
    title: "Manual Stock Tracking Leads to Errors",
    description:
      "Godown operators rely on paper registers and memory. Stock discrepancies of 10-15% are common, leading to lost revenue and customer disputes.",
    stat: "₹2.3L",
    statLabel: "Avg. annual loss from stock errors",
    borderColor: "#C0392B",
  },
  {
    icon: Clock,
    title: "Missed or Delayed Reorders",
    description:
      "Without demand forecasting, operators discover stockouts only when customers call. By then, it's too late — suppliers need 3-7 days lead time.",
    stat: "40%",
    statLabel: "Orders lost to stockouts",
    borderColor: "#D4A017",
  },
  {
    icon: PhoneOff,
    title: "Constant Back-and-Forth With Suppliers",
    description:
      "Price negotiation, availability checks, and delivery coordination happen over 15-20 daily phone calls. It's exhausting and error-prone.",
    stat: "3hrs",
    statLabel: "Daily time on supplier calls",
    borderColor: "#6B4226",
  },
  {
    icon: Coins,
    title: "Payment Delays & Poor Cash Flow",
    description:
      "Credit tracking is done in notebooks. Payment reminders are forgotten. GST invoices are generated manually — if at all.",
    stat: "60%",
    statLabel: "Buyers with overdue payments",
    borderColor: "#C0392B",
  },
];

export default function ProblemSection() {
  return (
    <section className="section section-alt" id="problem-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-error)' }}>
            The Problem
          </span>
          <h2 className="section-title">
            India&apos;s Godowns Are Stuck in the Past
          </h2>
          <p className="section-desc">
            Godown operations are still largely manual and unstructured, relying
            on calls and basic tools. This leads to stock inaccuracies, missed
            reorders, and slow communication.
          </p>
        </div>

        <div className="grid-2">
          {problems.map((problem, i) => {
            const Icon = problem.icon;
            return (
              <div
                key={i}
                className="feature-card"
                style={{ borderLeftWidth: "4px", borderLeftColor: problem.borderColor }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div
                    style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: `${problem.borderColor}15` }}
                  >
                    <Icon
                      size={20}
                      style={{ color: problem.borderColor }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-brand-800)', marginBottom: '0.5rem' }}>
                      {problem.title}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                      {problem.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--color-brand-50)', borderRadius: '0.5rem', padding: '0.625rem 1rem' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-brand-600)' }}>
                        {problem.stat}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                        {problem.statLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
