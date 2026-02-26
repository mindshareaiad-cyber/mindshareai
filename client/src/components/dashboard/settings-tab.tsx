import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  CreditCard,
  LogOut,
  ExternalLink,
  Loader2,
  Shield,
  Mail,
  Building2,
  Crown,
  Zap,
} from "lucide-react";

interface SubscriptionInfo {
  hasActiveSubscription: boolean;
  subscriptionStatus: string;
  planId?: string;
  onboardingCompleted: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  websiteUrl: string | null;
  industry: string | null;
  companySize: string | null;
  subscriptionStatus: string | null;
  createdAt: string;
}

const PLAN_DISPLAY: Record<string, { name: string; icon: typeof Crown; color: string }> = {
  starter: { name: "Starter", icon: CreditCard, color: "bg-blue-500/10 text-blue-600" },
  growth: { name: "Growth", icon: Zap, color: "bg-purple-500/10 text-purple-600" },
  pro: { name: "Pro", icon: Crown, color: "bg-amber-500/10 text-amber-600" },
};

export function SettingsTab() {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [portalLoading, setPortalLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { data: subscription } = useQuery<SubscriptionInfo>({
    queryKey: ["/api/stripe/subscription", user?.id],
    enabled: !!user,
  });

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/user-profile", user?.id],
    queryFn: async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      const res = await fetch(`/api/user-profile/${user!.id}`, {
        headers: { "Authorization": `Bearer ${s?.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: !!user,
  });

  const planId = subscription?.planId || "starter";
  const planDisplay = PLAN_DISPLAY[planId] || PLAN_DISPLAY.starter;
  const PlanIcon = planDisplay.icon;

  const handleManageSubscription = async () => {
    if (!user) return;
    setPortalLoading(true);
    try {
      const response = await apiRequest("POST", "/api/stripe/customer-portal", {
        userId: user.id,
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not open billing portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      queryClient.clear();
      setLocation("/");
    } catch {
      setLoggingOut(false);
    }
  };

  const statusLabel = subscription?.subscriptionStatus === "trialing"
    ? "Free Trial"
    : subscription?.subscriptionStatus === "active"
    ? "Active"
    : subscription?.subscriptionStatus || "Inactive";

  const statusColor = subscription?.subscriptionStatus === "active" || subscription?.subscriptionStatus === "trialing"
    ? "bg-green-500/10 text-green-600"
    : "bg-red-500/10 text-red-600";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold" data-testid="text-settings-title">Settings</h2>
        <p className="text-muted-foreground">Manage your account, subscription, and preferences.</p>
      </div>

      <Card data-testid="card-account">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium" data-testid="text-account-name">
                {profile?.firstName && profile?.lastName
                  ? `${profile.firstName} ${profile.lastName}`
                  : user?.user_metadata?.full_name || user?.email?.split("@")[0] || "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" /> Email
              </p>
              <p className="font-medium" data-testid="text-account-email">{user?.email || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" /> Company
              </p>
              <p className="font-medium" data-testid="text-account-company">
                {profile?.companyName || "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Industry</p>
              <p className="font-medium" data-testid="text-account-industry">
                {profile?.industry || "—"}
              </p>
            </div>
          </div>
          {profile?.websiteUrl && (
            <div>
              <p className="text-sm text-muted-foreground">Website</p>
              <a
                href={profile.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                data-testid="link-account-website"
              >
                {profile.websiteUrl}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      <Card data-testid="card-subscription">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>Manage your plan and billing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${planDisplay.color}`}>
                <PlanIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold" data-testid="text-plan-name">{planDisplay.name} Plan</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusColor} data-testid="badge-subscription-status">
                    {statusLabel}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={portalLoading}
              data-testid="button-manage-subscription"
            >
              {portalLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              Manage Billing
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-security">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Account security and session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Authentication</p>
            <p className="font-medium" data-testid="text-auth-provider">
              {user?.app_metadata?.provider === "google" ? "Google Account" : "Email & Password"}
            </p>
          </div>

          <Separator />

          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={loggingOut}
            data-testid="button-logout"
          >
            {loggingOut ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
