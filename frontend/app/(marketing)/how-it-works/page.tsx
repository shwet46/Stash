import type { Metadata } from "next";
import HowItWorksSection from "@/components/marketing/HowItWorksSection";
import CTASection from "@/components/marketing/CTASection";

export const metadata: Metadata = {
  title: "How It Works — Stash",
  description:
    "See how Stash transforms godown operations with voice-first AI. Four simple steps from phone call to automated action.",
};

const voiceExamples = [
  {
    transcript: '"Chana Dal 500 kg aaya hai, lot number 2847"',
    language: "Hinglish",
    intent: "Stock Arrival",
    action: "Inventory updated: Chana Dal +500 kg, Lot #2847 recorded",
  },
  {
    transcript: '"Ramesh bhai ka order kya status hai?"',
    language: "Hindi",
    intent: "Order Status",
    action:
      "Found order #STH-4821 for Ramesh: 200 kg Rice, dispatched, ETA tomorrow",
  },
  {
    transcript: '"Sugar ka stock kitna bacha hai?"',
    language: "Hinglish",
    intent: "Stock Query",
    action:
      "Current stock: Sugar 45 kg (below threshold 100 kg). Auto-reorder triggered.",
  },
  {
    transcript: '"Place order for 1000 kg wheat flour from primary supplier"',
    language: "English",
    intent: "Order Placed",
    action:
      "Order created. Calling Supplier: Anand Trading Co. Estimated delivery: 5 days.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-cream text-brand-600 text-sm font-medium rounded-full mb-4">
              How It Works
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-brand-800">
              From Voice to Action in Seconds
            </h1>
            <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
              See how a simple phone call powers an entire supply chain
              operation.
            </p>
          </div>
        </div>
      </section>

      <HowItWorksSection />

      {/* Voice Examples */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-brand-800">
              Voice Command Examples
            </h2>
            <p className="mt-4 text-muted max-w-xl mx-auto">
              Real examples of how operators interact with Stash using natural
              voice commands.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {voiceExamples.map((ex, i) => (
              <div
                key={i}
                className="bg-white rounded-[12px] border border-divider shadow-card p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-cream text-brand-600 text-xs font-medium rounded-full">
                    {ex.language}
                  </span>
                  <span className="px-2 py-0.5 bg-brand-50 text-brand-500 text-xs font-medium rounded-full">
                    {ex.intent}
                  </span>
                </div>
                <p className="text-brand-800 font-medium italic mb-4">
                  {ex.transcript}
                </p>
                <div className="flex items-start gap-2 bg-green-50 rounded-[8px] p-3">
                  <span className="text-success font-bold text-sm mt-0.5">
                    →
                  </span>
                  <p className="text-sm text-success">{ex.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
