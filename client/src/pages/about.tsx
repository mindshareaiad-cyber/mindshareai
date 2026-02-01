import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Target, Eye, Users, Zap } from "lucide-react";

const values = [
  {
    icon: Eye,
    title: "Transparency",
    description:
      "We believe you should understand exactly how AI assistants perceive your brand. That's why we show you the raw AI responses and explain every score.",
  },
  {
    icon: Target,
    title: "Actionability",
    description:
      "Insights are only valuable if you can act on them. Every feature we build is designed to give you clear next steps for improvement.",
  },
  {
    icon: Users,
    title: "Customer Focus",
    description:
      "We build for marketers and brand managers, not data scientists. Our platform is intuitive and doesn't require technical expertise.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description:
      "The AI landscape evolves rapidly. We're committed to supporting new AI engines and adapting to changes in how people search.",
  },
];

const milestones = [
  { year: "2024", event: "Mindshare AI founded to help brands navigate AI-powered search" },
  { year: "2024", event: "Launched support for 5 major AI engines" },
  { year: "2024", event: "Introduced Gap Analysis and AEO Suggestions" },
  { year: "2025", event: "Expanded to serve enterprise customers worldwide" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-about-title">
              About Mindshare AI
            </h1>
            <p className="text-xl text-muted-foreground">
              We're on a mission to help brands thrive in the age of AI-powered search. As
              consumers increasingly turn to AI assistants for recommendations, we provide the
              tools to ensure your brand gets noticed.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  The way people search for information is changing. Instead of typing keywords
                  into Google, millions now ask AI assistants like ChatGPT, Claude, and Gemini
                  for recommendations.
                </p>
                <p>
                  For brands, this shift creates both a challenge and an opportunity. Unlike
                  traditional search where you can see your rankings, AI responses are a black
                  box. You don't know if you're being recommended, ignored, or worse
                  misrepresented.
                </p>
                <p>
                  We built Mindshare AI to solve this problem. Our platform lets you see
                  exactly what AI assistants say about your brand, compare yourself to
                  competitors, and get actionable recommendations for improvement.
                </p>
              </div>
            </div>
            <div className="bg-card rounded-lg p-8 border">
              <h3 className="font-semibold mb-6">Our Journey</h3>
              <div className="space-y-6">
                {milestones.map((milestone, i) => (
                  <div key={i} className="flex gap-4" data-testid={`milestone-${i}`}>
                    <div className="flex-shrink-0 w-16 font-semibold text-primary">
                      {milestone.year}
                    </div>
                    <div className="text-muted-foreground">{milestone.event}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title} data-testid={`card-value-${value.title.toLowerCase()}`}>
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Us on This Journey</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you're a startup or enterprise, we're here to help you succeed in AI-powered
            search.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" data-testid="button-about-signup">
                Get Started Free
              </Button>
            </Link>
            <Link href="/resources">
              <Button size="lg" variant="outline" data-testid="button-about-resources">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
