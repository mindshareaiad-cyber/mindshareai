import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Loader2, Check, CreditCard, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const PRICE_ID = "price_1SqzGDB7Z6HEJr4F7lSh2lcU";

export default function PaymentPage() {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to subscribe.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/stripe/create-checkout-session", {
        userId: user.id,
        email: user.email,
        priceId: PRICE_ID,
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
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setLocation("/login");
  };

  const features = [
    "AI visibility scans across multiple engines",
    "Track competitor share of voice",
    "Gap analysis & AEO recommendations",
    "Organize prompts by persona and funnel stage",
    "SEO readiness assessment",
    "14-day free trial included",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2" data-testid="logo">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Eye className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl">Mindshare AI</span>
          </div>
        </div>

        <Card className="border-2">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Start Your Subscription</CardTitle>
            <CardDescription>
              Get full access to AI visibility tracking and optimization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-lg font-semibold text-muted-foreground">
                Plans from
              </div>
              <div className="text-4xl font-bold">
                $29<span className="text-lg font-normal text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                14-day free trial &middot; Cancel anytime
              </p>
            </div>

            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={handleSubscribe}
              className="w-full"
              size="lg"
              disabled={isLoading}
              data-testid="button-subscribe"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting to checkout...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Subscribe Now
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span>Powered by</span>
              <span className="font-semibold">Stripe</span>
              <span>|</span>
              <span>Secure payment</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              variant="ghost"
              className="w-full"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out and return later
            </Button>
          </CardFooter>
        </Card>

        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Step 1: Business Info</span>
          </div>
          <div className="h-px w-4 bg-border" />
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Step 2: Payment</span>
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
