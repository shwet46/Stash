import Link from "next/link";
import { LuWarehouse as Warehouse } from 'react-icons/lu';

export default function Footer() {
  return (
    <footer className="footer" id="footer" style={{ padding: '2.5rem 0', backgroundColor: 'var(--color-brand-50)' }}>
      <div className="container">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', backgroundColor: 'var(--color-brand-600)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Warehouse size={20} style={{ color: 'white' }} />
            </div>
            <span className="notranslate" translate="no" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-brand-700)', letterSpacing: '-0.025em' }}>
              Stash
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-brand-900)', margin: 0 }}>
              Made with ❤️ by <span style={{ color: 'var(--color-brand-600)', fontWeight: 700 }}>Team Nerds</span>
            </p>
          </div>
        </div>
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-brand-200)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: 0 }}>
            © {new Date().getFullYear()} Stash. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
