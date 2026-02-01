import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function PaymentSuccessPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!user) return;

      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get("session_id");

      if (!sessionId) {
        setVerifying(false);
        return;
      }

      try {
        const response = await apiRequest("POST", "/api/stripe/verify-payment", {
          sessionId,
          userId: user.id,
        });

        const data = await response.json();
        setSuccess(data.success);
      } catch (error) {
        console.error("Error verifying payment:", error);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [user]);

  const handleContinue = () => {
    setLocation("/dashboard");
  };

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
            {verifying ? (
              <>
                <div className="flex justify-center mb-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Verifying your payment...</CardTitle>
                <CardDescription>
                  Please wait while we confirm your subscription.
                </CardDescription>
              </>
            ) : success ? (
              <>
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">Payment successful!</CardTitle>
                <CardDescription>
                  Your subscription is now active. Welcome to Mindshare AI!
                </CardDescription>
              </>
            ) : (
              <>
                <CardTitle className="text-2xl font-bold">Payment verification failed</CardTitle>
                <CardDescription>
                  We couldn't verify your payment. Please contact support if you were charged.
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            {!verifying && success && (
              <Button
                onClick={handleContinue}
                className="w-full"
                size="lg"
                data-testid="button-continue-dashboard"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {!verifying && !success && (
              <Button
                onClick={() => setLocation("/payment")}
                className="w-full"
                size="lg"
                variant="outline"
                data-testid="button-try-again"
              >
                Try Again
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
