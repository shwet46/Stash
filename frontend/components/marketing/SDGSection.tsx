"use client";
import { LuTarget as Target, LuLeaf as Leaf, LuUsers as Users, LuLightbulb as Lightbulb } from 'react-icons/lu';
import { motion } from "framer-motion";

const sdgs = [
  {
    number: "SDG 2",
    title: "Zero Hunger",
    description:
      "Reducing food waste through AI-powered expiry tracking and demand forecasting for grain and essential goods.",
    icon: Leaf,
    color: "#2D6A4F",
  },
  {
    number: "SDG 8",
    title: "Decent Work & Economic Growth",
    description:
      "Empowering small warehouse operators with technology, increasing their productivity and profitability.",
    icon: Users,
    color: "#6B4226",
  },
  {
    number: "SDG 9",
    title: "Industry, Innovation & Infrastructure",
    description:
      "Bringing AI and voice technology to India's unorganized supply chain sector, bridging the digital divide.",
    icon: Lightbulb,
    color: "#D4A017",
  },
  {
    number: "SDG 12",
    title: "Responsible Consumption",
    description:
      "Optimizing inventory levels to reduce overstock waste and ensuring efficient distribution of goods.",
    icon: Target,
    color: "#8B5E3C",
  },
];

export default function SDGSection() {
  return (
    <section className="section" id="sdg-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">
            Social Impact
          </span>
          <h2 className="section-title">
            Aligned with UN Sustainable Development Goals
          </h2>
          <p className="section-desc">
            <span className="notranslate" translate="no">Stash</span> isn&apos;t just a business tool — it&apos;s a platform for
            inclusive economic growth and sustainable supply chains.
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
                  hidden: { opacity: 0, scale: 0.95 },
                  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
                }}
                className="feature-card text-center"
              >
                <div
                  className="feature-icon-wrapper"
                  style={{ backgroundColor: `${sdg.color}15`, margin: "0 auto 1rem auto" }}
                >
                  <Icon size={24} style={{ color: sdg.color }} />
                </div>
                <span
                  style={{ fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", color: sdg.color }}
                >
                  {sdg.number}
                </span>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-brand-800)", marginTop: "0.25rem", marginBottom: "0.5rem" }}>
                  {sdg.title}
                </h3>
                <p className="feature-desc">
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
