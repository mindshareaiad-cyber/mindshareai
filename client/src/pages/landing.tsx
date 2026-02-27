import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { Header } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { SolutionsSection } from "@/components/landing/solutions-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { ROISection } from "@/components/landing/roi-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && user) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  if (!loading && user) {
    return null;
  }

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
