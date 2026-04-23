import type { Metadata } from "next";
import CTASection from "@/components/marketing/CTASection";
import { LuTarget as Target, LuHeart as Heart, LuLightbulb as Lightbulb, LuGlobe as Globe } from 'react-icons/lu';

export const metadata: Metadata = {
  title: "About — Stash",
  description:
    "Stash is building voice-native AI infrastructure for India's unorganized supply chain. Learn about our mission and team.",
};

const values = [
  {
    icon: Target,
    title: "Accessibility First",
    description:
      "Technology should work for everyone — regardless of literacy level, smartphone access, or technical skill. Voice is the most natural interface.",
  },
  {
    icon: Heart,
    title: "Built for India",
    description:
      "Every design decision is made with India's godown operators in mind — from multilingual support to GST compliance to Hinglish voice recognition.",
  },
  {
    icon: Lightbulb,
    title: "AI That Assists, Not Replaces",
    description:
      "Our AI augments human decision-making. Price negotiations require owner approval. Stock corrections are confirmed verbally. Humans stay in control.",
  },
  {
    icon: Globe,
    title: "Inclusive Growth",
    description:
      "Aligned with UN Sustainable Development Goals. We measure success not just in revenue but in the number of small businesses we empower.",
  },
];

const teamMembers = [
  {
    name: "Shweta Behera",
    role: "Founder & Lead Developer",
    bio: "Full-stack developer passionate about building AI solutions for India's unorganized sector. Previously worked on AgriSaathi, a multimodal RAG-powered Telegram bot for farmers.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-cream text-brand-600 text-sm font-medium rounded-full mb-4">
              About
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-brand-800">
              Transforming India&apos;s Supply Chain With Voice AI
            </h1>
            <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
              We&apos;re building the voice-native operating system for
              India&apos;s 12 million godown operators.
            </p>
          </div>

          {/* Mission */}
          <div className="max-w-3xl mx-auto mb-20">
            <div className="bg-surface rounded-2xl p-8 sm:p-12 border border-divider">
              <h2 className="text-2xl font-bold text-brand-800 mb-4">
                Our Mission
              </h2>
              <p className="text-muted leading-relaxed text-lg">
                Godown operations in India are still largely manual and
                unstructured. Operators rely on phone calls, paper registers, and
                memory. Existing software is too complex, resulting in low
                adoption. With limited real-time visibility and no predictive
                insights, businesses struggle to plan demand, manage payments,
                and maintain healthy cash flow.
              </p>
              <p className="text-muted leading-relaxed text-lg mt-4">
                <span className="notranslate" translate="no">Stash</span> transforms this by providing a voice-first, AI-powered
                platform that works through simple phone calls. No smartphone
                needed. No literacy required. No complex interfaces. Just call
                and talk — in Hindi, English, or Hinglish.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="mb-20">
            <h2 className="text-2xl font-bold text-brand-800 text-center mb-10">
              Our Values
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {values.map((value, i) => {
                const Icon = value.icon;
                return (
                  <div
                    key={i}
                    className="bg-white rounded-[12px] border border-divider shadow-card p-6 hover:shadow-[0_2px_8px_rgba(107,66,38,0.12),0_8px_24px_rgba(107,66,38,0.10)] transition-all duration-300"
                  >
                    <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon size={20} className="text-brand-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-brand-800 mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team */}
          <div className="mb-20">
            <h2 className="text-2xl font-bold text-brand-800 text-center mb-10">
              The Team
            </h2>
            <div className="max-w-md mx-auto">
              {teamMembers.map((member, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[12px] border border-divider shadow-card p-6 text-center"
                >
                  <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-brand-600">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-brand-800">
                    {member.name}
                  </h3>
                  <p className="text-sm text-brand-600 font-medium">
                    {member.role}
                  </p>
                  <p className="text-sm text-muted mt-3 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
