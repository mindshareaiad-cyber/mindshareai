import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-4" data-testid="text-privacy-title">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground mb-8">Last updated: 31 January 2026</p>

            <p className="text-muted-foreground mb-4">
              This Privacy Policy explains how Mindshare AI ("we", "us", "our") collects, uses, shares, and protects personal data when you use our website, products, and services (collectively, the "Service").
            </p>
            <p className="text-muted-foreground mb-4">
              We are committed to complying with applicable data protection laws, including the EU General Data Protection Regulation (GDPR), UK GDPR, and other relevant privacy regulations.
            </p>
            <p className="text-muted-foreground mb-8">
              By using the Service, you agree to the practices described in this Privacy Policy.
            </p>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Who we are and how to contact us</h2>
                <p className="text-muted-foreground mb-4">
                  <strong>Controller:</strong><br />
                  Mindshare AI
                </p>
                <p className="text-muted-foreground mb-4">
                  If you have questions or requests about this Privacy Policy or your personal data, you can contact us at:
                </p>
                <p className="text-muted-foreground">
                  Email: privacy@mindshare-ai.com
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. What we do</h2>
                <p className="text-muted-foreground mb-4">
                  We provide a software-as-a-service platform that measures how often brands are mentioned or recommended in AI-generated answers for specific, user-defined prompts and generates analytics and suggestions to improve "Answer Engine Optimization" (AEO) and AI visibility.
                </p>
                <p className="text-muted-foreground">
                  We use third-party AI model providers (e.g. large language model APIs) to process the prompts you define and to generate outputs that we analyse.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Data we collect</h2>
                
                <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Information you provide directly</h3>
                <p className="text-muted-foreground mb-4">When you use the Service or contact us, we may collect:</p>
                
                <p className="text-muted-foreground mb-2"><strong>Account information:</strong></p>
                <p className="text-muted-foreground mb-4">
                  Name, email address, password (hashed), organisation name, role, and other details you provide during registration or profile setup.
                </p>
                
                <p className="text-muted-foreground mb-2"><strong>Billing information:</strong></p>
                <p className="text-muted-foreground mb-4">
                  Subscription plan, billing address, VAT/Tax ID, and limited payment details (we do not store full card numbers; these are handled by our payment processor, e.g. Stripe).
                </p>
                
                <p className="text-muted-foreground mb-2"><strong>Customer content ("Your Data"):</strong></p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>Brand names, domains, competitor names.</li>
                  <li>Prompt sets and prompts you configure.</li>
                  <li>Notes, project names, and metadata.</li>
                </ul>
                
                <p className="text-muted-foreground mb-2"><strong>Support communications:</strong></p>
                <p className="text-muted-foreground mb-4">
                  Messages you send to us via email, in-app chat, or forms (including attachments).
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Information we collect automatically</h3>
                <p className="text-muted-foreground mb-4">When you access the Service, we may automatically collect:</p>
                
                <p className="text-muted-foreground mb-2"><strong>Usage data:</strong></p>
                <p className="text-muted-foreground mb-4">
                  Log data such as IP address, browser type, device information, pages viewed, time spent, clicks, referring URLs, and actions taken in the app (e.g. running a scan, creating a project).
                </p>
                
                <p className="text-muted-foreground mb-2"><strong>Cookies and similar technologies:</strong></p>
                <p className="text-muted-foreground mb-4">
                  We use necessary cookies to operate the site and may use analytics cookies to understand how the Service is used. You can control cookies via your browser settings and, where required by law, via our cookie banner/consent tool.
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Data from third parties</h3>
                <p className="text-muted-foreground mb-4">We may receive limited personal data from:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Payment processors (e.g. status of payments, last four digits of card, expiry date).</li>
                  <li>Authentication or identity providers if you sign in with SSO (e.g. email, name, organisation).</li>
                  <li>Analytics and error-tracking tools (e.g. aggregated usage stats, crash logs).</li>
                </ul>
                <p className="text-muted-foreground mt-4">We do not buy marketing lists.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. How we use your data and legal bases</h2>
                <p className="text-muted-foreground mb-4">
                  We process personal data only where we have a legal basis to do so (GDPR/UK GDPR).
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">4.1 To provide and operate the Service</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>Create and manage your account.</li>
                  <li>Authenticate you and secure access.</li>
                  <li>Run AEO scans and generate dashboards, reports, and suggestions.</li>
                  <li>Provide customer support.</li>
                </ul>
                <p className="text-muted-foreground mb-2"><strong>Legal bases:</strong></p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Performance of a contract (Art. 6(1)(b) GDPR).</li>
                  <li>Legitimate interests in operating a secure, useful service (Art. 6(1)(f) GDPR).</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">4.2 To process payments</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>Manage subscriptions and billing.</li>
                  <li>Handle upgrades, downgrades, and refunds where applicable.</li>
                </ul>
                <p className="text-muted-foreground mb-2"><strong>Legal bases:</strong></p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Performance of a contract.</li>
                  <li>Compliance with legal obligations (e.g. tax, accounting).</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">4.3 To improve and secure the Service</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>Monitor performance and usage.</li>
                  <li>Debug, prevent abuse, and enhance security.</li>
                  <li>Develop new features and user experiences.</li>
                  <li>Analyse aggregated, anonymised metrics across customers.</li>
                </ul>
                <p className="text-muted-foreground"><strong>Legal basis:</strong> Legitimate interests in improving and protecting the Service.</p>

                <h3 className="text-xl font-semibold mb-3 mt-6">4.4 To communicate with you</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>Send service-related emails (e.g. account, security, billing, feature updates).</li>
                  <li>Send marketing or product updates, where permitted.</li>
                </ul>
                <p className="text-muted-foreground mb-2"><strong>Legal bases:</strong></p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Performance of a contract / legitimate interests.</li>
                  <li>Consent, where required (e.g. for certain marketing communications). You can opt out at any time via unsubscribe links.</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">4.5 To comply with law</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>Respond to lawful requests by public authorities.</li>
                  <li>Meet legal, tax, and regulatory obligations.</li>
                </ul>
                <p className="text-muted-foreground"><strong>Legal basis:</strong> Compliance with legal obligations.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. How we use AI providers and APIs</h2>
                <p className="text-muted-foreground mb-4">
                  When you run a scan, the prompts and related configuration you define are sent to third-party AI model providers via their APIs. They generate responses, which we:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>Store in our systems.</li>
                  <li>Score and analyse to compute AEO metrics.</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  We use reputable providers with commercial terms that allow API-based processing for SaaS products. API providers may temporarily log requests and responses for abuse monitoring, security, or service quality under their own policies.
                </p>
                <p className="text-muted-foreground">
                  We do not have access to other users' private conversations in those AI tools, and our metrics are based only on the prompts our Platform sends.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. How we share personal data</h2>
                <p className="text-muted-foreground mb-4">We do not sell your personal data.</p>
                <p className="text-muted-foreground mb-4">We may share personal data with:</p>

                <p className="text-muted-foreground mb-2"><strong>Service providers / processors</strong></p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>Cloud hosting (e.g. infrastructure providers).</li>
                  <li>Database and storage providers.</li>
                  <li>Payment processors.</li>
                  <li>Email and notification services.</li>
                  <li>Analytics and error-tracking tools.</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  These processors are bound by contract to process data only on our instructions and with appropriate security.
                </p>

                <p className="text-muted-foreground mb-2"><strong>Professional advisers</strong></p>
                <p className="text-muted-foreground mb-4">
                  Lawyers, accountants, auditors, and insurers, where necessary.
                </p>

                <p className="text-muted-foreground mb-2"><strong>Authorities and legal requests</strong></p>
                <p className="text-muted-foreground mb-4">
                  If required by law, regulation, legal process, or to protect our rights, users, or the public.
                </p>

                <p className="text-muted-foreground mb-2"><strong>Business transfers</strong></p>
                <p className="text-muted-foreground mb-4">
                  If we are involved in a merger, acquisition, or sale of assets, personal data may be transferred as part of that transaction, subject to applicable laws and continued protection.
                </p>

                <p className="text-muted-foreground">
                  We may share aggregated and anonymised insights (for example, high-level benchmarks) that do not identify individuals or specific customers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. International transfers</h2>
                <p className="text-muted-foreground mb-4">
                  We may process and store personal data in countries other than the one you reside in (for example, if we use cloud infrastructure or processors located abroad).
                </p>
                <p className="text-muted-foreground mb-4">
                  Where required by law (e.g. EU/UK data leaving the EEA/UK), we implement appropriate safeguards, such as:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>Standard Contractual Clauses (SCCs) approved by the European Commission/UK authorities, or</li>
                  <li>Other lawful transfer mechanisms.</li>
                </ul>
                <p className="text-muted-foreground">
                  You can contact us for more information about cross-border transfer safeguards relevant to you.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Data retention</h2>
                <p className="text-muted-foreground mb-4">
                  We keep personal data only for as long as necessary for the purposes described above, including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>As long as you have an active account.</li>
                  <li>For a reasonable period after account closure to:
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li>Respond to queries,</li>
                      <li>Maintain records for legal, tax, or audit purposes,</li>
                      <li>Enforce our terms.</li>
                    </ul>
                  </li>
                </ul>
                <p className="text-muted-foreground">
                  We may retain aggregated or anonymised data that no longer identifies you, for analytics and Service improvement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Your rights</h2>
                <p className="text-muted-foreground mb-4">
                  Depending on your location and subject to applicable law, you may have rights including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                  <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
                  <li><strong>Erasure:</strong> Request deletion of your personal data (subject to legal obligations).</li>
                  <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances.</li>
                  <li><strong>Portability:</strong> Receive personal data you provided in a structured, machine-readable format and request transfer to another controller.</li>
                  <li><strong>Objection:</strong> Object to processing based on legitimate interests or to direct marketing.</li>
                  <li><strong>Withdraw consent:</strong> Where processing is based on consent, withdraw it at any time (this does not affect prior lawful processing).</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  To exercise these rights, contact us at privacy@mindshare-ai.com. We may need to verify your identity before responding.
                </p>
                <p className="text-muted-foreground">
                  If you are in the EEA/UK, you also have the right to lodge a complaint with your local data protection authority.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Additional information for California and similar jurisdictions</h2>
                <p className="text-muted-foreground mb-4">
                  If you are a resident of California or a similar jurisdiction with comparable rights:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>We do not sell or "share" personal information in the sense of selling data for monetary consideration or for cross-context behavioural advertising.</li>
                  <li>We act primarily as a "business" (controller) with respect to account data, and as a "service provider/processor" where we process data on behalf of customers.</li>
                </ul>
                <p className="text-muted-foreground mb-4">You may have the right to request:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>Access to categories and specific pieces of personal information we hold about you.</li>
                  <li>Deletion of personal information (subject to exceptions).</li>
                  <li>Correction of inaccurate information.</li>
                </ul>
                <p className="text-muted-foreground">
                  You may exercise these rights by contacting us at privacy@mindshare-ai.com.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Security</h2>
                <p className="text-muted-foreground mb-4">
                  We use reasonable technical and organisational measures to protect personal data, including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>Encrypted connections (HTTPS) for data in transit.</li>
                  <li>Access controls and authentication for internal tools.</li>
                  <li>Separation of environments and least-privilege access.</li>
                </ul>
                <p className="text-muted-foreground">
                  No method of transmission or storage is completely secure; we cannot guarantee absolute security. If we become aware of a data breach that is likely to result in a high risk to your rights and freedoms, we will notify you and/or relevant authorities as required by law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Children's data</h2>
                <p className="text-muted-foreground">
                  The Service is not directed to children under 16, and we do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us so we can delete it.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">13. Changes to this Privacy Policy</h2>
                <p className="text-muted-foreground mb-4">
                  We may update this Privacy Policy from time to time. When we do, we will post the updated version on our website and update the "Last updated" date.
                </p>
                <p className="text-muted-foreground">
                  If we make material changes, we will use reasonable efforts to notify you (for example, by email or in-app notice). Your continued use of the Service after the changes take effect means you accept the updated Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">14. Contact us</h2>
                <p className="text-muted-foreground mb-4">
                  If you have questions, concerns, or requests related to this Privacy Policy or your personal data, please contact:
                </p>
                <p className="text-muted-foreground">
                  Mindshare AI<br />
                  Email: privacy@mindshare-ai.com
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
