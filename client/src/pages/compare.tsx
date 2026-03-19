import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useParams } from "wouter";
import { Check, X, ArrowLeft, ArrowRight, Zap, Target, BarChart3, Shield, Globe, DollarSign, Users, Layers } from "lucide-react";
import { useEffect } from "react";

function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    const setMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };
    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
  }, [title, description]);
}

interface FeatureRow {
  feature: string;
  mindshare: string | boolean;
  competitor: string | boolean;
}

interface ComparisonData {
  slug: string;
  competitorName: string;
  competitorTagline: string;
  metaTitle: string;
  metaDescription: string;
  heroSummary: string;
  mindshareIsBestFor: string;
  competitorIsBestFor: string;
  featureTable: FeatureRow[];
  sections: {
    title: string;
    icon: React.ElementType;
    content: string[];
  }[];
  chooseMindshareIf: string[];
  chooseCompetitorIf: string[];
  verdict: string;
}

const comparisons: Record<string, ComparisonData> = {
  "mindshare-ai-vs-grackerai": {
    slug: "mindshare-ai-vs-grackerai",
    competitorName: "GrackerAI",
    competitorTagline: "GEO + AI visibility platform for B2B SaaS",
    metaTitle: "Mindshare AI vs GrackerAI - AEO Tool Comparison (2026)",
    metaDescription: "Detailed comparison of Mindshare AI and GrackerAI for AI visibility and AEO. See which tool is right for your SaaS brand's answer engine strategy.",
    heroSummary: "Both Mindshare AI and GrackerAI help B2B SaaS brands improve their AI visibility. Mindshare AI gives you a radar and playbook to understand and improve how AI assistants talk about your brand. GrackerAI goes further into execution, auto-publishing content hubs and comparison pages to win citations.",
    mindshareIsBestFor: "SaaS marketers and agencies who want full visibility into AI answers, clear action items, and the flexibility to execute strategy their way.",
    competitorIsBestFor: "B2B SaaS teams who want a semi-done-for-you GEO system that auto-generates and publishes content portals and comparison pages.",
    featureTable: [
      { feature: "Multi-engine AI tracking", mindshare: "ChatGPT, Claude, Gemini, Perplexity", competitor: "ChatGPT, Gemini, Perplexity" },
      { feature: "AI Visibility Score", mindshare: true, competitor: true },
      { feature: "Share of Voice", mindshare: true, competitor: true },
      { feature: "Gap Analysis", mindshare: true, competitor: true },
      { feature: "AEO Content Suggestions", mindshare: "AI-generated briefs & checklists", competitor: "Auto-published content hubs" },
      { feature: "Content Auto-Publishing", mindshare: false, competitor: true },
      { feature: "Programmatic SEO Portals", mindshare: false, competitor: true },
      { feature: "Prompt-Level Performance", mindshare: true, competitor: false },
      { feature: "Competitor Benchmarking", mindshare: true, competitor: true },
      { feature: "API Access", mindshare: true, competitor: false },
      { feature: "Agency Multi-Client", mindshare: "Up to 50 projects", competitor: "Custom pricing" },
      { feature: "Onboarding Style", mindshare: "Product-led, self-serve", competitor: "Sales-led, demos" },
      { feature: "Pricing", mindshare: "From $29/mo", competitor: "Custom / enterprise" },
    ],
    sections: [
      {
        title: "Coverage & Metrics",
        icon: BarChart3,
        content: [
          "Mindshare AI tracks visibility across four major AI engines — ChatGPT, Claude, Gemini, and Perplexity — giving you per-prompt scoring (0-2 scale) and aggregate share of voice against competitors.",
          "GrackerAI focuses on citation tracking and GEO-optimised content generation, with coverage across ChatGPT, Gemini, and Perplexity. Their strength is in measuring citations and then automatically building content to win more.",
          "If you need Claude coverage or want granular prompt-level scoring, Mindshare AI has the edge. If auto-generated content hubs matter more than measurement depth, GrackerAI is worth exploring.",
        ],
      },
      {
        title: "Workflow & ICP Fit",
        icon: Users,
        content: [
          "Mindshare AI is built for marketers and agencies who already have content and SEO capabilities. It tells you exactly where you're invisible in AI answers and gives you structured briefs and action items — but you or your team executes.",
          "GrackerAI is more hands-off: it builds comparison pages, content hubs, and pSEO portals for you. This is ideal for lean SaaS teams who want AI visibility gains without hiring a content team.",
          "The core question: do you want a radar + playbook (Mindshare), or a semi-automated content machine (GrackerAI)?",
        ],
      },
      {
        title: "Pricing & Complexity",
        icon: DollarSign,
        content: [
          "Mindshare AI offers transparent pricing starting at $29/month with a 14-day free trial. Plans scale from Starter (1 project, 1 engine) to Pro (50 projects, all engines). No sales calls required.",
          "GrackerAI follows a sales-led model with custom pricing, typically positioned at enterprise-level. They invest heavily in case studies and ROI demonstrations during the sales process.",
          "For bootstrapped SaaS or SMBs, Mindshare AI's self-serve model is faster to try. Larger teams with budget for a managed solution may find GrackerAI's automation worth the investment.",
        ],
      },
    ],
    chooseMindshareIf: [
      "You want to understand exactly how AI assistants talk about your brand across 4 engines",
      "You have a content team or agency that can act on insights and suggestions",
      "You need prompt-level performance data and competitor benchmarking",
      "You want a self-serve product with transparent pricing and API access",
      "You manage multiple brands or clients and need a scalable multi-project setup",
    ],
    chooseCompetitorIf: [
      "You want content auto-published for you without needing a content team",
      "You're focused on winning GEO citations specifically (not just visibility tracking)",
      "You prefer a managed, sales-led relationship with more hand-holding",
      "You need programmatic SEO portals and comparison pages generated automatically",
    ],
    verdict: "Mindshare AI and GrackerAI solve different parts of the AEO puzzle. Mindshare measures and advises — GrackerAI measures and executes. If you want deep visibility insights and the freedom to run your own strategy, Mindshare is the better fit. If you want an automated content engine that builds GEO pages for you, GrackerAI is worth a look.",
  },
  "mindshare-ai-vs-peec-ai": {
    slug: "mindshare-ai-vs-peec-ai",
    competitorName: "Peec AI",
    competitorTagline: "AI search analytics and brand visibility monitoring",
    metaTitle: "Mindshare AI vs Peec AI - AEO Tool Comparison (2026)",
    metaDescription: "Compare Mindshare AI and Peec AI for AI visibility tracking. See the key differences in actionability, AEO suggestions, and pricing for SaaS brands.",
    heroSummary: "Both Mindshare AI and Peec AI monitor brand visibility across AI answer engines. Peec AI offers clean dashboards and citation tracking with strong analytics. Mindshare AI goes beyond monitoring to deliver actionable AEO suggestions and a structured playbook for improving your visibility.",
    mindshareIsBestFor: "SaaS marketers and agencies who want measurement plus a clear action plan — not just dashboards, but concrete next steps to improve AI visibility.",
    competitorIsBestFor: "Experienced SEO leads who already know AEO strategy and just need a clean analytics layer to track visibility and citations.",
    featureTable: [
      { feature: "Multi-engine AI tracking", mindshare: "ChatGPT, Claude, Gemini, Perplexity", competitor: "ChatGPT, Gemini, Perplexity, AI Overviews" },
      { feature: "AI Visibility Score", mindshare: true, competitor: true },
      { feature: "Share of Voice", mindshare: true, competitor: true },
      { feature: "Citation Tracking", mindshare: "Via scan results", competitor: "Dedicated source analysis" },
      { feature: "Gap Analysis", mindshare: true, competitor: false },
      { feature: "AEO Content Suggestions", mindshare: "AI-generated briefs & checklists", competitor: false },
      { feature: "SEO Readiness Assessment", mindshare: true, competitor: false },
      { feature: "Prompt-Level Performance", mindshare: true, competitor: "Limited" },
      { feature: "Competitor Benchmarking", mindshare: true, competitor: true },
      { feature: "Trend Reports", mindshare: true, competitor: true },
      { feature: "API Access", mindshare: true, competitor: "Enterprise-gated" },
      { feature: "Onboarding Style", mindshare: "Product-led, self-serve", competitor: "Product-led with sales" },
      { feature: "Pricing", mindshare: "From $29/mo", competitor: "From $39/mo (estimated)" },
    ],
    sections: [
      {
        title: "Depth vs Direction",
        icon: Target,
        content: [
          "Peec AI is widely praised for its monitoring capabilities — visibility percentages, citation sources, domain analysis, and multi-engine share of voice. The dashboards are clean and the data is solid.",
          "Where Peec AI falls short, according to user feedback, is direction: it tells you what's happening but not what to do about it. It's been described as 'data without direction' — great diagnosis, weaker on prescriptions.",
          "Mindshare AI was built with actionability as a core principle. Beyond visibility scores and competitor benchmarks, it generates AEO content suggestions with structured briefs, coverage checklists, and implementation guidance. Every gap comes with a clear next step.",
        ],
      },
      {
        title: "ICP & Use Case Fit",
        icon: Users,
        content: [
          "Peec AI suits experienced in-house SEO and content leads who already have a strong AEO strategy and just need clean data to track progress and report to stakeholders.",
          "Mindshare AI is designed for SaaS marketers and agencies who need both the measurement and the playbook. It's particularly useful when you need to sell AEO internally — the suggestions and structured briefs make it easy to hand off to content teams.",
          "If you're already an AEO expert and just want a dashboard, Peec may be simpler. If you want insights and recommendations in one place, Mindshare covers more ground.",
        ],
      },
      {
        title: "Extensibility & Integration",
        icon: Layers,
        content: [
          "Mindshare AI offers a public API and supports multi-project setups (up to 50 projects on Pro), making it a natural fit for agencies managing multiple clients or teams embedding AI visibility data into custom dashboards.",
          "Peec AI offers exports and some integrations, but API access is typically gated behind enterprise plans. This makes it harder to build custom workflows or integrate into existing marketing toolchains without a larger commitment.",
          "For teams that need programmatic access or want to build AI visibility into their existing reporting stack, Mindshare AI's openness is a meaningful advantage.",
        ],
      },
    ],
    chooseMindshareIf: [
      "You want actionable AEO suggestions alongside your visibility data, not just dashboards",
      "You need structured content briefs you can hand directly to your content team",
      "You manage multiple clients or brands and need flexible multi-project support",
      "You want transparent pricing with self-serve onboarding and API access",
      "You need gap analysis that shows exactly where competitors beat you in AI answers",
    ],
    chooseCompetitorIf: [
      "You're an experienced SEO lead who already has an AEO strategy and just needs analytics",
      "You value clean citation and source domain analysis as your primary reporting metric",
      "You need AI Overviews tracking specifically (Google SGE coverage)",
      "You prefer a focused monitoring tool over an all-in-one platform",
    ],
    verdict: "Peec AI is a solid analytics tool for teams that know exactly what to do with AI visibility data. Mindshare AI is the better choice if you want both measurement and direction — actionable suggestions, structured briefs, and a clear playbook that helps you actually improve your AI visibility, not just report on it.",
  },
  "mindshare-ai-vs-scrunch-ai": {
    slug: "mindshare-ai-vs-scrunch-ai",
    competitorName: "Scrunch AI",
    competitorTagline: "Enterprise AEO platform with Agent Experience Platform (AXP)",
    metaTitle: "Mindshare AI vs Scrunch AI - AEO Tool Comparison (2026)",
    metaDescription: "Compare Mindshare AI and Scrunch AI for AI visibility and AEO. Understand the differences between content-focused AEO and enterprise technical AXP.",
    heroSummary: "Mindshare AI and Scrunch AI both address AI visibility, but from very different angles. Mindshare AI is content and visibility oriented — prompts, answers, share of voice, and actionable suggestions for marketers. Scrunch AI is a deeply technical platform with an Agent Experience Platform (AXP) that builds AI-optimised mirror sites and handles edge-level technical optimisation.",
    mindshareIsBestFor: "SaaS brands and agencies who want clear visibility into AI answers and a content-focused playbook to improve their AEO — without ripping up infrastructure.",
    competitorIsBestFor: "Enterprises with complex, global websites and strong security/compliance needs who want deep technical AEO and an AI-optimised parallel site layer.",
    featureTable: [
      { feature: "Multi-engine AI tracking", mindshare: "ChatGPT, Claude, Gemini, Perplexity", competitor: "ChatGPT, Claude, Gemini, Perplexity, AI Overviews, Copilot, Meta AI" },
      { feature: "AI Visibility Score", mindshare: true, competitor: true },
      { feature: "Share of Voice", mindshare: true, competitor: true },
      { feature: "Gap Analysis", mindshare: true, competitor: "Limited" },
      { feature: "AEO Content Suggestions", mindshare: "AI-generated briefs & checklists", competitor: "Technical optimisation focus" },
      { feature: "Agent Experience Platform (AXP)", mindshare: false, competitor: true },
      { feature: "AI-Optimised Mirror Sites", mindshare: false, competitor: true },
      { feature: "Edge-Side Technical Fixes", mindshare: false, competitor: true },
      { feature: "Prompt-Level Performance", mindshare: true, competitor: false },
      { feature: "Competitor Benchmarking", mindshare: true, competitor: true },
      { feature: "SOC2 / RBAC Compliance", mindshare: false, competitor: true },
      { feature: "API Access", mindshare: true, competitor: "Enterprise" },
      { feature: "Onboarding Style", mindshare: "Product-led, self-serve", competitor: "Enterprise sales" },
      { feature: "Pricing", mindshare: "From $29/mo", competitor: "Enterprise custom" },
    ],
    sections: [
      {
        title: "Content vs Technical Orientation",
        icon: Target,
        content: [
          "Mindshare AI is built for marketers and content teams. It answers the questions: 'Which AI assistants mention us? Where are we invisible? What content should we create to fix that?' Every insight comes with action items and AEO briefs.",
          "Scrunch AI is built for engineering and technical SEO teams. Its AXP (Agent Experience Platform) creates AI-optimised parallel versions of your pages, handles edge-side technical fixes, and monitors how AI agents crawl and render your site.",
          "These are fundamentally different approaches: Mindshare helps you win through content and positioning. Scrunch helps you win through technical infrastructure and agent-friendly architecture.",
        ],
      },
      {
        title: "Engine Coverage",
        icon: Globe,
        content: [
          "Scrunch AI offers the widest engine coverage at its tier — tracking ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews, AI Mode, Copilot, and Meta AI. If maximum engine breadth matters, this is notable.",
          "Mindshare AI covers the four engines that matter most for B2B SaaS buying decisions: ChatGPT, Claude, Gemini, and Perplexity. The focus is on depth of insight per engine rather than maximum engine count.",
          "For most SaaS brands, the engines Mindshare covers represent where buyers actually research solutions. Scrunch's wider coverage matters more for enterprises with consumer audiences across multiple AI touchpoints.",
        ],
      },
      {
        title: "Ideal Customer & Complexity",
        icon: Shield,
        content: [
          "Mindshare AI is designed for lean SaaS teams, marketing agencies, and growth marketers. You can sign up, connect your brand, and get actionable visibility insights in minutes. No infrastructure changes required.",
          "Scrunch AI is positioned for enterprises with complex, global sites — particularly those with strict security requirements (SOC2, RBAC) and the engineering resources to implement an AXP layer alongside their existing website.",
          "If you're a SaaS brand or agency looking for quick wins and clear direction, Mindshare is the pragmatic choice. If you're a large enterprise with dedicated engineering resources for AI-specific infrastructure, Scrunch's depth may justify the complexity.",
        ],
      },
    ],
    chooseMindshareIf: [
      "You're a SaaS brand or agency that wants actionable AI visibility insights without infrastructure changes",
      "You need content-focused AEO suggestions and structured briefs for your marketing team",
      "You want transparent, self-serve pricing and a product you can try in minutes",
      "You need prompt-level performance data and competitor share of voice",
      "You want to understand what AI assistants say about you and how to improve it",
    ],
    chooseCompetitorIf: [
      "You're an enterprise with a complex global site and dedicated engineering resources",
      "You need SOC2 compliance, RBAC, and enterprise security features",
      "You want an Agent Experience Platform that builds AI-optimised mirror sites",
      "You need the widest possible engine coverage including Copilot, Meta AI, and AI Overviews",
      "You have the budget and team for deep technical AEO infrastructure",
    ],
    verdict: "Mindshare AI and Scrunch AI serve different markets. Mindshare is the right fit for SaaS marketers who want clear, actionable AI visibility insights and content-focused AEO suggestions. Scrunch AI is built for enterprises that need deep technical infrastructure — AXP, mirror sites, edge optimisation — and have the engineering team to implement it. Most SaaS brands will get more value faster from Mindshare's approach.",
  },
};

