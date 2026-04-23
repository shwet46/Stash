"use client";
import { motion } from "framer-motion";

const techCategories = [
  {
    title: "Frontend",
    items: [
      { name: "Next.js 14", desc: "App Router & RSC" },
      { name: "Custom CSS", desc: "Design Token System" },
      { name: "Framer Motion", desc: "Premium Animations" },
      { name: "NextAuth.js", desc: "Secure Auth" },
    ],
  },
  {
    title: "Backend",
    items: [
      { name: "FastAPI", desc: "Async Python" },
      { name: "SQLAlchemy v2", desc: "Async ORM" },
      { name: "Celery", desc: "Task Queue" },
      { name: "Redis", desc: "Caching" },
    ],
  },
  {
    title: "AI / ML",
    items: [
      { name: "Gemini 3.0 Flash", desc: "NLP Intent Extraction" },
      { name: "Vertex AI", desc: "Forecasting Models" },
      { name: "Cloud STT v2", desc: "Voice Processing" },
      { name: "Google Cloud TTS", desc: "Voice Response" },
    ],
  },
  {
    title: "Cloud",
    items: [
      { name: "Cloud Run", desc: "Backend Hosting" },
      { name: "Cloud SQL", desc: "PostgreSQL 16" },
      { name: "BigQuery", desc: "Data Warehouse" },
      { name: "Pub/Sub", desc: "Event Streaming" },
    ],
  },
];

export default function TechStackSection() {
  return (
    <section className="section bg-gradient-mesh" id="tech-stack-section" style={{ backgroundColor: 'var(--color-brand-50)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-badge glass-dark">
            Our Stack
          </span>
          <h2 className="section-title text-gradient">
            Modern Tech for Modern Godowns
          </h2>
          <p className="section-desc">
            Built on top-tier cloud infrastructure and cutting-edge AI for maximum reliability.
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
          {techCategories.map((cat, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
              }}
              className="feature-card glass"
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-brand-600)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', textAlign: 'center' }}>
                {cat.title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {cat.items.map((item, j) => (
                  <div
                    key={j}
                    style={{ paddingBottom: '0.75rem', borderBottom: j === cat.items.length - 1 ? 'none' : '1px solid var(--color-brand-100)' }}
                  >
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-brand-900)' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-muted)', marginTop: '0.125rem' }}>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
