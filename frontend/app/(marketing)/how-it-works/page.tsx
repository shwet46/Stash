"use client";
import HowItWorksSection from "@/components/marketing/HowItWorksSection";
import CTASection from "@/components/marketing/CTASection";
import { motion } from "framer-motion";
import { LuPhoneCall as Phone, LuCpu as Cpu, LuDatabase as Database } from 'react-icons/lu';

export default function HowItWorksPage() {
  return (
    <main style={{ backgroundColor: '#ffffff' }}>
      <section style={{ paddingTop: '10rem', paddingBottom: '5rem', borderBottom: '1px solid var(--color-divider)' }}>
        <div className="container">
          <div className="text-center" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              style={{ color: 'var(--color-brand-600)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.875rem' }}
            >
              The Voice Interface
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--color-brand-800)', marginTop: '1rem', lineHeight: 1.1 }}
            >
              Complex logistics, <span style={{ color: '#4285F4' }}>simplified by speech.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ fontSize: '1.25rem', color: 'var(--color-muted)', marginTop: '1.5rem', lineHeight: 1.6 }}
            >
              See how Stash turns a simple phone call into a digital supply chain command.
            </motion.p>
          </div>
        </div>
      </section>

      <section style={{ padding: '8rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
             {[
               { icon: <Phone size={32} />, step: "Step 01", title: "Operator places a call", desc: "No internet needed. The godown operator calls the Stash number and speaks in their local language. They report stock arrivals, shipments, or tasks." },
               { icon: <Cpu size={32} />, step: "Step 02", title: "Gemini AI extracts intent", desc: "Our Vertex AI pipeline transcribes the audio and extracts structured data—products, quantities, units, and dates—with 99%+ accuracy." },
               { icon: <Database size={32} />, step: "Step 03", title: "Real-time Dashboard Sync", desc: "The extracted data instantly updates the Firestore and BigQuery databases, alerting the owner and adjusting stock levels globally." }
             ].map((s, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 className="d-flex align-center gap-6"
                 style={{ flexDirection: i % 2 === 0 ? 'row' : 'row-reverse', flexWrap: 'wrap', marginBottom: '4rem' }}
               >
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ color: 'var(--color-brand-600)', fontWeight: 800, fontSize: '0.875rem', marginBottom: '1rem' }}>{s.step}</div>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-brand-800)', marginBottom: '1.5rem' }}>{s.title}</h2>
                    <p style={{ fontSize: '1.125rem', color: 'var(--color-muted)', lineHeight: 1.7 }}>{s.desc}</p>
                  </div>
                  <div style={{ flex: 1, minWidth: '300px', height: '300px', backgroundColor: '#F8F9FA', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4285F4', border: '1px solid #E8EAED' }}>
                     {s.icon}
                  </div>
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      <HowItWorksSection />
      <CTASection />
    </main>
  );
}
