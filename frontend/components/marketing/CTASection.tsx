"use client";
import Link from "next/link";
import Button from "../ui/Button";
import { LuArrowRight as ArrowRight, LuPhone as Phone } from 'react-icons/lu';

export default function CTASection() {
  return (
    <section className="section" id="cta-section">
      <div className="container">
        <div style={{ backgroundColor: 'var(--color-brand-600)', borderRadius: '1rem', padding: '2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Background decorations */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: '16rem', height: '16rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%', transform: 'translate(50%, -50%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '12rem', height: '12rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%', transform: 'translate(-50%, 50%)' }} />

          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 1rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '9999px', color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <Phone size={14} />
              Start in 2 minutes
            </div>

            <h2 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>
              Ready to Transform Your Godown?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '36rem', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
              Join thousands of godown operators across India who are already
              managing their business with just their voice. No smartphone
              needed.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              <Button
                size="lg"
                style={{ backgroundColor: 'var(--color-cream)', color: 'var(--color-brand-600)' }}
                icon={<ArrowRight size={18} />}
                onClick={() => window.location.href = '/dashboard'}
              >
                Open Dashboard
              </Button>
              <Button
                size="lg"
                variant="outline"
                style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
                icon={<Phone size={18} />}
                onClick={() => window.location.href = 'tel:+911800782744'}
              >
                Try Demo Call
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
