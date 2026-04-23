import type { Metadata } from "next";
import FeaturesGrid from "@/components/marketing/FeaturesGrid";
import CTASection from "@/components/marketing/CTASection";

export const metadata: Metadata = {
  title: "Features — Stash",
  description:
    "Explore all features of Stash: voice-first inventory management, AI demand forecasting, supplier automation, billing, and more.",
};

const detailedFeatures = [
  {
    title: "Voice-First Operations",
    description:
      "The entire system runs over phone calls. Operators manage inventory, orders, and tasks using simple multilingual voice commands. No app installation, no internet on the operator's end, no literacy requirement.",
    highlights: [
      "Hindi, English, and Hinglish support",
      "Feature phone compatible",
      "30-second average interaction time",
      "Natural language understanding via Gemini 3.0 Flash",
    ],
  },
  {
    title: "Smart Inventory Management",
    description:
      "Real-time stock tracking with voice-based updates. When an operator says 'Chana Dal 500 kg aaya hai', the system automatically updates inventory, checks expiry dates, and flags any discrepancies.",
    highlights: [
      "Voice-based stock entry and correction",
      "Automatic discrepancy detection",
      "Expiry date tracking",
      "Multi-warehouse consolidated view",
    ],
  },
  {
    title: "AI Stock Intelligence",
    description:
      "Prophet models forecast demand 14 days ahead. XGBoost classifies disruption risk based on weather data, seasonal patterns, and historical trends. Auto-reorder when stock hits threshold.",
    highlights: [
      "14-day demand forecasting",
      "Disruption risk classification",
      "Weather-aware predictions (IMD data)",
      "Automatic supplier outreach on low stock",
    ],
  },
  {
    title: "Supplier Automation",
    description:
      "Automated voice calls to suppliers for price checks, availability, and order placement. Priority-based supplier chains ensure the best supplier is contacted first, with automatic fallback.",
    highlights: [
      "Priority-based supplier selection",
      "Automated outbound calls via Twilio",
      "Price negotiation with 4-tier AI strategy",
      "Supplier performance tracking",
    ],
  },
  {
    title: "Billing & Payment Tracking",
    description:
      "GST-compliant invoices generated automatically via WeasyPrint. Credit tracked per buyer with configurable limits and due dates. Payment reminders sent via Telegram in the buyer's preferred language.",
    highlights: [
      "Auto-generated GST invoices (PDF)",
      "Per-buyer credit tracking",
      "Telegram payment reminders",
      "Multi-language invoice support",
    ],
  },
  {
    title: "Delivery & Logistics",
    description:
      "End-to-end delivery tracking with Google Maps Routes API for ETA calculation. Automated status updates to buyers via Telegram. Real-time location tracking for dispatched orders.",
    highlights: [
      "Google Maps ETA calculation",
      "Automated dispatch notifications",
      "Delivery confirmation tracking",
      "Route optimization suggestions",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      <section className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-cream text-brand-600 text-sm font-medium rounded-full mb-4">
              Features
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-brand-800">
              Powerful Features for Modern Godowns
            </h1>
            <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
              Every feature designed for voice-first interaction and zero
              learning curve.
            </p>
          </div>

          <div className="space-y-8">
            {detailedFeatures.map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-[12px] border border-divider shadow-card p-8 hover:shadow-[0_2px_8px_rgba(107,66,38,0.12),0_8px_24px_rgba(107,66,38,0.10)] transition-all duration-300"
                style={{
                  borderLeftWidth: "4px",
                  borderLeftColor:
                    i % 3 === 0
                      ? "#6B4226"
                      : i % 3 === 1
                      ? "#8B5E3C"
                      : "#D4956A",
                }}
              >
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <h2 className="text-xl font-semibold text-brand-800 mb-3">
                      {feature.title}
                    </h2>
                    <p className="text-muted leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-brand-600 mb-3">
                      Key Highlights
                    </h4>
                    <ul className="space-y-2">
                      {feature.highlights.map((h, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 text-sm text-brand-700"
                        >
                          <span className="w-1.5 h-1.5 bg-brand-400 rounded-full mt-1.5 flex-shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeaturesGrid />
      <CTASection />
    </>
  );
}
