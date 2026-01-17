import { Header } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { SolutionsSection } from "@/components/landing/solutions-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { ROISection } from "@/components/landing/roi-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <SolutionsSection />
        <section id="features">
          <FeaturesSection />
        </section>
        <ROISection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
