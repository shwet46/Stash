const techCategories = [
  {
    title: "Frontend",
    items: [
      { name: "Next.js 14", desc: "App Router, Server Components" },
      { name: "Tailwind CSS", desc: "Utility-first styling" },
      { name: "Recharts", desc: "Data visualization" },
      { name: "NextAuth.js", desc: "Authentication" },
      { name: "Lucide React", desc: "Icon library" },
    ],
  },
  {
    title: "Backend",
    items: [
      { name: "FastAPI", desc: "Async Python framework" },
      { name: "SQLAlchemy v2", desc: "Async ORM" },
      { name: "Celery", desc: "Task queue" },
      { name: "Redis", desc: "Caching & pub/sub" },
      { name: "WeasyPrint", desc: "PDF generation" },
    ],
  },
  {
    title: "AI / ML",
    items: [
      { name: "Gemini 3.0 Flash", desc: "Intent extraction & NLP" },
      { name: "Vertex AI", desc: "Prophet & XGBoost models" },
      { name: "Cloud Speech-to-Text v2", desc: "Voice transcription" },
      { name: "gTTS", desc: "Text-to-speech responses" },
    ],
  },
  {
    title: "Communication",
    items: [
      { name: "Twilio Voice", desc: "Inbound & outbound calls" },
      { name: "Telegram Bot API", desc: "Customer notifications" },
    ],
  },
  {
    title: "Infrastructure",
    items: [
      { name: "Google Cloud Run", desc: "Backend hosting" },
      { name: "Firebase Hosting", desc: "Frontend hosting" },
      { name: "Cloud Pub/Sub", desc: "Event streaming" },
      { name: "BigQuery", desc: "Analytics warehouse" },
      { name: "PostgreSQL 16", desc: "With PostGIS extension" },
    ],
  },
  {
    title: "DevOps",
    items: [
      { name: "Docker", desc: "Containerization" },
      { name: "GitHub Actions", desc: "CI/CD pipeline" },
      { name: "Google Maps API", desc: "ETA & routing" },
    ],
  },
];

export default function TechStackSection() {
  return (
    <section className="section section-alt" id="tech-stack-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">
            Technology
          </span>
          <h2 className="section-title">
            Built on Google Cloud & Open Source
          </h2>
          <p className="section-desc">
            Enterprise-grade infrastructure designed for scale, reliability, and
            the unique needs of India&apos;s supply chain.
          </p>
        </div>

        <div className="grid-3">
          {techCategories.map((cat, i) => (
            <div
              key={i}
              className="feature-card"
            >
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-brand-600)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                {cat.title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {cat.items.map((item, j) => (
                  <div
                    key={j}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.5rem', borderBottom: j === cat.items.length - 1 ? 'none' : '1px solid var(--color-divider)' }}
                  >
                    <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: 'var(--color-brand-400)', borderRadius: '50%', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-brand-800)' }}>
                        {item.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginLeft: '0.5rem' }}>
                        {item.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
