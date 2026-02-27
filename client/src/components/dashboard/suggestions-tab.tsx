import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, FileText, ExternalLink, Sparkles, Lock, ArrowUpRight, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { GapAnalysis } from "@shared/schema";

interface SuggestionsTabProps {
  gaps: GapAnalysis[];
  isGenerating: boolean;
  onGenerateSuggestion: (promptId: string) => void;
  planId?: string;
  userId?: string;
}

function PriorityBadge({ brandScore, competitorScores }: { brandScore: number; competitorScores: Record<string, number> }) {
  const maxCompetitorScore = Math.max(...Object.values(competitorScores), 0);
  
  if (brandScore === 0 && maxCompetitorScore >= 2) {
    return <Badge variant="destructive" className="text-xs">High Priority</Badge>;
  }
  if (brandScore === 0 && maxCompetitorScore >= 1) {
    return <Badge className="bg-warning text-warning-foreground text-xs">Medium Priority</Badge>;
  }
  return <Badge variant="secondary" className="text-xs">Low Priority</Badge>;
}

function UpgradePrompt({ userId, feature }: { userId?: string; feature: string }) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/stripe/customer-portal", { userId });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch {
      window.open("/payment", "_self");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="py-10 text-center">
        <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{feature} is available on Growth and Pro plans</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          Upgrade your plan to unlock {feature.toLowerCase()}, additional AI engines, more prompts, and deeper insights into your AI visibility.
        </p>
        <Button
          onClick={handleUpgrade}
          disabled={loading}
          size="lg"
          data-testid="button-upgrade-plan-suggestions"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Opening...</>
          ) : (
            <><ArrowUpRight className="h-4 w-4 mr-2" /> Upgrade Your Plan</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export function SuggestionsTab({ gaps, isGenerating, onGenerateSuggestion, planId, userId }: SuggestionsTabProps) {
  if (planId === "starter") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">AEO Suggestions</h2>
          <p className="text-sm text-muted-foreground">AI-generated content recommendations to improve your visibility</p>
        </div>
        <UpgradePrompt userId={userId} feature="AEO Suggestions" />
      </div>
    );
  }

  if (gaps.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="font-semibold mb-2">No AEO suggestions available</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Run a scan first, then we'll identify gaps where competitors are mentioned but you're not—and suggest how to fix it.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">AEO Suggestions</h2>
        <p className="text-sm text-muted-foreground">
          {gaps.length} opportunities to improve your AI visibility
        </p>
      </div>

      <div className="space-y-4">
        {gaps.map((gap) => (
          <Card key={gap.promptId}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <PriorityBadge
                      brandScore={gap.brandScore}
                      competitorScores={gap.competitorScores}
                    />
                    {gap.suggestedPageType && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <FileText className="h-3 w-3" />
                        {gap.suggestedPageType}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base font-medium">
                    {gap.promptText}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="text-muted-foreground">Competitors mentioned:</span>
                {Object.entries(gap.competitorScores)
                  .filter(([, score]) => score > 0)
                  .map(([competitor, score]) => (
                    <span key={competitor} className="font-medium">
                      {competitor} ({score === 2 ? "recommended" : "mentioned"})
                    </span>
                  ))}
              </div>
              
              {gap.suggestedAnswer ? (
                <div className="p-4 bg-accent/50 rounded-lg border border-accent">
                  <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Suggested Answer
                  </div>
                  <p className="text-sm leading-relaxed">{gap.suggestedAnswer}</p>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={isGenerating}
                  onClick={() => onGenerateSuggestion(gap.promptId)}
                  data-testid={`button-generate-suggestion-${gap.promptId}`}
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Suggested Answer
                </Button>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="gap-2" data-testid={`button-create-content-${gap.promptId}`}>
                  <FileText className="h-4 w-4" />
                  Create Content
                </Button>
                <Button size="sm" variant="ghost" data-testid={`button-dismiss-${gap.promptId}`}>
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
