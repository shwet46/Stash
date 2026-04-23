"use client";
import { LuPhone as Phone, LuBrain as Brain, LuZap as Zap, LuCheck as CheckCircle } from 'react-icons/lu';
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: Phone,
    title: "Operator Calls <span class=\"notranslate\" translate=\"no\">Stash</span>",
    description:
      "The godown operator dials the <span class=\"notranslate\" translate=\"no\">Stash</span> phone number. No app download, no login, no internet needed on their end.",
    details: [
      "Works from any phone — feature phone or smartphone",
      "Recognizes the caller by phone number",
      "Supports Hindi, English, and Hinglish",
    ],
  },
  {
    number: "02",
    icon: Brain,
    title: "AI Understands the Intent",
    description:
      "Google Cloud Speech-to-Text converts voice to text. Gemini 3.0 Flash extracts intent and entities from the transcript.",
    details: [
      "Real-time speech recognition",
      "Intent classification (stock, order, price, etc.)",
      "Entity extraction (product, quantity, price)",
    ],
  },
  {
    number: "03",
    icon: Zap,
    title: "System Takes Action",
    description:
      "Based on the extracted intent, <span class=\"notranslate\" translate=\"no\">Stash</span> automatically updates inventory, places orders, triggers supplier calls, or generates invoices.",
    details: [
      "Inventory updated in real-time",
      "Orders created and tracked",
      "Suppliers contacted automatically",
    ],
  },
  {
    number: "04",
    icon: CheckCircle,
    title: "Confirmation & Notifications",
    description:
      "The operator hears a voice confirmation on the call. Buyers and suppliers receive Telegram updates in their preferred language.",
    details: [
      "Voice response in operator's language",
      "Telegram notifications to buyers",
      "Dashboard updated instantly",
    ],
  },
];

export default function HowItWorksSection() {
  return (
    <section className="section" id="how-it-works-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">
            How It Works
          </span>
          <h2 className="section-title">
            Four Simple Steps
          </h2>
          <p className="section-desc">
            From phone call to action — the entire workflow takes under 30
            seconds.
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          {/* Connecting line */}
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', backgroundColor: 'var(--color-divider)', transform: 'translateX(-50%)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  key={i}
                  style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}
                >
                  {/* Timeline dot */}
                  <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '3rem', height: '3rem', backgroundColor: 'var(--color-brand-600)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, boxShadow: 'var(--shadow-card)' }}>
                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <div
                    style={{ width: '100%', display: 'flex', justifyContent: isEven ? 'flex-start' : 'flex-end', padding: '1rem 0' }}
                  >
                    <div
                      className="feature-card"
                      style={{ maxWidth: '36rem', width: '100%', margin: isEven ? '0 auto 0 0' : '0 0 0 auto' }}
                    >
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexDirection: isEven ? 'row-reverse' : 'row' }}
                      >
                        <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'var(--color-brand-100)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={20} style={{ color: 'var(--color-brand-600)' }} />
                        </div>
                        <div style={{ textAlign: isEven ? 'right' : 'left' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>
                            Step {step.number}
                          </span>
                          <h3 
                            style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-brand-800)' }}
                            dangerouslySetInnerHTML={{ __html: step.title }}
                          />
                        </div>
                      </div>
                      <p 
                        style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '1rem', lineHeight: 1.6, textAlign: isEven ? 'right' : 'left' }}
                        dangerouslySetInnerHTML={{ __html: step.description }}
                      />
                      <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none' }}>
                        {step.details.map((detail, j) => (
                          <li
                            key={j}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-brand-700)', flexDirection: isEven ? 'row-reverse' : 'row' }}
                          >
                            <span style={{ width: '0.375rem', height: '0.375rem', backgroundColor: 'var(--color-brand-400)', borderRadius: '50%', flexShrink: 0 }} />
                            {detail}
                          </li>
                        ))}
                      </ul>
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
