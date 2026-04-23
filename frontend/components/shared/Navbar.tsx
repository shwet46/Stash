"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { LuMenu as Menu, LuX as X, LuWarehouse as Warehouse, LuArrowRight as ArrowRight } from 'react-icons/lu';
import Button from "../ui/Button";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Features", href: "/features" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Tech Stack", href: "/tech-stack" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const { status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`navbar ${scrolled ? "scrolled" : ""}`} 
      id="main-navbar"
      style={{
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--color-brand-100)' : 'none',
        height: scrolled ? '4.5rem' : '6rem',
        padding: '0 1rem'
      }}
    >
      <div className="container" style={{ height: '100%' }}>
        <div className="navbar-inner" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link href="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div className="nav-brand-icon" style={{ backgroundColor: 'var(--color-brand-600)', borderRadius: '0.75rem', width: '2.75rem', height: '2.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(179, 107, 65, 0.2)' }}>
              <Warehouse size={24} style={{ color: 'white' }} />
            </div>
            <span className="nav-brand-text notranslate" translate="no" style={{ fontSize: '1.625rem', fontWeight: 900, color: 'var(--color-brand-800)', letterSpacing: '-0.03em' }}>
              Stash
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 2rem' }}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link" style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-brand-800)', padding: '0.625rem 1.25rem', borderRadius: '0.75rem' }}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {status === "authenticated" ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" size="md">Dashboard</Button>
                </Link>
                <Button size="md" variant="ghost" onClick={() => signOut()}>Logout</Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="md">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button size="md" className="btn-primary" icon={<ArrowRight size={18} />}>Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            style={{ backgroundColor: 'var(--color-brand-50)', color: 'var(--color-brand-800)', padding: '0.625rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer' }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mobile-menu glass"
            style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', borderBottom: '1px solid var(--color-brand-100)', padding: '1rem' }}
          >
            <div className="mobile-menu-inner" style={{ gap: '0.5rem' }}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="mobile-nav-link"
                  onClick={() => setMobileOpen(false)}
                  style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-brand-800)', padding: '1rem' }}
                >
                  {link.label}
                </Link>
              ))}
              <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '2px solid var(--color-brand-50)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {status === "authenticated" ? (
                  <>
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                      <Button size="lg" variant="outline" style={{ width: '100%', fontWeight: 700 }}>Dashboard</Button>
                    </Link>
                    <Button size="lg" style={{ width: '100%', fontWeight: 700 }} onClick={() => { signOut(); setMobileOpen(false); }}>Logout</Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      <Button size="lg" variant="ghost" style={{ width: '100%', fontWeight: 700 }}>Login</Button>
                    </Link>
                    <Link href="/signup" onClick={() => setMobileOpen(false)}>
                      <Button size="lg" style={{ width: '100%', fontWeight: 700 }}>Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
