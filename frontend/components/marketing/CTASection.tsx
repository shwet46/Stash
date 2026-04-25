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
          className="cta-card"
        >
          {/* Background decorations */}
          <div className="cta-card__orb cta-card__orb--top" />
          <div className="cta-card__orb cta-card__orb--bottom" />

          <div className="cta-card__content">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="cta-card__badge"
            >
              <Phone size={14} />
              Start Your Digital Journey Today
            </motion.div>

            <h2 className="cta-card__title">
              Ready to Transform Your Godown?
            </h2>
            <p className="cta-card__subtitle">
              Join forward-thinking operators across India who are already managing their business with just their voice. No apps. No typing. Just talk.
            </p>

            <div className="cta-card__actions">
              <Button
                size="lg"
                variant="secondary"
                className="cta-card__primary"
                icon={<ArrowRight size={20} />}
                onClick={() => window.location.href = '/dashboard'}
              >
                Launch Dashboard
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="cta-card__secondary"
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
