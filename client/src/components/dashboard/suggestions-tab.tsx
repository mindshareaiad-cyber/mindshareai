import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, FileText, ExternalLink, Sparkles } from "lucide-react";
import type { GapAnalysis } from "@shared/schema";

interface SuggestionsTabProps {
  gaps: GapAnalysis[];
  isGenerating: boolean;
  onGenerateSuggestion: (promptId: string) => void;
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

export function SuggestionsTab({ gaps, isGenerating, onGenerateSuggestion }: SuggestionsTabProps) {
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
