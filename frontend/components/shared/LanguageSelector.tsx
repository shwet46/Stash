"use client";
import { useState, useEffect } from "react";
import { LuLanguages, LuChevronDown } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";

const languages = [
  { name: "English", code: "en" },
  { name: "हिन्दी", code: "hi" },
  { name: "বাংলা", code: "bn" },
  { name: "తెలుగు", code: "te" },
  { name: "मराठी", code: "mr" },
  { name: "தமிழ்", code: "ta" },
  { name: "ગુજરાતી", code: "gu" },
  { name: "ಕನ್ನಡ", code: "kn" },
  { name: "മലയാളം", code: "ml" },
  { name: "ਪੰਜਾਬੀ", code: "pa" },
  { name: "ଓଡ଼ିଆ", code: "or" },
];

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState("en");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("googtrans="))
      ?.split("=")[1];
    
    if (cookieValue) {
      const lang = cookieValue.split("/").pop();
      if (lang) setCurrentLang(lang);
    }

    // Forcefully hide Google Translate banner and restore body top
    const interval = setInterval(() => {
      const banner = document.querySelector('.goog-te-banner-frame') as HTMLElement;
      if (banner) {
        banner.style.display = 'none';
        banner.style.visibility = 'hidden';
      }
      
      // Fix body and html top
      if (document.body.style.top !== '0px') document.body.style.top = '0px';
      if (document.documentElement.style.top !== '0px') document.documentElement.style.top = '0px';

      const skipTranslate = document.querySelectorAll('.skiptranslate');
      skipTranslate.forEach(el => {
        const htmlEl = el as HTMLElement;
        if (!htmlEl.id || htmlEl.id.includes('container')) { 
           htmlEl.style.display = 'none';
        }
      });

      // Remove the "Translated to" tooltip that appears on hover
      const googTooltip = document.querySelector('#goog-gt-tt') as HTMLElement;
      if (googTooltip) googTooltip.style.display = 'none';
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const changeLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);
    
    const domain = window.location.hostname;
    // Set cookie for current domain and root path
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${domain}`;
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
    
    window.location.reload();
  };

  return (
    <div className="language-selector-container" style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="nav-lang-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.875rem',
          borderRadius: '0.75rem',
          border: '1px solid var(--color-brand-100)',
          backgroundColor: 'white',
          color: 'var(--color-brand-800)',
          fontWeight: 700,
          cursor: 'pointer',
          fontSize: '0.875rem',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}
      >
        <LuLanguages size={18} style={{ color: 'var(--color-brand-600)' }} />
        <span className="notranslate" translate="no">{languages.find(l => l.code === currentLang)?.name}</span>
        <LuChevronDown size={14} style={{ opacity: 0.5, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              style={{ position: 'fixed', inset: 0, zIndex: 999 }} 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 0.625rem)',
                right: 0,
                backgroundColor: 'white',
                borderRadius: '1.25rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: '1px solid var(--color-brand-100)',
                padding: '0.625rem',
                zIndex: 1000,
                minWidth: '280px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.375rem'
              }}
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className="notranslate"
                  translate="no"
                  style={{
                    padding: '0.625rem 0.875rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    backgroundColor: currentLang === lang.code ? 'var(--color-brand-50)' : 'transparent',
                    color: currentLang === lang.code ? 'var(--color-brand-600)' : 'var(--color-brand-800)',
                    fontWeight: currentLang === lang.code ? 800 : 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  {lang.name}
                  {currentLang === lang.code && (
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-brand-600)' }} />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
