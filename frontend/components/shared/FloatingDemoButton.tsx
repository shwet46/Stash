"use client";
import { LuPhone as Phone } from 'react-icons/lu';

export default function FloatingDemoButton() {
  return (
    <a
      href="tel:+911800782744"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-brand-600 text-white rounded-pill shadow-card-hover hover:bg-brand-700 hover:shadow-dropdown transition-all duration-300 group animate-fade-in"
      id="floating-demo-btn"
    >
      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
        <Phone size={16} className="animate-float" />
      </div>
      <span className="text-sm font-medium">Try Demo Call</span>
    </a>
  );
}
