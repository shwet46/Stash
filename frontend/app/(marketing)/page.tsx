import HeroSection from "@/components/marketing/HeroSection";
import ProblemSection from "@/components/marketing/ProblemSection";
import SolutionSection from "@/components/marketing/SolutionSection";
import FeaturesGrid from "@/components/marketing/FeaturesGrid";
import HowItWorksSection from "@/components/marketing/HowItWorksSection";
import TechStackSection from "@/components/marketing/TechStackSection";
import SDGSection from "@/components/marketing/SDGSection";
import CTASection from "@/components/marketing/CTASection";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesGrid />
      <HowItWorksSection />
      <TechStackSection />
      <SDGSection />
      <CTASection />
    </>
  );
}
