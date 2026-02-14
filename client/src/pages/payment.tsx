import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Loader2, Check, CreditCard, LogOut, Zap, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PriceIds {
  starter: string | null;
  growth: string | null;
  pro: string | null;
}

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    description: "Perfect for getting started",
    icon: CreditCard,
    features: [
      "1 project",
      "50 prompts",
      "1 AI engine (ChatGPT)",
      "10 scans per month",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 79,
    popular: true,
    description: "For growing businesses",
    icon: Zap,
    features: [
      "5 projects",
      "200 prompts",
      "2 AI engines (ChatGPT + Gemini)",
      "50 scans per month",
      "Gap analysis",
      "AEO suggestions",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 199,
    description: "For teams & agencies",
    icon: Crown,
    features: [
      "50 projects",
      "1,000 prompts",
      "All 5 AI engines",
      "500 scans per month",
      "Gap analysis",
      "AEO suggestions",
      "Priority support",
    ],
  },
];

export default function PaymentPage() {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const { data: priceIds } = useQuery<PriceIds>({
    queryKey: ["/api/stripe/price-ids"],
  });

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to subscribe.",
        variant: "destructive",
      });
      return;
    }

    const priceId = priceIds?.[planId as keyof PriceIds];
    if (!priceId) {
      toast({
        title: "Unavailable",
        description: "This plan is not available yet. Please try another plan.",
        variant: "destructive",
      });
      return;
    }

    setLoadingPlan(planId);
    try {
      const response = await apiRequest("POST", "/api/stripe/create-checkout-session", {
        userId: user.id,
        email: user.email,
        priceId,
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
      setLoadingPlan(null);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 py-12">
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2" data-testid="logo">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Eye className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl">Mindshare AI</span>
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
          <p className="text-muted-foreground">
            Start tracking your brand's AI visibility today
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            const isAvailable = !!priceIds?.[plan.id as keyof PriceIds];
            const isLoading = loadingPlan === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col ${plan.popular ? "border-primary border-2" : ""}`}
                data-testid={`card-plan-${plan.id}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge data-testid="badge-popular">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-3 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <PlanIcon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-3">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-3 flex-1 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    className="w-full"
                    size="lg"
                    variant={plan.popular ? "default" : "outline"}
                    disabled={isLoading || !isAvailable || !!loadingPlan}
                    data-testid={`button-subscribe-${plan.id}`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redirecting...
                      </>
                    ) : !isAvailable ? (
                      "Coming Soon"
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Get Started
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>Powered by</span>
            <span className="font-semibold">Stripe</span>
            <span>|</span>
            <span>Secure payment</span>
            <span>|</span>
            <span>Cancel anytime</span>
          </div>

          <Button
            variant="ghost"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out and return later
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Step 1: Business Info</span>
          </div>
          <div className="h-px w-4 bg-border" />
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Step 2: Choose Plan</span>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6">
          By subscribing, you agree to our{" "}
          <Link href="/terms" className="text-foreground hover:underline" data-testid="link-terms">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-foreground hover:underline" data-testid="link-privacy">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
