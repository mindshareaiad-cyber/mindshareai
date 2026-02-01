import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import {
  Eye,
  BarChart3,
  Target,
  Lightbulb,
  Zap,
  Shield,
  Globe,
  TrendingUp,
  Users,
  FileText,
  Search,
  Bot,
} from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "AI Visibility Scoring",
    description:
      "Track how often AI assistants like ChatGPT, Claude, and Gemini mention or recommend your brand. Get a clear 0-2 score for every prompt.",
    details: [
      "Real-time monitoring across 5 AI engines",
      "Transparent scoring: 0 = Not mentioned, 1 = Mentioned, 2 = Recommended",
      "Historical tracking to measure improvement over time",
    ],
  },
  {
    icon: BarChart3,
    title: "Competitor Share of Voice",
    description:
      "See exactly how your brand stacks up against competitors in AI-powered answers. Identify where you're winning and where you need to improve.",
    details: [
      "Side-by-side competitor comparison",
      "Visual share of voice charts",
      "Track multiple competitors per project",
    ],
  },
  {
    icon: Target,
    title: "Gap Analysis",
    description:
      "Discover opportunities where competitors are being mentioned but you're not. These gaps represent your biggest growth opportunities.",
    details: [
      "Automatic gap detection",
      "Priority ranking by impact",
      "Actionable insights for each gap",
    ],
  },
  {
    icon: Lightbulb,
    title: "AEO Suggestions",
    description:
      "Get AI-generated recommendations for improving your visibility. Learn exactly what content changes will help AI assistants recommend you.",
    details: [
      "Content optimization tips",
      "Suggested page types for each gap",
      "Ready-to-implement recommendations",
    ],
  },
  {
    icon: Bot,
    title: "Multi-Engine Support",
    description:
      "Test your visibility across all major AI assistants including ChatGPT, Claude, Gemini, Perplexity, and DeepSeek.",
    details: [
      "ChatGPT (GPT-4o-mini)",
      "Claude (Sonnet 4.5)",
      "Gemini (2.5 Flash)",
      "Perplexity (Llama Sonar)",
      "DeepSeek Chat",
    ],
  },
  {
    icon: FileText,
    title: "Prompt Templates",
    description:
      "Use our library of buyer-intent prompt templates to ensure you're testing the questions your customers actually ask.",
    details: [
      "Templates by funnel stage (awareness, consideration, decision)",
      "Templates by intent (comparison, validation, alternatives)",
      "Customizable placeholders for your brand",
    ],
  },
  {
    icon: Search,
    title: "Prompt Organization",
    description:
      "Organize your prompts by persona, funnel stage, and country. Keep your testing structured and comprehensive.",
    details: [
      "Group prompts into sets",
      "Filter by persona and stage",
      "Country-specific testing",
    ],
  },
  {
    icon: TrendingUp,
    title: "Scan Annotations",
    description:
      "Add notes to your scans to track context like site updates, product launches, or PR events. Correlate visibility changes with your actions.",
    details: [
      "Add context to any scan",
      "Track before/after changes",
      "Identify what drives improvement",
    ],
  },
];

const benefits = [
  {
    icon: Zap,
    title: "Faster Insights",
    description: "Get visibility scores in minutes, not weeks of manual testing.",
  },
  {
    icon: Shield,
    title: "Data Transparency",
    description: "See the exact AI responses so you understand why you got each score.",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Test across multiple AI engines that serve billions of users worldwide.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share projects and insights with your marketing and content teams.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-features-title">
            Everything You Need to Win in AI Search
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Mindshare AI gives you complete visibility into how AI assistants talk about your
            brand, plus actionable recommendations to improve.
          </p>
          <Link href="/signup">
            <Button size="lg" data-testid="button-features-cta">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="hover-elevate" data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.details.map((detail, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Mindshare AI</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center" data-testid={`benefit-${benefit.title.toLowerCase().replace(/\s+/g, "-")}`}>
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Improve Your AI Visibility?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of brands already optimizing their presence in AI-powered search.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" data-testid="button-features-signup">
                Get Started Free
              </Button>
            </Link>
            <Link href="/#pricing">
              <Button size="lg" variant="outline" data-testid="button-features-pricing">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
