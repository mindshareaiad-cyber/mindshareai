import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Eye, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuthCallbackPage() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying...");
  const [subtitle, setSubtitle] = useState("");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            setStatus("error");
            setMessage("Verification failed");
            setSubtitle("The link may have expired. Please try again.");
            return;
          }

          if (type === "signup" || type === "email_change") {
            setStatus("success");
            setMessage("Email verified!");
            setSubtitle("You can close this tab and return to the original window. It will automatically continue to the next step.");
          } else if (type === "recovery") {
            setStatus("success");
            setMessage("Identity verified!");
            setSubtitle("Redirecting you to set a new password...");
            setTimeout(() => setLocation("/reset-password"), 1500);
          } else {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser && !currentUser.email_confirmed_at) {
              setStatus("success");
              setMessage("Please verify your email");
              setSubtitle("Redirecting...");
              setTimeout(() => setLocation("/verify-email"), 1500);
            } else if (currentUser) {
              try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                const headers: Record<string, string> = { "Content-Type": "application/json" };
                if (currentSession?.access_token) {
                  headers["Authorization"] = `Bearer ${currentSession.access_token}`;
                }
                const metadata = currentUser.user_metadata || {};
                await fetch("/api/user-profile", {
                  method: "POST",
                  headers,
                  body: JSON.stringify({
                    id: currentUser.id,
                    email: currentUser.email,
                    firstName: metadata.first_name || metadata.given_name || null,
                    lastName: metadata.last_name || metadata.family_name || null,
                    companyName: metadata.company_name || null,
                  }),
                });

                const subRes = await fetch(`/api/stripe/subscription/${currentUser.id}`, { headers });
                const subData = await subRes.json();

                setStatus("success");
                if (!subData.onboardingCompleted) {
                  setMessage("Welcome!");
                  setSubtitle("Redirecting to get you set up...");
                  setTimeout(() => setLocation("/onboarding"), 1500);
                } else if (!subData.hasActiveSubscription) {
                  setMessage("Welcome back!");
                  setSubtitle("Redirecting...");
                  setTimeout(() => setLocation("/payment"), 1500);
                } else {
                  setMessage("Signed in!");
                  setSubtitle("Redirecting...");
                  setTimeout(() => setLocation("/dashboard"), 1500);
                }
              } catch (err) {
                console.error("Profile setup error:", err);
                setStatus("success");
                setMessage("Signed in!");
                setSubtitle("Redirecting...");
                setTimeout(() => setLocation("/onboarding"), 1500);
              }
            } else {
              setStatus("error");
              setMessage("Something went wrong");
              setSubtitle("Please try signing in again.");
            }
          }
        } else {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser && !currentUser.email_confirmed_at) {
              setLocation("/verify-email");
            } else if (currentUser) {
              try {
                const headers: Record<string, string> = { "Content-Type": "application/json" };
                if (session.access_token) {
                  headers["Authorization"] = `Bearer ${session.access_token}`;
                }
                const metadata = currentUser.user_metadata || {};
                await fetch("/api/user-profile", {
                  method: "POST",
                  headers,
                  body: JSON.stringify({
                    id: currentUser.id,
                    email: currentUser.email,
                    firstName: metadata.first_name || metadata.given_name || null,
                    lastName: metadata.last_name || metadata.family_name || null,
                    companyName: metadata.company_name || null,
                  }),
                });

                const subRes = await fetch(`/api/stripe/subscription/${currentUser.id}`, { headers });
                const subData = await subRes.json();

                if (!subData.onboardingCompleted) {
                  setLocation("/onboarding");
                } else if (!subData.hasActiveSubscription) {
                  setLocation("/payment");
                } else {
                  setLocation("/dashboard");
                }
              } catch {
                setLocation("/onboarding");
              }
            } else {
              setLocation("/dashboard");
            }
          } else {
            setStatus("error");
            setMessage("Invalid link");
            setSubtitle("This link is invalid or has expired. Please try again.");
          }
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setStatus("error");
        setMessage("Something went wrong");
        setSubtitle("Please try signing in again.");
      }
    };

    handleAuthCallback();
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
          <CardHeader className="text-center">
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
                  <XCircle className="h-10 w-10 text-destructive" />
                </div>
              )}
            </div>
            <CardTitle className="text-xl" data-testid="text-callback-title">{message}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground" data-testid="text-callback-subtitle">{subtitle}</p>
            {status === "error" && (
              <div className="flex flex-col gap-2">
                <Button onClick={() => setLocation("/login")} data-testid="button-go-login">
                  Go to Sign In
                </Button>
                <Button variant="outline" onClick={() => setLocation("/signup")} data-testid="button-go-signup">
                  Create Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
