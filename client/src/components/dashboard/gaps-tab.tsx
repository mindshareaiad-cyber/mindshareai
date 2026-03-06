import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Lightbulb, Loader2, ExternalLink, Lock, ArrowUpRight, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { GapAnalysis } from "@shared/schema";

interface GapsTabProps {
  gaps: GapAnalysis[];
  isGenerating: boolean;
  onGenerateSuggestion: (promptId: string) => void;
  planId?: string;
  userId?: string;
}

function UpgradePrompt({ feature }: { userId?: string; feature: string }) {
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
          onClick={() => window.location.href = "/payment"}
          size="lg"
          data-testid="button-upgrade-plan"
        >
          <ArrowUpRight className="h-4 w-4 mr-2" /> Upgrade Your Plan
        </Button>
      </CardContent>
    </Card>
  );
}

export function GapsTab({ gaps, isGenerating, onGenerateSuggestion, planId, userId }: GapsTabProps) {
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set());

  const toggleAnswer = (promptId: string) => {
    const next = new Set(expandedAnswers);
    if (next.has(promptId)) {
      next.delete(promptId);
    } else {
      next.add(promptId);
    }
    setExpandedAnswers(next);
  };

  const gapsWithoutSuggestions = gaps.filter(g => !g.suggestedAnswer);
  const gapsWithSuggestions = gaps.filter(g => g.suggestedAnswer);
  const gapsWithListedCompetitors = gaps.filter(g => Object.values(g.competitorScores).some(s => s > 0));
  const gapsWithDiscoveredBrands = gaps.filter(g => g.mentionedBrands.length > 0);

  if (planId === "starter") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-gaps-title">Gap Analysis</h2>
          <p className="text-muted-foreground">Opportunities where competitors are mentioned but you're not</p>
        </div>
        <UpgradePrompt userId={userId} feature="Gap Analysis" />
      </div>
    );
  }

  if (gaps.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-gaps-title">Gap Analysis</h2>
          <p className="text-muted-foreground">Opportunities where competitors are mentioned but you're not</p>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2" data-testid="text-no-gaps">No Gaps Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Great news — your brand was mentioned in every AI response. Run more scans with different prompts to find potential gaps.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" data-testid="text-gaps-title">Gap Analysis</h2>
        <p className="text-muted-foreground">
          Found {gaps.length} prompt{gaps.length !== 1 ? "s" : ""} where your brand wasn't mentioned by AI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-destructive" data-testid="text-total-gaps">{gaps.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Competitors Mentioned</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-warning" data-testid="text-competitor-gaps">{gapsWithListedCompetitors.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Other Brands Found</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-primary" data-testid="text-discovered-brands">{gapsWithDiscoveredBrands.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Have Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-success" data-testid="text-suggestions-count">{gapsWithSuggestions.length}</span>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {gaps.map((gap) => {
          const listedCompetitorsMentioned = Object.entries(gap.competitorScores).filter(([, score]) => score > 0);
          const discoveredOnly = gap.mentionedBrands.filter(
            b => !listedCompetitorsMentioned.some(([name]) => name.toLowerCase() === b.toLowerCase())
          );
          const isExpanded = expandedAnswers.has(gap.promptId);

          return (
            <Card key={gap.promptId} className="overflow-hidden" data-testid={`card-gap-${gap.promptId}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-base font-medium" data-testid={`text-gap-prompt-${gap.promptId}`}>{gap.promptText}</CardTitle>
                    <CardDescription className="mt-1">
                      <span className="text-destructive font-medium">Your brand: Not mentioned</span>
                      {gap.engine && (
                        <>
                          {" • "}
                          <span className="text-muted-foreground">Engine: {gap.engine}</span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant="destructive" className="flex-shrink-0">
                    Gap
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {listedCompetitorsMentioned.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Listed Competitors Mentioned</p>
                    <div className="flex flex-wrap gap-2">
                      {listedCompetitorsMentioned.map(([comp, score]) => (
                        <Badge key={comp} variant="destructive" className="text-xs" data-testid={`badge-competitor-${comp}`}>
                          {comp} {score === 2 ? "(recommended)" : "(mentioned)"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {discoveredOnly.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Other Brands Mentioned by AI</p>
                    <div className="flex flex-wrap gap-2">
                      {discoveredOnly.map((brand) => (
                        <Badge key={brand} variant="secondary" className="text-xs" data-testid={`badge-discovered-${brand}`}>
                          {brand}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {listedCompetitorsMentioned.length === 0 && discoveredOnly.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No specific brands were mentioned — but your brand wasn't either. This is an opportunity to be the first brand AI recommends.</p>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleAnswer(gap.promptId)}
                  className="text-muted-foreground"
                  data-testid={`button-toggle-answer-${gap.promptId}`}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {isExpanded ? "Hide AI Answer" : "View AI Answer"}
                  {isExpanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                </Button>

                {isExpanded && gap.answer && (
                  <div className="p-4 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap" data-testid={`text-ai-answer-${gap.promptId}`}>
                    {gap.answer}
                  </div>
                )}

                {gap.suggestedAnswer ? (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-2 text-success">
                      <Lightbulb className="h-4 w-4" />
                      <span className="font-medium">AEO Suggestion</span>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm">{gap.suggestedAnswer}</p>
                    </div>
                    {gap.suggestedPageType && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ExternalLink className="h-4 w-4" />
                        <span>Create a <strong>{gap.suggestedPageType}</strong> to improve visibility</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={() => onGenerateSuggestion(gap.promptId)}
                    disabled={isGenerating}
                    variant="outline"
                    className="mt-2"
                    data-testid={`button-generate-suggestion-${gap.promptId}`}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Generate AEO Suggestion
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
