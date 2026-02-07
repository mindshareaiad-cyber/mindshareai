import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-4" data-testid="text-terms-title">
              Terms of Service
            </h1>
            <p className="text-muted-foreground mb-8">Last updated: 31 January 2026</p>

            <p className="text-muted-foreground mb-8">
              Please read these Terms of Service ("Terms") carefully before using our website, products, and services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.
            </p>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Who we are</h2>
                <p className="text-muted-foreground">
                  Mindshare AI provides a software-as-a-service platform that measures how often brands are mentioned or recommended in AI-generated answers for specific, user-defined prompts and generates analytics and suggestions to improve "Answer Engine Optimization" (AEO) and AI visibility (the "Platform").
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
                <p className="text-muted-foreground mb-4">You may use the Service only if you:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Are at least 18 years old; and</li>
                  <li>Have the authority to enter into these Terms on behalf of yourself or the entity you represent.</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  By using the Service, you represent and warrant that you meet these requirements.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Accounts and access</h2>
                <p className="text-muted-foreground mb-4">You are responsible for:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Providing accurate registration information.</li>
                  <li>Keeping your login credentials confidential.</li>
                  <li>All activity that occurs under your account.</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  We may suspend or terminate accounts that violate these Terms or pose a risk to the Service or other users.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Description of the Service</h2>
                <p className="text-muted-foreground mb-4">The Service allows you to:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Create projects for one or more brands.</li>
                  <li>Define sets of natural-language prompts (e.g. "best CRM for startups in the UK").</li>
                  <li>Run scans where the Platform sends those prompts to third-party AI models via their APIs.</li>
                  <li>Receive analytics on whether and how often your brand and selected competitors are mentioned or recommended in the AI responses.</li>
                  <li>View reports, dashboards, and generated content suggestions intended to support AEO and AI visibility strategies.</li>
                </ul>
                <p className="text-muted-foreground mt-4 mb-2">You acknowledge that:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>The Service does not access or analyse private end-user conversations inside AI tools.</li>
                  <li>All metrics are derived only from prompts run through our controlled scanning process.</li>
                  <li>AI outputs are probabilistic and may vary over time and across runs.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Third-party services</h2>
                <p className="text-muted-foreground mb-4">
                  The Platform integrates with third-party AI providers and other services (for example, large language model APIs and payment processors).
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>We do not control or guarantee the availability, accuracy, or behaviour of any third-party services.</li>
                  <li>Your use of such services may be subject to separate terms and privacy policies with those providers.</li>
                  <li>We may change or replace third-party providers at any time if required for technical, commercial, legal, or security reasons.</li>
                  <li>You are responsible for ensuring that your use of the Service, including any data you submit, complies with applicable third-party terms.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Plans, pricing, and billing</h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>We offer multiple subscription plans (such as Starter, Growth, and Pro), each with different limits on features, prompts, projects, scans, and engines.</li>
                  <li>Current pricing and plan details are displayed on our website and may change from time to time.</li>
                  <li>Unless otherwise stated, fees are charged in advance on a recurring basis and are non-refundable, including for partial periods or unused capacity.</li>
                  <li>By upgrading or downgrading your plan, you authorise us and our payment provider to adjust your billing accordingly.</li>
                  <li>We may offer free trials or promotions at our discretion and may modify or discontinue such offers at any time.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Usage limits and fair use</h2>
                <p className="text-muted-foreground mb-4">
                  Your use of the Service is subject to the usage limits associated with your subscription plan, including but not limited to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Maximum number of projects and prompts.</li>
                  <li>Maximum number of scans per billing period.</li>
                  <li>Maximum number and type of AI engines available.</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  We may implement additional reasonable technical or fair-use safeguards (for example, rate limiting or soft caps) to protect the Platform and other customers. We will act in good faith and aim not to unreasonably restrict legitimate use.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Data and content</h2>
                
                <h3 className="text-xl font-semibold mb-3 mt-6">8.1 Your data</h3>
                <p className="text-muted-foreground mb-4">
                  "Your Data" means prompts, brand names, domains, competitor names, configuration, and other information you submit to the Service, as well as the metrics we calculate specifically for your account.
                </p>
                <p className="text-muted-foreground mb-4">
                  You retain all rights to Your Data. You grant us a non-exclusive, worldwide licence to store, process, and use Your Data solely:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>To provide, maintain, and improve the Service.</li>
                  <li>To prevent or address technical issues or security incidents.</li>
                  <li>To comply with legal obligations.</li>
                </ul>
                <p className="text-muted-foreground mt-4">We will not sell Your Data to third parties.</p>

                <h3 className="text-xl font-semibold mb-3 mt-6">8.2 AI outputs and derived metrics</h3>
                <p className="text-muted-foreground mb-4">
                  The Service stores AI responses received from third-party models for the prompts you run, along with scoring and analytics derived from those responses.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Subject to applicable third-party terms, you may use these outputs and metrics for your internal business purposes, marketing analysis, and reporting.</li>
                  <li>We may use aggregated and/or anonymised data (that does not identify you or your brands) to improve the Service, develop features, and publish benchmarks or research.</li>
                  <li>Because AI models are probabilistic and may be updated, we do not guarantee that responses or metrics will remain identical across time or runs.</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">8.3 Prohibited data</h3>
                <p className="text-muted-foreground mb-4">You must not submit to the Service:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Sensitive personal data (such as health, financial, or biometric data).</li>
                  <li>Personal data of children.</li>
                  <li>Any data that you do not have the right to use or disclose.</li>
                  <li>Content that is illegal, infringing, defamatory, or otherwise violates applicable law or third-party rights.</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  We may remove or restrict access to any data that we believe breaches these requirements.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Acceptable use</h2>
                <p className="text-muted-foreground mb-4">You agree not to:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Use the Service for any unlawful purpose or in violation of any applicable law or regulation.</li>
                  <li>Attempt to reverse engineer, decompile, scrape, or otherwise misuse third-party AI services accessed through the Platform.</li>
                  <li>Interfere with or disrupt the integrity, security, or performance of the Service.</li>
                  <li>Use the Service to build or train a competing product that replicates our core analytics in a confusingly similar way.</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  We may suspend or terminate access if we reasonably believe you are violating this section.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Intellectual property</h2>
                <p className="text-muted-foreground mb-4">
                  All rights, title, and interest in and to the Service, including software, design, text, graphics, and logos, are owned by Mindshare AI or our licensors, and are protected by intellectual property laws.
                </p>
                <p className="text-muted-foreground">
                  Except for the limited rights expressly granted in these Terms, no licence or right is granted to you by implication or otherwise.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Disclaimer of warranties</h2>
                <p className="text-muted-foreground mb-4">
                  The Service is provided on an "as is" and "as available" basis.
                </p>
                <p className="text-muted-foreground mb-4">
                  To the maximum extent permitted by law, we disclaim all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, non-infringement, and accuracy of results or metrics.
                </p>
                <p className="text-muted-foreground mb-4">We do not warrant that:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>The Service will be uninterrupted, secure, or error-free.</li>
                  <li>Any metrics or recommendations will meet your requirements, produce specific business outcomes, or be free from inaccuracies or omissions.</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  You are solely responsible for how you use the outputs and insights generated by the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Limitation of liability</h2>
                <p className="text-muted-foreground mb-4">To the maximum extent permitted by law:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>We shall not be liable for any indirect, incidental, consequential, special, or exemplary damages, including loss of profits, revenue, or data, arising out of or in connection with your use of the Service.</li>
                  <li>Our total aggregate liability for any claims arising out of or relating to the Service or these Terms shall not exceed the amount you paid to us for the Service in the three (3) months immediately preceding the event giving rise to the claim.</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Nothing in these Terms excludes or limits liability that cannot be excluded or limited under applicable law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">13. Indemnity</h2>
                <p className="text-muted-foreground mb-4">
                  You agree to indemnify and hold us harmless from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising out of or related to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Your use of the Service,</li>
                  <li>Your Data or content you submit, or</li>
                  <li>Your breach of these Terms or applicable law.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">14. Term, suspension, and termination</h2>
                <p className="text-muted-foreground mb-4">
                  These Terms remain in effect while you use the Service.
                </p>
                <p className="text-muted-foreground mb-4">
                  We may suspend or terminate your access to the Service, with or without notice, if:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>You breach these Terms,</li>
                  <li>You fail to pay applicable fees, or</li>
                  <li>We are required to do so by law or by a third-party provider.</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  You may stop using the Service and cancel your subscription at any time via your account settings or by contacting us. Unless required by law, fees already paid are non-refundable.
                </p>
                <p className="text-muted-foreground mt-4">
                  Upon termination, your right to access the Service will cease. We may retain certain data as required or permitted by law and our data-retention policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">15. Changes to the Service and these Terms</h2>
                <p className="text-muted-foreground mb-4">
                  We may modify, suspend, or discontinue any part of the Service at any time, including features and pricing, with reasonable notice where practicable.
                </p>
                <p className="text-muted-foreground">
                  We may update these Terms from time to time. When we do, we will post the updated Terms on our website and update the "Last updated" date. If changes are material, we will use reasonable efforts to notify you. Your continued use of the Service after changes become effective constitutes your acceptance of the updated Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">16. Governing law and jurisdiction</h2>
                <p className="text-muted-foreground mb-4">
                  These Terms are governed by and construed in accordance with the laws of the jurisdiction in which our company is registered, without regard to its conflict of law principles.
                </p>
                <p className="text-muted-foreground">
                  Any disputes arising out of or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the courts of that jurisdiction.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">17. Contact</h2>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about these Terms, please contact us at:
                </p>
                <p className="text-muted-foreground">
                  Email: support@mindshare-ai.com
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
