import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingUp, Eye } from "lucide-react";
import { Link } from "wouter";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-accent/20 to-background py-20 md:py-32">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>AI Visibility Platform</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Understand your brand's{" "}
              <span className="text-primary">AI visibility</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              See how AI assistants respond to prompts about your industry—and get insights to help improve your visibility.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 w-full sm:w-auto" data-testid="button-cta-primary">
                  Run an AI Visibility Scan
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-xl lg:max-w-none">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/30 to-primary/20 rounded-2xl blur-2xl opacity-60" />
              <div className="relative bg-card border border-card-border rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Eye className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">AI Visibility Score</p>
                      <p className="text-sm text-muted-foreground">Your Brand</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-success">1.8</p>
                    <p className="text-sm text-muted-foreground">out of 2.0</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-success" />
                      <span className="text-sm">Recommended in 85% of test prompts</span>
                    </div>
                    <TrendingUp className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-warning" />
                      <span className="text-sm">Mentioned in 12% of test prompts</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-destructive" />
                      <span className="text-sm">Missing from 3% of test prompts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
