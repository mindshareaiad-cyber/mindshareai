import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Lightbulb, Loader2, ExternalLink } from "lucide-react";
import type { GapAnalysis } from "@shared/schema";

interface GapsTabProps {
  gaps: GapAnalysis[];
  isGenerating: boolean;
  onGenerateSuggestion: (promptId: string) => void;
}

export function GapsTab({ gaps, isGenerating, onGenerateSuggestion }: GapsTabProps) {
  const gapsWithoutSuggestions = gaps.filter(g => !g.suggestedAnswer);
  const gapsWithSuggestions = gaps.filter(g => g.suggestedAnswer);

  if (gaps.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Gap Analysis</h2>
          <p className="text-muted-foreground">Opportunities where competitors are mentioned but you're not</p>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No Gaps Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Run a scan to identify gaps where competitors are being mentioned by AI but your brand isn't.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gap Analysis</h2>
        <p className="text-muted-foreground">
          Found {gaps.length} opportunities where competitors are mentioned but you're not
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-destructive">{gaps.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Need Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-warning">{gapsWithoutSuggestions.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Have Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-success">{gapsWithSuggestions.length}</span>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {gaps.map((gap) => (
          <Card key={gap.promptId} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-base font-medium">{gap.promptText}</CardTitle>
                  <CardDescription className="mt-1">
                    <span className="text-destructive font-medium">Your score: 0</span>
                    {" • "}
                    Competitors mentioned: {Object.entries(gap.competitorScores).filter(([, score]) => score >= 1).map(([name]) => name).join(", ")}
                  </CardDescription>
                </div>
                <Badge variant="destructive" className="flex-shrink-0">
                  Gap
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {Object.entries(gap.competitorScores).filter(([, score]) => score >= 1).map(([comp]) => (
                  <Badge key={comp} variant="secondary">
                    {comp}: mentioned
                  </Badge>
                ))}
              </div>

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
        ))}
      </div>
    </div>
  );
}
