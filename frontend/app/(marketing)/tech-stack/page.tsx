import type { Metadata } from "next";
import TechStackSection from "@/components/marketing/TechStackSection";
import CTASection from "@/components/marketing/CTASection";

export const metadata: Metadata = {
  title: "Tech Stack — Stash",
  description:
    "Built on Google Cloud, Gemini AI, FastAPI, and Next.js. Enterprise-grade infrastructure for India's supply chain.",
};

const architecture = [
  {
    layer: "Presentation Layer",
    description: "Next.js 14 with App Router, server and client components, Tailwind CSS, Recharts for data viz.",
    color: "#6B4226",
  },
  {
    layer: "API Layer",
    description: "FastAPI with async endpoints, NextAuth.js for authentication, RBAC middleware for route protection.",
    color: "#8B5E3C",
  },
  {
    layer: "AI / ML Layer",
    description: "Gemini 3.0 Flash for NLP, Prophet for demand forecasting, XGBoost for disruption classification.",
    color: "#D4956A",
  },
  {
    layer: "Communication Layer",
    description: "Twilio Voice for calls, Telegram Bot API for notifications, gTTS for voice responses.",
    color: "#6B4226",
  },
  {
    layer: "Data Layer",
    description: "PostgreSQL 16 with PostGIS, Redis for caching, BigQuery for analytics, Firebase Storage for files.",
    color: "#8B5E3C",
  },
  {
    layer: "Infrastructure Layer",
    description: "Google Cloud Run, Firebase Hosting, Cloud Pub/Sub, Docker, GitHub Actions CI/CD.",
    color: "#D4956A",
  },
];

export default function TechStackPage() {
  return (
    <>
      <section className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-cream text-brand-600 text-sm font-medium rounded-full mb-4">
              Technology
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-brand-800">
              Enterprise-Grade Tech Stack
            </h1>
            <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
              Built entirely on Google Cloud with open-source foundations for
              maximum reliability and scalability.
            </p>
          </div>

          {/* Architecture layers */}
          <div className="max-w-3xl mx-auto space-y-4 mb-20">
            <h2 className="text-2xl font-bold text-brand-800 text-center mb-8">
              System Architecture
            </h2>
            {architecture.map((layer, i) => (
              <div
                key={i}
                className="bg-white rounded-[12px] border border-divider shadow-card p-5 flex items-center gap-4"
                style={{ borderLeftWidth: "4px", borderLeftColor: layer.color }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                  style={{ backgroundColor: layer.color }}
                >
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-brand-800">
                    {layer.layer}
                  </h3>
                  <p className="text-sm text-muted">{layer.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TechStackSection />
      <CTASection />
    </>
  );
}
