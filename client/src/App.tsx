import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import DashboardPage from "@/pages/dashboard";
import LoginPage from "@/pages/login";
import SignUpPage from "@/pages/signup";
import OnboardingPage from "@/pages/onboarding";
import PaymentPage from "@/pages/payment";
import PaymentSuccessPage from "@/pages/payment-success";
import FeaturesPage from "@/pages/features";
import PricingPage from "@/pages/pricing";
import AboutPage from "@/pages/about";
import PrivacyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";
import BlogPage from "@/pages/blog";
import BlogPostPage from "@/pages/blog-post";
import ContactPage from "@/pages/contact";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscriptionStatus: string;
  onboardingCompleted: boolean;
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/stripe/subscription", user?.id],
    enabled: !!user,
  });

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
      return;
    }

    if (user && !subscriptionLoading && subscriptionData) {
      // If onboarding not completed, redirect to onboarding
      if (!subscriptionData.onboardingCompleted) {
        setLocation("/onboarding");
        return;
      }
      
      // If no active subscription, redirect to payment
      if (!subscriptionData.hasActiveSubscription) {
        setLocation("/payment");
        return;
      }
    }
  }, [user, loading, subscriptionData, subscriptionLoading, setLocation]);

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Only show dashboard if onboarding is complete and subscription is active
  if (!subscriptionData?.onboardingCompleted || !subscriptionData?.hasActiveSubscription) {
    return null;
  }

  return <Component />;
}

function OnboardingRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <Component />;
}

function PaymentRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/stripe/subscription", user?.id],
    enabled: !!user,
  });

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
      return;
    }

    // If user has active subscription, redirect to dashboard
    if (user && !subscriptionLoading && subscriptionData?.hasActiveSubscription) {
      setLocation("/dashboard");
    }
  }, [user, loading, subscriptionData, subscriptionLoading, setLocation]);

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/features" component={FeaturesPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignUpPage} />
      <Route path="/onboarding">
        <OnboardingRoute component={OnboardingPage} />
      </Route>
      <Route path="/payment">
        <PaymentRoute component={PaymentPage} />
      </Route>
      <Route path="/payment-success">
        <OnboardingRoute component={PaymentSuccessPage} />
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={DashboardPage} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
