import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-8" data-testid="text-terms-title">
              Terms of Service
            </h1>
            <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing or using AEO Dashboard, you agree to be bound by these Terms of
                  Service. If you do not agree to these terms, please do not use our service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                <p className="text-muted-foreground">
                  AEO Dashboard provides tools for monitoring brand visibility in AI-powered
                  search results. Our service includes AI visibility scoring, competitor analysis,
                  gap analysis, and content optimization suggestions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
                <p className="text-muted-foreground mb-4">To use our service, you must:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Be at least 18 years old or have parental consent</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Subscription and Billing</h2>
                <p className="text-muted-foreground mb-4">
                  Our service is offered through tiered subscription plans:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Starter: $29/month - 1 project, 50 prompts, 10 scans</li>
                  <li>Growth: $79/month - 5 projects, 200 prompts, 50 scans</li>
                  <li>Pro: $199/month - 50 projects, 1000 prompts, 500 scans</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Subscriptions automatically renew unless cancelled. Refunds are handled on a
                  case-by-case basis.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use</h2>
                <p className="text-muted-foreground mb-4">You agree not to:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Use the service for any unlawful purpose</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the service</li>
                  <li>Resell or redistribute the service without permission</li>
                  <li>Use automated systems to abuse the service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
                <p className="text-muted-foreground">
                  The service, including all content, features, and functionality, is owned by AEO
                  Dashboard and protected by copyright and other intellectual property laws. You
                  retain ownership of any data you submit to the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Data and Privacy</h2>
                <p className="text-muted-foreground">
                  Your use of the service is also governed by our Privacy Policy. We store AI
                  responses and scan results to provide historical analysis. You can request
                  deletion of your data at any time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Disclaimer of Warranties</h2>
                <p className="text-muted-foreground">
                  The service is provided "as is" without warranties of any kind. We do not
                  guarantee that AI visibility scores will result in increased traffic or sales.
                  AI assistant responses may change without notice and are outside our control.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  To the maximum extent permitted by law, AEO Dashboard shall not be liable for
                  any indirect, incidental, special, consequential, or punitive damages arising
                  from your use of the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify these terms at any time. We will notify you of
                  material changes by email or through the service. Continued use after changes
                  constitutes acceptance.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
                <p className="text-muted-foreground">
                  We may terminate or suspend your account at any time for violations of these
                  terms. You may cancel your account at any time through your account settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Contact</h2>
                <p className="text-muted-foreground">
                  For questions about these Terms of Service, please contact us at
                  legal@aeodashboard.com.
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
