"use client";
import TechStackSection from "@/components/marketing/TechStackSection";
import CTASection from "@/components/marketing/CTASection";
import { motion } from "framer-motion";
import { LuCloud as Cloud, LuCpu as Cpu, LuDatabase as Database, LuPhone as Phone } from 'react-icons/lu';

export default function TechStackPage() {
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
              Enterprise Infrastructure
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--color-brand-800)', marginTop: '1rem', lineHeight: 1.1 }}
            >
              Built on <span style={{ color: '#4285F4' }}>Google Cloud.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ fontSize: '1.25rem', color: 'var(--color-muted)', marginTop: '1.5rem', lineHeight: 1.6 }}
            >
              Stash leverages cutting-edge AI and telephony infrastructure to ensure 99.9% uptime and enterprise-grade security.
            </motion.p>
          </div>
        </div>
      </section>

      <section style={{ padding: '8rem 0' }}>
        <div className="container">
          <div className="grid-2" style={{ gap: '4rem' }}>
             {[
               { icon: <Cpu />, name: "Gemini 3.0 Flash", desc: "Our primary LLM for real-time multilingual audio transcription and intent extraction. Optimized for speed and accuracy in logistics context." },
               { icon: <Cloud />, name: "Vertex AI", desc: "Infrastructure for deploying custom predictive models for stockout forecasting and disruption risk analysis." },
               { icon: <Phone />, name: "Twilio Programmable Voice", desc: "Reliable telephony gateway handling inbound and outbound calls from even the most remote regions in India." },
               { icon: <Database />, name: "PostgreSQL + Firestore", desc: "Hybrid database architecture for structured relational data and real-time operational state synchronization." }
             ].map((tech, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 style={{ display: 'flex', gap: '1.5rem', padding: '2rem', borderRadius: '1.5rem', backgroundColor: '#F8F9FA', border: '1px solid #E8EAED' }}
               >
                  <div style={{ width: '56px', height: '56px', backgroundColor: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4285F4', flexShrink: 0, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    {tech.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-brand-800)', marginBottom: '0.5rem' }}>{tech.name}</h3>
                    <p style={{ color: 'var(--color-muted)', lineHeight: 1.6 }}>{tech.desc}</p>
                  </div>
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      <TechStackSection />
      <CTASection />
    </main>
  );
}
