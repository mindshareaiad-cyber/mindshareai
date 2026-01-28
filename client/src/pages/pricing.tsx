import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for individual marketers and small businesses.",
    features: [
      { text: "1 Project", tooltip: "Track one brand or product" },
      { text: "50 Prompts", tooltip: "Create up to 50 buyer-intent questions" },
      { text: "1 Engine (ChatGPT)", tooltip: "Test against GPT-4o-mini" },
      { text: "10 Scans per month", tooltip: "Run visibility checks 10 times monthly" },
      { text: "Basic visibility reports", tooltip: "See your brand scores and mentions" },
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$79",
    period: "/month",
    description: "For growing teams that need more power and insights.",
    features: [
      { text: "5 Projects", tooltip: "Track multiple brands or products" },
      { text: "200 Prompts", tooltip: "Create up to 200 buyer-intent questions" },
      { text: "2 Engines (ChatGPT + Gemini)", tooltip: "Compare visibility across AI assistants" },
      { text: "50 Scans per month", tooltip: "Run visibility checks 50 times monthly" },
      { text: "Advanced reports", tooltip: "Detailed analytics and trends" },
      { text: "Gap analysis", tooltip: "Find where competitors beat you" },
      { text: "AEO content suggestions", tooltip: "AI-powered improvement recommendations" },
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$199",
    period: "/month",
    description: "For agencies and teams managing multiple brands.",
    features: [
      { text: "50 Projects", tooltip: "Manage an entire portfolio of brands" },
      { text: "1,000 Prompts", tooltip: "Comprehensive prompt coverage" },
      { text: "All 5 Engines", tooltip: "ChatGPT, Claude, Gemini, Perplexity, DeepSeek" },
      { text: "500 Scans per month", tooltip: "High-volume visibility monitoring" },
      { text: "White-label reports", tooltip: "Branded reports for clients" },
      { text: "API access", tooltip: "Integrate with your tools" },
      { text: "Priority support", tooltip: "Dedicated support team" },
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const faqs = [
  {
    question: "What counts as a scan?",
    answer: "A scan runs all your prompts through the selected AI engine(s) and scores your brand visibility. Each time you click 'Run Scan' counts as one scan toward your monthly limit.",
  },
  {
    question: "Can I change plans anytime?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate your billing accordingly.",
  },
  {
    question: "What AI engines are included?",
    answer: "Starter includes ChatGPT. Growth adds Gemini. Pro includes all 5: ChatGPT, Claude, Gemini, Perplexity, and DeepSeek.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes, all plans include a 14-day free trial. No credit card required to start.",
  },
  {
    question: "What happens if I exceed my limits?",
    answer: "You'll receive a notification when approaching limits. You can upgrade anytime, or limits reset at the start of your next billing cycle.",
  },
  {
    question: "Do you offer annual billing?",
    answer: "Yes, annual billing is available with a 20% discount. Contact our sales team to switch to annual billing.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-pricing-title">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that fits your needs. All plans include a 14-day free trial.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col ${
                  plan.highlighted
                    ? "border-primary shadow-lg scale-105 z-10"
                    : ""
                }`}
                data-testid={`card-plan-${plan.name.toLowerCase()}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {plan.description}
                  </p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                          <Check className="h-3 w-3 text-success" />
                        </div>
                        <span className="text-sm flex-1">{feature.text}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{feature.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-4">
                  <Link href="/signup" className="w-full">
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? "default" : "outline"}
                      data-testid={`button-pricing-${plan.name.toLowerCase()}`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, i) => (
              <div key={i} className="space-y-2" data-testid={`faq-${i}`}>
                <h3 className="font-semibold">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your 14-day free trial today. No credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" data-testid="button-pricing-cta">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline" data-testid="button-pricing-features">
                View Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
