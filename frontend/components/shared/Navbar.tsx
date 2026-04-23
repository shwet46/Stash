"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { LuMenu as Menu, LuX as X, LuWarehouse as Warehouse } from 'react-icons/lu';
import Button from "../ui/Button";
import { useSession, signOut } from "next-auth/react";

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
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`} id="main-navbar">
      <div className="container">
        <div className="navbar-inner">
          {/* Logo */}
          <Link href="/" className="nav-brand">
            <div className="nav-brand-icon">
              <Warehouse size={20} />
            </div>
            <span className="nav-brand-text notranslate" translate="no">
              Stash
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="nav-links">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="nav-actions">
            {status === "authenticated" ? (
              <>
                <Link href="/dashboard">
                  <Button size="sm" variant="outline">Dashboard</Button>
                </Link>
                <Button size="sm" onClick={() => signOut()}>Logout</Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button size="sm" variant="ghost">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-inner">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="mobile-nav-link"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {status === "authenticated" ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" variant="outline" style={{ width: '100%' }}>Dashboard</Button>
                  </Link>
                  <Button size="sm" style={{ width: '100%' }} onClick={() => { signOut(); setMobileOpen(false); }}>Logout</Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" variant="ghost" style={{ width: '100%' }}>Login</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" style={{ width: '100%' }}>Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
