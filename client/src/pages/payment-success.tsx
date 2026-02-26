import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, CheckCircle2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export default function PaymentSuccessPage() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your payment...");
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const verifyAndRedirect = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          let resolved = false;
          await new Promise<void>((resolve) => {
            const timeout = setTimeout(() => {
              if (!resolved) { resolved = true; resolve(); }
            }, 5000);

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
              if (s && !resolved) {
                resolved = true;
                clearTimeout(timeout);
                subscription.unsubscribe();
                resolve();
              }
            });
          });
        }

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        const { data: { user } } = await supabase.auth.getUser();

        if (!currentSession || !user) {
          setStatus("error");
          setMessage("Session expired. Please sign in to continue.");
          return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get("session_id");

        if (!sessionId) {
          setStatus("error");
          setMessage("No payment session found.");
          return;
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentSession.access_token}`,
        };

        const response = await fetch("/api/stripe/verify-payment", {
          method: "POST",
          headers,
          body: JSON.stringify({ sessionId, userId: user.id }),
        });

        const data = await response.json();

        if (data.success) {
          queryClient.invalidateQueries({ queryKey: ["/api/stripe/subscription"] });
          queryClient.invalidateQueries({ queryKey: ["/api/stripe/subscription", user.id] });

          setStatus("success");
          setMessage("Payment successful! Welcome to Mindshare AI.");

          setTimeout(() => setLocation("/dashboard"), 2000);
        } else {
          setStatus("error");
          setMessage("Payment verification failed. If you were charged, please contact support.");
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setStatus("error");
        setMessage("Something went wrong verifying your payment.");
      }
    };

    verifyAndRedirect();
  }, [setLocation]);

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
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              {status === "loading" && (
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              )}
              {status === "success" && (
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
              )}
              {status === "error" && (
                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-destructive" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl font-bold" data-testid="text-payment-title">
              {status === "loading" ? "Verifying Payment" : status === "success" ? "Payment Successful!" : "Verification Issue"}
            </CardTitle>
            <CardDescription data-testid="text-payment-message">{message}</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            {status === "success" && (
              <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
            )}
            {status === "error" && (
              <div className="flex flex-col gap-2">
                <Button onClick={() => setLocation("/dashboard")} data-testid="button-go-dashboard">
                  Go to Dashboard
                </Button>
                <Button variant="outline" onClick={() => setLocation("/login")} data-testid="button-go-login">
                  Sign In Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
