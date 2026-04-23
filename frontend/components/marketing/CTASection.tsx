"use client";
import Button from "../ui/Button";
import { LuArrowRight as ArrowRight, LuPhone as Phone } from 'react-icons/lu';
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="section" id="cta-section">
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ 
            background: 'linear-gradient(135deg, var(--color-brand-800) 0%, var(--color-brand-600) 100%)', 
            borderRadius: '2rem', 
            padding: '4rem 2rem', 
            textAlign: 'center', 
            position: 'relative', 
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(124, 69, 48, 0.3)'
          }}
        >
          {/* Background decorations */}
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '25rem', height: '25rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '20rem', height: '20rem', backgroundColor: 'rgba(193, 132, 85, 0.2)', borderRadius: '50%', filter: 'blur(40px)' }} />

          <div style={{ position: 'relative', zIndex: 10 }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '9999px', color: 'white', fontSize: '0.875rem', fontWeight: 600, marginBottom: '2rem' }}
            >
              <Phone size={14} />
              Start Your Digital Journey Today
            </motion.div>

            <h2 style={{ fontSize: '3rem', fontWeight: 800, color: 'white', marginBottom: '1.5rem', letterSpacing: '-0.025em' }}>
              Ready to Transform Your Godown?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.25rem', maxWidth: '42rem', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
              Join forward-thinking operators across India who are already managing their business with just their voice. No apps. No typing. Just talk.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', alignItems: 'center' }}>
              <Button
                size="lg"
                style={{ 
                  backgroundColor: 'white', 
                  color: 'var(--color-brand-800)', 
                  boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                }}
                icon={<ArrowRight size={20} />}
                onClick={() => window.location.href = '/dashboard'}
              >
                Launch Dashboard
              </Button>
              <Button
                size="lg"
                variant="outline"
                style={{ 
                  borderColor: 'rgba(255,255,255,0.8)', 
                  color: 'white', 
                  backgroundColor: 'transparent'
                }}
                icon={<Phone size={20} />}
                onClick={() => window.location.href = 'tel:+911800782744'}
              >
                Try Demo Call
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
