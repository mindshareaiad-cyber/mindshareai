import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Eye, Loader2, Mail, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

export default function VerifyEmailPage() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
      return;
    }
  }, [user, loading, setLocation]);

  useEffect(() => {
    if (user?.email_confirmed_at) {
      setLocation("/onboarding");
      return;
    }

    if (!user) return;

    const interval = setInterval(async () => {
      const { data: { user: freshUser } } = await supabase.auth.getUser();
      if (freshUser?.email_confirmed_at) {
        setVerified(true);
        clearInterval(interval);
        setTimeout(() => setLocation("/onboarding"), 2000);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [user, setLocation]);

  const handleResendEmail = async () => {
    if (!user?.email) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
      });
      if (error) throw error;
      toast({
        title: "Email sent",
        description: "A new verification email has been sent. Please check your inbox.",
      });
    } catch (err) {
      toast({
        title: "Failed to resend",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    }
    setResending(false);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2" data-testid="logo">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Eye className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl">Mindshare AI</span>
          </div>
        </div>

        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {verified ? (
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              )}
            </div>
            <CardTitle className="text-xl" data-testid="text-verify-title">
              {verified ? "Email Verified!" : "Check your email"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {verified ? (
              <>
                <p className="text-muted-foreground" data-testid="text-verified-message">
                  Your email has been verified. Redirecting you to set up your business profile...
                </p>
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
              </>
            ) : (
              <>
                <p className="text-muted-foreground" data-testid="text-verify-message">
                  We've sent a verification link to{" "}
                  <span className="font-medium text-foreground">{user?.email || "your email"}</span>.
                  Click the link in the email to verify your account.
                </p>
                <div className="bg-muted/50 rounded-md p-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Waiting for verification...</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  This page will automatically continue once you verify your email.
                </p>
                <Button
                  variant="outline"
                  onClick={handleResendEmail}
                  disabled={resending}
                  className="w-full"
                  data-testid="button-resend-email"
                >
                  {resending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend verification email
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-sm font-medium text-foreground">Verify Email</span>
          </div>
          <div className="h-px w-4 bg-border" />
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-muted" />
            <span className="text-sm text-muted-foreground">Business Info</span>
          </div>
          <div className="h-px w-4 bg-border" />
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-muted" />
            <span className="text-sm text-muted-foreground">Choose Plan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
