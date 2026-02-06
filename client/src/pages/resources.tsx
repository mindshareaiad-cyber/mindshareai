import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import {
  BookOpen,
  FileText,
  Video,
  Mail,
  ExternalLink,
} from "lucide-react";

const resourceCategories = [
  {
    icon: BookOpen,
    title: "Documentation",
    description: "Learn how to get the most out of Mindshare AI with our comprehensive guides.",
    links: [
      { title: "Getting Started Guide", href: "/resources#docs" },
      { title: "Understanding Your Scores", href: "/resources#docs" },
      { title: "Setting Up Prompts", href: "/resources#docs" },
      { title: "Interpreting Gap Analysis", href: "/resources#docs" },
    ],
  },
  {
    icon: FileText,
    title: "Blog",
    description: "Stay up to date with the latest insights on AI visibility and AEO strategies.",
    links: [
      { title: "What is Answer Engine Optimization?", href: "/resources#blog" },
      { title: "How AI Assistants Choose Which Brands to Recommend", href: "/resources#blog" },
      { title: "5 Ways to Improve Your AI Visibility Score", href: "/resources#blog" },
      { title: "The Future of Search: From Keywords to Conversations", href: "/resources#blog" },
    ],
  },
  {
    icon: Video,
    title: "Tutorials",
    description: "Watch step-by-step video tutorials on using every feature of the platform.",
    links: [
      { title: "Platform Overview (5 min)", href: "/resources#tutorials" },
      { title: "Running Your First Scan", href: "/resources#tutorials" },
      { title: "Analyzing Competitor Performance", href: "/resources#tutorials" },
      { title: "Using AEO Suggestions Effectively", href: "/resources#tutorials" },
    ],
  },
];

const supportOptions = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Send us a message and we'll respond within 24 hours.",
    action: "Contact Us",
    href: "/contact",
    available: true,
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-resources-title">
            Resources & Support
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to succeed with Mindshare AI. From getting started guides to
            advanced strategies.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {resourceCategories.map((category) => (
              <Card key={category.title} data-testid={`card-resource-${category.title.toLowerCase()}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <category.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>{category.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">{category.description}</p>
                  <ul className="space-y-3">
                    {category.links.map((link) => (
                      <li key={link.title}>
                        <a
                          href={link.href}
                          className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                          data-testid={`link-resource-${link.title.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                          {link.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Need Help?</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Our support team is here to help you succeed. Choose the option that works best for you.
          </p>
          <div className="grid grid-cols-1 gap-6 max-w-lg mx-auto">
            {supportOptions.map((option) => (
              <Card key={option.title} className="hover-elevate" data-testid={`card-support-${option.title.toLowerCase().replace(/\s+/g, "-")}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <option.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{option.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
                      <Link href={option.href || "#"}>
                        <Button size="sm" variant="outline" data-testid={`button-support-${option.title.toLowerCase().replace(/\s+/g, "-")}`}>
                          {option.action}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8">
            Try Mindshare AI free and see how your brand performs in AI search.
          </p>
          <Link href="/signup">
            <Button size="lg" data-testid="button-resources-cta">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
