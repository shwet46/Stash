"use client";
import { LuTarget as Target, LuLeaf as Leaf, LuUsers as Users, LuLightbulb as Lightbulb } from 'react-icons/lu';
import { motion } from "framer-motion";

const sdgs = [
  {
    number: "SDG 2",
    title: "Zero Hunger",
    description: "Reducing food waste through AI-powered expiry tracking and demand forecasting.",
    icon: Leaf,
    color: "#2D6A4F",
  },
  {
    number: "SDG 8",
    title: "Economic Growth",
    description: "Empowering warehouse operators with technology, increasing their productivity.",
    icon: Users,
    color: "var(--color-brand-800)",
  },
  {
    number: "SDG 9",
    title: "Innovation",
    description: "Bringing AI and voice tech to India's unorganized supply chain sector.",
    icon: Lightbulb,
    color: "var(--color-brand-600)",
  },
  {
    number: "SDG 12",
    title: "Responsible Consumption",
    description: "Optimizing inventory levels to reduce overstock waste and ensure efficiency.",
    icon: Target,
    color: "var(--color-brand-700)",
  },
];

export default function SDGSection() {
  return (
    <section className="section bg-white" id="sdg-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge glass-dark">
            Social Impact
          </span>
          <h2 className="section-title text-gradient">
            Aligned with UN Development Goals
          </h2>
          <p className="section-desc">
            <span className="notranslate" translate="no">Stash</span> is a platform for inclusive economic growth and sustainable supply chains.
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
          className="grid-4"
        >
          {sdgs.map((sdg, i) => {
            const Icon = sdg.icon;
            return (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                }}
                className="feature-card glass text-center"
                style={{ padding: '2rem 1.5rem' }}
              >
                <div
                  className="feature-icon-wrapper"
                  style={{ backgroundColor: `${sdg.color}15`, margin: "0 auto 1.25rem auto", width: '3.5rem', height: '3.5rem', borderRadius: '1rem' }}
                >
                  <Icon size={28} style={{ color: sdg.color }} />
                </div>
                <span
                  style={{ fontSize: "0.8125rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: sdg.color }}
                >
                  {sdg.number}
                </span>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-brand-900)", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
                  {sdg.title}
                </h3>
                <p className="feature-desc" style={{ fontSize: '0.9375rem' }}>
                  {sdg.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
