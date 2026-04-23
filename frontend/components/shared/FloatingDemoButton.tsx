"use client";
import { LuPhone as Phone } from 'react-icons/lu';
import { motion } from "framer-motion";

export default function FloatingDemoButton() {
  return (
    <motion.a
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      href="tel:+911800782744"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1.5rem',
        backgroundColor: 'var(--color-brand-600)',
        color: 'white',
        borderRadius: '9999px',
        textDecoration: 'none',
        boxShadow: '0 10px 25px rgba(179, 107, 65, 0.4)',
        fontWeight: 700,
        fontSize: '0.9375rem',
        border: '1px solid rgba(255,255,255,0.2)'
      }}
      id="floating-demo-btn"
    >
      <div style={{ 
        width: '2rem', 
        height: '2rem', 
        backgroundColor: 'rgba(255,255,255,0.2)', 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Phone size={16} />
      </div>
      <span>Try Demo Call</span>
    </motion.a>
  );
}
