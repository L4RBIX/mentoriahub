import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { IntroSection } from "@/components/IntroSection";
import { FintechBadges } from "@/components/FintechBadges";
import { FeaturesGrid } from "@/components/FeaturesGrid";
import { ClientLogos } from "@/components/ClientLogos";
import { CommandCenter } from "@/components/CommandCenter";
import { FeatureTabs } from "@/components/FeatureTabs";
import { RolesSection } from "@/components/RolesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { WhyPremierSection } from "@/components/WhyPremierSection";
import { AssociationsPricing } from "@/components/AssociationsPricing";
import { FAQSection } from "@/components/FAQSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <IntroSection />
        <FintechBadges />
        <FeaturesGrid />
        <ClientLogos />
        <CommandCenter />
        <FeatureTabs />
        <RolesSection />
        <TestimonialsSection />
        <WhyPremierSection />
        <AssociationsPricing />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