function FeatureCell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-5 w-5 text-green-500 mx-auto" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
    );
  }
  return <span className="text-sm">{value}</span>;
}

export default function ComparePage() {
  const { slug } = useParams<{ slug: string }>();
  const data = slug ? comparisons[slug] : null;

  usePageMeta(
    data?.metaTitle ?? "Comparison Not Found | Mindshare AI",
    data?.metaDescription ?? "This comparison page was not found."
  );

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Comparison Not Found</h1>
          <p className="text-muted-foreground mb-8">We haven't written this comparison yet.</p>
          <Link href="/compare">
            <Button data-testid="button-back-comparisons">View All Comparisons</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16 md:py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <Link href="/compare" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6" data-testid="link-back-comparisons">
              <ArrowLeft className="h-4 w-4" />
              All comparisons
            </Link>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" data-testid="text-compare-title">
              Mindshare AI vs {data.competitorName}
            </h1>
            <p className="text-lg text-muted-foreground mb-8" data-testid="text-compare-summary">
              {data.heroSummary}
            </p>
            <Link href="/signup">
              <Button size="lg" className="gap-2" data-testid="button-compare-hero-cta">
                <Zap className="h-4 w-4" />
                Try Mindshare AI Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Who each is best for</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <img src="/logo.png" alt="Mindshare AI" className="h-6 w-6 rounded" />
                    <span className="font-semibold">Mindshare AI</span>
                  </div>
                  <p className="text-sm text-muted-foreground" data-testid="text-mindshare-bestfor">{data.mindshareIsBestFor}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded bg-muted flex items-center justify-center text-xs font-bold">
                      {data.competitorName.charAt(0)}
                    </div>
                    <span className="font-semibold">{data.competitorName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground" data-testid="text-competitor-bestfor">{data.competitorIsBestFor}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Feature Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="table-feature-comparison">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Feature</th>
                    <th className="text-center py-3 px-4 font-semibold text-sm">
                      <div className="flex items-center justify-center gap-1.5">
                        <img src="/logo.png" alt="" className="h-4 w-4 rounded" />
                        Mindshare AI
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-sm">{data.competitorName}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.featureTable.map((row, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium">{row.feature}</td>
                      <td className="py-3 px-4 text-center">
                        <FeatureCell value={row.mindshare} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <FeatureCell value={row.competitor} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {data.sections.map((section, i) => (
        <section key={i} className={`py-12 md:py-16 ${i % 2 === 0 ? "" : "bg-muted/30"}`}>
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">{section.title}</h2>
              </div>
              <div className="space-y-4">
                {section.content.map((paragraph, j) => (
                  <p key={j} className="text-muted-foreground leading-relaxed">{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">When to Choose Each</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <img src="/logo.png" alt="Mindshare AI" className="h-6 w-6 rounded" />
                    <span className="font-semibold">Choose Mindshare AI if…</span>
                  </div>
                  <ul className="space-y-3">
                    {data.chooseMindshareIf.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-6 w-6 rounded bg-muted flex items-center justify-center text-xs font-bold">
                      {data.competitorName.charAt(0)}
                    </div>
                    <span className="font-semibold">Choose {data.competitorName} if…</span>
                  </div>
                  <ul className="space-y-3">
                    {data.chooseCompetitorIf.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <Check className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">The Verdict</h2>
            <p className="text-muted-foreground leading-relaxed mb-8" data-testid="text-compare-verdict">{data.verdict}</p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">See how AI assistants talk about your brand</h2>
            <p className="text-muted-foreground mb-8">
              Start your 14-day free trial. No credit card required. Track your AI visibility across ChatGPT, Claude, Gemini, and Perplexity.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2 w-full sm:w-auto" data-testid="button-compare-bottom-cta">
                  <Zap className="h-4 w-4" />
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto" data-testid="button-compare-pricing">
                  View Pricing
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export function CompareIndexPage() {
  const allComparisons = Object.values(comparisons);

  usePageMeta(
    "Compare Mindshare AI - AEO Tool Comparisons | Mindshare AI",
    "See how Mindshare AI compares to other AEO and AI visibility tools. Honest, detailed comparisons with GrackerAI, Peec AI, Scrunch AI, and more."
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16 md:py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">Comparisons</Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" data-testid="text-compare-index-title">
              How Mindshare AI Compares
            </h1>
            <p className="text-lg text-muted-foreground">
              Honest, side-by-side comparisons with other AEO and AI visibility tools. We tell you when they're the better choice, too.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allComparisons.map((comp) => (
              <Link key={comp.slug} href={`/compare/${comp.slug}`}>
                <Card className="group cursor-pointer h-full border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200" data-testid={`card-compare-${comp.slug}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <img src="/logo.png" alt="Mindshare AI" className="h-8 w-8 rounded" />
                      <span className="text-muted-foreground font-medium">vs</span>
                      <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-sm font-bold">
                        {comp.competitorName.charAt(0)}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      Mindshare AI vs {comp.competitorName}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{comp.competitorTagline}</p>
                    <div className="mt-4 flex items-center text-sm text-primary font-medium gap-1">
                      Read comparison
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to see your AI visibility?</h2>
            <p className="text-muted-foreground mb-8">
              Try Mindshare AI free for 14 days. Track how AI assistants talk about your brand across ChatGPT, Claude, Gemini, and Perplexity.
            </p>
            <Link href="/signup">
              <Button size="lg" className="gap-2" data-testid="button-compare-index-cta">
                <Zap className="h-4 w-4" />
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
