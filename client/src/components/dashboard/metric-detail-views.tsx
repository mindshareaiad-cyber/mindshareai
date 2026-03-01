import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Eye,
  MessageSquare,
  ThumbsUp,
  PieChart,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  XCircle,
  Cpu,
  BarChart3,
} from "lucide-react";
import type { Project, ScanResult, Prompt, GapAnalysis } from "@shared/schema";

export type MetricDetailType = "visibility" | "mentions" | "recommendations" | "share-of-voice" | "gaps";

interface MetricDetailProps {
  type: MetricDetailType;
  project: Project;
  results: (ScanResult & { prompt: Prompt })[];
  gaps: GapAnalysis[];
  visibilityScore: number | null;
  mentionCount: number;
  recommendationCount: number;
  shareOfVoice: number;
  competitorScores: Record<string, number>;
  onBack: () => void;
}

const ENGINE_DISPLAY: Record<string, { label: string; color: string }> = {
  chatgpt: { label: "ChatGPT", color: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
  openai: { label: "ChatGPT", color: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
  claude: { label: "Claude", color: "bg-orange-500/10 text-orange-700 border-orange-200" },
  anthropic: { label: "Claude", color: "bg-orange-500/10 text-orange-700 border-orange-200" },
  gemini: { label: "Gemini", color: "bg-blue-500/10 text-blue-700 border-blue-200" },
  google: { label: "Gemini", color: "bg-blue-500/10 text-blue-700 border-blue-200" },
  perplexity: { label: "Perplexity", color: "bg-purple-500/10 text-purple-700 border-purple-200" },
};

function ScoreBadge({ score }: { score: number }) {
  if (score === 2) return <Badge className="bg-success text-white" data-testid="badge-score-recommended">Recommended</Badge>;
  if (score === 1) return <Badge className="bg-warning text-white" data-testid="badge-score-mentioned">Mentioned</Badge>;
  return <Badge variant="destructive" data-testid="badge-score-invisible">Invisible</Badge>;
}

function EngineBadge({ engine }: { engine: string }) {
  const display = ENGINE_DISPLAY[engine] || { label: engine, color: "bg-gray-100 text-gray-700 border-gray-200" };
  return <Badge variant="outline" className={display.color}>{display.label}</Badge>;
}

function DetailHeader({ title, subtitle, icon: Icon, onBack }: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2" data-testid="button-back-to-overview">
        <ArrowLeft className="h-4 w-4" />
        Back to Overview
      </Button>
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-detail-title">{title}</h2>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function NoScanDataMessage({ onBack }: { onBack: () => void }) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Scan Data Yet</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-4">
          Run your first AI visibility scan to see detailed metrics here. Add prompts in the Prompts tab, then click Run Scan.
        </p>
        <Button variant="outline" onClick={onBack} data-testid="button-back-no-data">
          Back to Overview
        </Button>
      </CardContent>
    </Card>
  );
}

function VisibilityScoreDetail({ project, results, visibilityScore, onBack }: MetricDetailProps) {
  if (results.length === 0) {
    return (
      <div className="space-y-6">
        <DetailHeader title="AI Visibility Score" subtitle={`Detailed breakdown for ${project.brandName}`} icon={Eye} onBack={onBack} />
        <NoScanDataMessage onBack={onBack} />
      </div>
    );
  }

  const engines = [...new Set(results.map(r => r.engine))];
  const engineBreakdown = engines.map(engine => {
    const engineResults = results.filter(r => r.engine === engine);
    const avgScore = engineResults.length > 0
      ? engineResults.reduce((sum, r) => sum + r.brandScore, 0) / engineResults.length
      : 0;
    const recommended = engineResults.filter(r => r.brandScore === 2).length;
    const mentioned = engineResults.filter(r => r.brandScore === 1).length;
    const invisible = engineResults.filter(r => r.brandScore === 0).length;
    return { engine, avgScore, total: engineResults.length, recommended, mentioned, invisible };
  }).sort((a, b) => b.avgScore - a.avgScore);

  const lowestScoringPrompts = [...results]
    .sort((a, b) => a.brandScore - b.brandScore)
    .slice(0, 10);

  const highestScoringPrompts = [...results]
    .filter(r => r.brandScore === 2)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <DetailHeader
        title="AI Visibility Score"
        subtitle={`Detailed breakdown for ${project.brandName}`}
        icon={Eye}
        onBack={onBack}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${
                (visibilityScore || 0) >= 1.5 ? "text-success" : (visibilityScore || 0) >= 0.75 ? "text-warning" : "text-destructive"
              }`} data-testid="text-overall-score">
                {visibilityScore !== null ? visibilityScore.toFixed(2) : "—"}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Overall Score (0-2)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold" data-testid="text-total-prompts-analyzed">{results.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Prompts Analyzed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold" data-testid="text-engines-count">{engines.length}</div>
              <p className="text-sm text-muted-foreground mt-1">AI Engines Used</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {engineBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Score by AI Engine
            </CardTitle>
            <CardDescription>How each AI engine rates your brand</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {engineBreakdown.map(({ engine, avgScore, total, recommended, mentioned, invisible }) => (
                <div key={engine} className="space-y-2" data-testid={`engine-breakdown-${engine}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <EngineBadge engine={engine} />
                      <span className="text-sm text-muted-foreground">{total} prompts</span>
                    </div>
                    <span className={`text-lg font-bold ${
                      avgScore >= 1.5 ? "text-success" : avgScore >= 0.75 ? "text-warning" : "text-destructive"
                    }`}>
                      {avgScore.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={(avgScore / 2) * 100} className="h-2" />
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="text-success">{recommended} recommended</span>
                    <span className="text-warning">{mentioned} mentioned</span>
                    <span className="text-destructive">{invisible} invisible</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {Object.keys(competitorScores).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Your Score vs Competitors
            </CardTitle>
            <CardDescription>Average visibility score comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2">
                  <Badge variant="default">You</Badge>
                  <span className="font-semibold">{project.brandName}</span>
                </div>
                <span className={`text-lg font-bold ${
                  (visibilityScore || 0) >= 1.5 ? "text-success" : (visibilityScore || 0) >= 0.75 ? "text-warning" : "text-destructive"
                }`}>
                  {visibilityScore !== null ? visibilityScore.toFixed(2) : "—"}
                </span>
              </div>
              {Object.entries(competitorScores).sort(([, a], [, b]) => b - a).map(([name, score]) => (
                <div key={name} className="space-y-1" data-testid={`competitor-vis-${name}`}>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">{name}</span>
                    <span className={`text-lg font-bold ${
                      score > (visibilityScore || 0) ? "text-destructive" : "text-muted-foreground"
                    }`}>
                      {score.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={(score / 2) * 100} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {lowestScoringPrompts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-destructive" />
                Lowest Scoring Prompts
              </CardTitle>
              <CardDescription>These prompts need the most improvement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowestScoringPrompts.map((result) => (
                  <div key={result.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg" data-testid={`low-prompt-${result.id}`}>
                    <ScoreBadge score={result.brandScore} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.prompt.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <EngineBadge engine={result.engine} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {highestScoringPrompts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Top Performing Prompts
              </CardTitle>
              <CardDescription>Prompts where your brand is strongly recommended</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {highestScoringPrompts.map((result) => (
                  <div key={result.id} className="flex items-start gap-3 p-3 bg-success/5 rounded-lg" data-testid={`top-prompt-${result.id}`}>
                    <ScoreBadge score={result.brandScore} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.prompt.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <EngineBadge engine={result.engine} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function MentionsDetail({ project, results, mentionCount, onBack }: MetricDetailProps) {
  if (results.length === 0) {
    return (
      <div className="space-y-6">
        <DetailHeader title="AI Mentions" subtitle={`Where ${project.brandName} appears in AI responses`} icon={MessageSquare} onBack={onBack} />
        <NoScanDataMessage onBack={onBack} />
      </div>
    );
  }

  const mentionedResults = results.filter(r => r.brandScore >= 1);
  const notMentionedResults = results.filter(r => r.brandScore === 0);

  const engineMentions = [...new Set(results.map(r => r.engine))].map(engine => {
    const engineResults = results.filter(r => r.engine === engine);
    const mentions = engineResults.filter(r => r.brandScore >= 1).length;
    return { engine, total: engineResults.length, mentions, rate: engineResults.length > 0 ? Math.round((mentions / engineResults.length) * 100) : 0 };
  }).sort((a, b) => b.rate - a.rate);

  return (
    <div className="space-y-6">
      <DetailHeader
        title="AI Mentions"
        subtitle={`Every prompt where ${project.brandName} was mentioned`}
        icon={MessageSquare}
        onBack={onBack}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-success" data-testid="text-mention-count">{mentionCount}</div>
              <p className="text-sm text-muted-foreground mt-1">Total Mentions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-destructive" data-testid="text-not-mentioned-count">{notMentionedResults.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Not Mentioned</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold" data-testid="text-mention-rate">
                {results.length > 0 ? Math.round((mentionCount / results.length) * 100) : 0}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">Mention Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {engineMentions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Mentions by Engine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {engineMentions.map(({ engine, total, mentions, rate }) => (
                <div key={engine} className="space-y-2" data-testid={`engine-mentions-${engine}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <EngineBadge engine={engine} />
                      <span className="text-sm text-muted-foreground">{mentions} of {total} prompts</span>
                    </div>
                    <span className="text-sm font-bold">{rate}%</span>
                  </div>
                  <Progress value={rate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Mentioned In ({mentionedResults.length})
          </CardTitle>
          <CardDescription>Prompts where AI mentioned your brand</CardDescription>
        </CardHeader>
        <CardContent>
          {mentionedResults.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No mentions yet. Run a scan to see results.</p>
          ) : (
            <div className="space-y-3">
              {mentionedResults.map((result) => (
                <div key={result.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg" data-testid={`mention-result-${result.id}`}>
                  <ScoreBadge score={result.brandScore} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{result.prompt.text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <EngineBadge engine={result.engine} />
                    </div>
                    {result.answer && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{result.answer}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {notMentionedResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Not Mentioned ({notMentionedResults.length})
            </CardTitle>
            <CardDescription>Prompts where your brand was invisible to AI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notMentionedResults.map((result) => (
                <div key={result.id} className="flex items-start gap-3 p-3 bg-destructive/5 rounded-lg" data-testid={`not-mentioned-result-${result.id}`}>
                  <ScoreBadge score={result.brandScore} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{result.prompt.text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <EngineBadge engine={result.engine} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RecommendationsDetail({ project, results, recommendationCount, onBack }: MetricDetailProps) {
  if (results.length === 0) {
    return (
      <div className="space-y-6">
        <DetailHeader title="Recommendations" subtitle={`When AI strongly endorses ${project.brandName}`} icon={ThumbsUp} onBack={onBack} />
        <NoScanDataMessage onBack={onBack} />
      </div>
    );
  }

  const recommendedResults = results.filter(r => r.brandScore === 2);
  const mentionedOnlyResults = results.filter(r => r.brandScore === 1);
  const totalPrompts = results.length;

  return (
    <div className="space-y-6">
      <DetailHeader
        title="Recommendations"
        subtitle={`When AI strongly endorses ${project.brandName}`}
        icon={ThumbsUp}
        onBack={onBack}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-success" data-testid="text-recommended-count">{recommendationCount}</div>
              <p className="text-sm text-muted-foreground mt-1">Strongly Endorsed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-warning" data-testid="text-mentioned-only-count">{mentionedOnlyResults.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Mentioned Only</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold" data-testid="text-recommendation-rate">
                {totalPrompts > 0 ? Math.round((recommendationCount / totalPrompts) * 100) : 0}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">Recommendation Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-success" />
            Strongly Endorsed ({recommendedResults.length})
          </CardTitle>
          <CardDescription>Prompts where AI specifically recommends your brand as a top choice</CardDescription>
        </CardHeader>
        <CardContent>
          {recommendedResults.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No strong recommendations yet.</p>
              <p className="text-sm mt-1">Focus on creating authoritative content that positions your brand as a clear solution.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendedResults.map((result) => {
                const compScores = result.competitorScores as Record<string, number>;
                const competitorsAlsoRecommended = Object.entries(compScores).filter(([, s]) => s === 2);
                return (
                  <div key={result.id} className="p-4 bg-success/5 rounded-lg border border-success/20" data-testid={`recommended-result-${result.id}`}>
                    <div className="flex items-start gap-3">
                      <ScoreBadge score={2} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{result.prompt.text}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <EngineBadge engine={result.engine} />
                          {competitorsAlsoRecommended.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              Also recommended: {competitorsAlsoRecommended.map(([name]) => name).join(", ")}
                            </span>
                          )}
                        </div>
                        {result.answer && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{result.answer}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {mentionedOnlyResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Minus className="h-5 w-5 text-warning" />
              Mentioned But Not Recommended ({mentionedOnlyResults.length})
            </CardTitle>
            <CardDescription>Opportunities to move from "mentioned" to "recommended" — improve content to make AI endorse you more strongly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mentionedOnlyResults.map((result) => (
                <div key={result.id} className="flex items-start gap-3 p-3 bg-warning/5 rounded-lg border border-warning/20" data-testid={`mentioned-only-result-${result.id}`}>
                  <ScoreBadge score={1} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{result.prompt.text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <EngineBadge engine={result.engine} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ShareOfVoiceDetail({ project, results, shareOfVoice, mentionCount, competitorScores, onBack }: MetricDetailProps) {
  if (results.length === 0) {
    return (
      <div className="space-y-6">
        <DetailHeader title="Share of Voice" subtitle={`${project.brandName} vs competitors in AI responses`} icon={PieChart} onBack={onBack} />
        <NoScanDataMessage onBack={onBack} />
      </div>
    );
  }

  const competitors = Object.keys(competitorScores);

  const promptComparison = [...new Set(results.map(r => r.prompt.text))].map(promptText => {
    const promptResults = results.filter(r => r.prompt.text === promptText);
    const bestBrandScore = Math.max(...promptResults.map(r => r.brandScore), 0);
    const compBest: Record<string, number> = {};
    competitors.forEach(comp => {
      compBest[comp] = Math.max(
        ...promptResults.map(r => {
          const cs = r.competitorScores as Record<string, number>;
          return cs[comp] || 0;
        }),
        0
      );
    });
    const isWinning = bestBrandScore > 0 && Object.values(compBest).every(s => bestBrandScore >= s);
    const isLosing = bestBrandScore === 0 && Object.values(compBest).some(s => s > 0);
    return { promptText, brandScore: bestBrandScore, compBest, isWinning, isLosing };
  });

  const winning = promptComparison.filter(p => p.isWinning);
  const losing = promptComparison.filter(p => p.isLosing);

  const competitorShareOfVoice = competitors.map(comp => {
    const mentions = results.filter(r => {
      const cs = r.competitorScores as Record<string, number>;
      return (cs[comp] || 0) >= 1;
    }).length;
    const sov = results.length > 0 ? Math.round((mentions / results.length) * 100) : 0;
    return { name: comp, mentions, sov, avgScore: competitorScores[comp] || 0 };
  }).sort((a, b) => b.sov - a.sov);

  return (
    <div className="space-y-6">
      <DetailHeader
        title="Share of Voice"
        subtitle={`How ${project.brandName} compares to competitors across AI engines`}
        icon={PieChart}
        onBack={onBack}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${shareOfVoice >= 50 ? "text-success" : shareOfVoice >= 25 ? "text-warning" : "text-destructive"}`} data-testid="text-sov-percentage">
                {shareOfVoice}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">Your Share of Voice</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-success" data-testid="text-winning-count">{winning.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Prompts You're Winning</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-destructive" data-testid="text-losing-count">{losing.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Prompts You're Losing</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Competitive Leaderboard</CardTitle>
          <CardDescription>How each competitor's AI visibility compares to yours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2">
                <Badge variant="default">You</Badge>
                <span className="font-semibold">{project.brandName}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{mentionCount} mentions</span>
                <span className="text-lg font-bold text-primary">{shareOfVoice}%</span>
              </div>
            </div>

            {competitorShareOfVoice.map(({ name, mentions, sov, avgScore }) => (
              <div key={name} className="space-y-2" data-testid={`competitor-sov-${name}`}>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">{name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{mentions} mentions</span>
                    <span className={`text-lg font-bold ${sov > shareOfVoice ? "text-destructive" : "text-muted-foreground"}`}>
                      {sov}%
                    </span>
                  </div>
                </div>
                <Progress value={sov} className="h-1.5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {(() => {
        const engines = [...new Set(results.map(r => r.engine))];
        if (engines.length <= 1) return null;
        const engineSov = engines.map(engine => {
          const engineResults = results.filter(r => r.engine === engine);
          const brandMentions = engineResults.filter(r => r.brandScore >= 1).length;
          const engineSovPct = engineResults.length > 0 ? Math.round((brandMentions / engineResults.length) * 100) : 0;
          return { engine, total: engineResults.length, brandMentions, sov: engineSovPct };
        }).sort((a, b) => b.sov - a.sov);

        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Share of Voice by Engine
              </CardTitle>
              <CardDescription>Your brand's visibility rate on each AI engine</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {engineSov.map(({ engine, total, brandMentions, sov }) => (
                  <div key={engine} className="space-y-2" data-testid={`engine-sov-${engine}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <EngineBadge engine={engine} />
                        <span className="text-sm text-muted-foreground">{brandMentions} of {total} prompts</span>
                      </div>
                      <span className={`text-sm font-bold ${sov >= 50 ? "text-success" : sov >= 25 ? "text-warning" : "text-destructive"}`}>{sov}%</span>
                    </div>
                    <Progress value={sov} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {winning.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Winning Prompts ({winning.length})
              </CardTitle>
              <CardDescription>You outperform all competitors on these prompts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {winning.slice(0, 10).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-success/5 rounded-lg" data-testid={`winning-prompt-${idx}`}>
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-success/20 text-success text-xs font-bold flex items-center justify-center">
                      {item.brandScore}
                    </div>
                    <p className="text-sm font-medium">{item.promptText}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {losing.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-destructive" />
                Losing Prompts ({losing.length})
              </CardTitle>
              <CardDescription>Competitors are visible but you're not — fix these first</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {losing.slice(0, 10).map((item, idx) => {
                  const topComp = Object.entries(item.compBest)
                    .filter(([, s]) => s > 0)
                    .sort(([, a], [, b]) => b - a);
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-destructive/5 rounded-lg" data-testid={`losing-prompt-${idx}`}>
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive/20 text-destructive text-xs font-bold flex items-center justify-center">
                        0
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.promptText}</p>
                        {topComp.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Winning: {topComp.map(([name, score]) => `${name} (${score})`).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function GapOpportunitiesDetail({ project, results, gaps, onBack }: MetricDetailProps) {
  if (results.length === 0 && gaps.length === 0) {
    return (
      <div className="space-y-6">
        <DetailHeader title="Gap Opportunities" subtitle={`Where ${project.brandName} is missing from AI responses`} icon={AlertTriangle} onBack={onBack} />
        <NoScanDataMessage onBack={onBack} />
      </div>
    );
  }

  const highPriority = gaps.filter(g => {
    const maxComp = Math.max(...Object.values(g.competitorScores), 0);
    return maxComp >= 2;
  });
  const mediumPriority = gaps.filter(g => {
    const maxComp = Math.max(...Object.values(g.competitorScores), 0);
    return maxComp === 1;
  });

  return (
    <div className="space-y-6">
      <DetailHeader
        title="Gap Opportunities"
        subtitle={`Content gaps where ${project.brandName} is missing from AI answers`}
        icon={AlertTriangle}
        onBack={onBack}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-warning" data-testid="text-total-gaps">{gaps.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Total Gaps</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-destructive" data-testid="text-high-priority-gaps">{highPriority.length}</div>
              <p className="text-sm text-muted-foreground mt-1">High Priority</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-warning" data-testid="text-medium-priority-gaps">{mediumPriority.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Medium Priority</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {highPriority.length > 0 && (
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              High Priority Gaps
            </CardTitle>
            <CardDescription>Competitors are strongly recommended here but you're invisible — address these first</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highPriority.map((gap, idx) => {
                const compEntries = Object.entries(gap.competitorScores).filter(([, s]) => s > 0).sort(([, a], [, b]) => b - a);
                return (
                  <div key={gap.promptId} className="p-4 bg-destructive/5 rounded-lg border border-destructive/10" data-testid={`high-gap-${idx}`}>
                    <div className="flex items-start gap-3">
                      <Badge variant="destructive" className="shrink-0">High</Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{gap.promptText}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {compEntries.map(([name, score]) => (
                            <span key={name} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-muted rounded-md">
                              {name}: <span className={score === 2 ? "text-success font-bold" : "text-warning font-bold"}>{score}</span>
                            </span>
                          ))}
                        </div>
                        {gap.suggestedAnswer && (
                          <div className="mt-3 p-3 bg-primary/5 rounded-md border border-primary/10">
                            <p className="text-xs font-medium text-primary mb-1">AEO Suggestion:</p>
                            <p className="text-xs text-muted-foreground line-clamp-3">{gap.suggestedAnswer}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {mediumPriority.length > 0 && (
        <Card className="border-warning/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Medium Priority Gaps
            </CardTitle>
            <CardDescription>Competitors are mentioned but not strongly recommended — opportunity to get ahead</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mediumPriority.map((gap, idx) => {
                const compEntries = Object.entries(gap.competitorScores).filter(([, s]) => s > 0);
                return (
                  <div key={gap.promptId} className="p-4 bg-warning/5 rounded-lg border border-warning/10" data-testid={`medium-gap-${idx}`}>
                    <div className="flex items-start gap-3">
                      <Badge className="bg-warning text-white shrink-0">Medium</Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{gap.promptText}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {compEntries.map(([name, score]) => (
                            <span key={name} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-muted rounded-md">
                              {name}: <span className="text-warning font-bold">{score}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {gaps.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-success" />
            <h3 className="text-lg font-semibold mb-2">No Gaps Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your brand is being mentioned wherever competitors are. Keep monitoring to stay ahead.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function MetricDetailView(props: MetricDetailProps) {
  switch (props.type) {
    case "visibility":
      return <VisibilityScoreDetail {...props} />;
    case "mentions":
      return <MentionsDetail {...props} />;
    case "recommendations":
      return <RecommendationsDetail {...props} />;
    case "share-of-voice":
      return <ShareOfVoiceDetail {...props} />;
    case "gaps":
      return <GapOpportunitiesDetail {...props} />;
    default:
      return null;
  }
}
