"use client";
import CTASection from "@/components/marketing/CTASection";
import { motion } from "framer-motion";
import { LuGlobe as Globe, LuShieldCheck as Shield, LuZap as Zap } from 'react-icons/lu';

export default function AboutPage() {
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
              Our Mission
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--color-brand-800)', marginTop: '1rem', lineHeight: 1.1 }}
            >
              Digitizing the <span style={{ color: '#4285F4' }}>backbone of India.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ fontSize: '1.25rem', color: 'var(--color-muted)', marginTop: '1.5rem', lineHeight: 1.6 }}
            >
              Stash was born in the godowns of Maharashtra, built for the operators who keep the supply chain moving every single day.
            </motion.p>
          </div>
        </div>
      </section>

      <section style={{ padding: '8rem 0' }}>
        <div className="container">
          <div className="grid-2" style={{ gap: '6rem', alignItems: 'center' }}>
             <motion.div
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
             >
                <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-brand-800)', marginBottom: '2rem' }}>Why Voice?</h2>
                <p style={{ fontSize: '1.125rem', color: 'var(--color-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
                  The most efficient tool in a warehouse isn't a tablet or a smartphone—it's the voice of the operator. 
                  By removing the screen, we remove the barrier to entry. Stash allows any operator to manage thousands of SKUs 
                  just by speaking into their feature phone.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                   {[
                     { icon: <Globe size={20} />, text: "Democratizing technology for non-literate operators" },
                     { icon: <Shield size={20} />, text: "Enterprise security for every small warehouse" },
                     { icon: <Zap size={20} />, text: "90% faster stock logging than manual entry" }
                   ].map((item, i) => (
                     <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-brand-800)', fontWeight: 600 }}>
                        <div style={{ color: '#4285F4' }}>{item.icon}</div>
                        <span>{item.text}</span>
                     </div>
                   ))}
                </div>
             </motion.div>
             <motion.div
               initial={{ opacity: 0, x: 30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               style={{ backgroundColor: 'var(--color-brand-50)', padding: '4rem', borderRadius: '32px', border: '1px solid var(--color-brand-100)', textAlign: 'center' }}
             >
                <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--color-brand-600)', marginBottom: '1rem' }}>85%</div>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-brand-800)' }}>Efficiency Increase</p>
                <p style={{ color: 'var(--color-muted)', marginTop: '1rem' }}>Reported by our early pilot godowns in Nagpur and Pune.</p>
             </motion.div>
          </div>
        </div>
      </section>

      <CTASection />
    </main>
  );
}
