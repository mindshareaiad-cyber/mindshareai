import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Eye, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuthCallbackPage() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

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
            setMessage("Verification failed. The link may have expired.");
            return;
          }

          if (type === "recovery") {
            setStatus("success");
            setMessage("Password reset verified. Redirecting...");
            setTimeout(() => setLocation("/dashboard"), 1500);
          } else if (type === "signup" || type === "email_change") {
            setStatus("success");
            setMessage("Email confirmed. Redirecting...");
            setTimeout(() => setLocation("/onboarding"), 1500);
          } else {
            setStatus("success");
            setMessage("Verified successfully. Redirecting...");
            setTimeout(() => setLocation("/dashboard"), 1500);
          }
        } else {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setStatus("success");
            setMessage("Already signed in. Redirecting...");
            setTimeout(() => setLocation("/dashboard"), 1000);
          } else {
            setStatus("error");
            setMessage("Invalid or expired link. Please try again.");
          }
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setStatus("error");
        setMessage("Something went wrong. Please try signing in again.");
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
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              )}
              {status === "error" && (
                <XCircle className="h-12 w-12 text-destructive" />
              )}
            </div>
            <CardTitle className="text-xl">
              {status === "loading" && "Verifying..."}
              {status === "success" && "Verified!"}
              {status === "error" && "Verification Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground" data-testid="text-status-message">{message}</p>
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
