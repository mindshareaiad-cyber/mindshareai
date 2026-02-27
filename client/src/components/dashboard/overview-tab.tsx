import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  MessageSquare, 
  ThumbsUp, 
  PieChart, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  Target,
  Cpu,
  Filter,
  ShieldCheck,
  Globe,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Project, ScanResult, Prompt, GapAnalysis, SeoReadinessReport } from "@shared/schema";
import { GuidanceMessages } from "./guidance-messages";

type PromptFilter = "all" | "gaps" | "winning" | "mentioned" | "invisible";

function PromptPerformanceTable({ 
  results, 
  competitors 
}: { 
  results: (ScanResult & { prompt: Prompt })[]; 
  competitors: string[];
}) {
  const [filter, setFilter] = useState<PromptFilter>("all");

  const filteredResults = results.filter((result) => {
    const compScores = result.competitorScores as Record<string, number>;
    const isGap = result.brandScore === 0 && Object.values(compScores).some(s => s > 0);
    
    switch (filter) {
      case "gaps":
        return isGap;
      case "winning":
        return result.brandScore === 2;
      case "mentioned":
        return result.brandScore === 1;
      case "invisible":
        return result.brandScore === 0;
      default:
        return true;
    }
  });

  const filterCounts = {
    all: results.length,
    gaps: results.filter(r => {
      const cs = r.competitorScores as Record<string, number>;
      return r.brandScore === 0 && Object.values(cs).some(s => s > 0);
    }).length,
    winning: results.filter(r => r.brandScore === 2).length,
    mentioned: results.filter(r => r.brandScore === 1).length,
    invisible: results.filter(r => r.brandScore === 0).length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Prompt-Level Performance
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {([
              { id: "all", label: "All" },
              { id: "gaps", label: "Gaps" },
              { id: "winning", label: "Winning" },
              { id: "mentioned", label: "Mentioned" },
              { id: "invisible", label: "Invisible" },
            ] as const).map(({ id, label }) => (
              <Button
                key={id}
                size="sm"
                variant={filter === id ? "default" : "outline"}
                onClick={() => setFilter(id)}
                data-testid={`button-filter-${id}`}
              >
                {label} ({filterCounts[id]})
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredResults.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground" data-testid="text-no-results">
            No prompts match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="table-prompt-performance">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Prompt</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">Your Score</th>
                  {competitors.slice(0, 3).map(comp => (
                    <th key={comp} className="text-center py-3 px-2 font-medium text-muted-foreground">
                      {comp}
                    </th>
                  ))}
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.slice(0, 20).map((result) => {
                  const compScores = result.competitorScores as Record<string, number>;
                  const isGap = result.brandScore === 0 && Object.values(compScores).some(s => s > 0);
                  
                  return (
                    <tr key={result.id} className="border-b last:border-0" data-testid={`row-prompt-${result.id}`}>
                      <td className="py-3 px-2 max-w-xs truncate" data-testid={`text-prompt-${result.id}`}>
                        {result.prompt.text}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`font-bold ${
                          result.brandScore === 2 ? "text-success" 
                            : result.brandScore === 1 ? "text-warning" 
                            : "text-destructive"
                        }`} data-testid={`text-brand-score-${result.id}`}>
                          {result.brandScore}
                        </span>
                      </td>
                      {competitors.slice(0, 3).map(comp => (
                        <td key={comp} className="py-3 px-2 text-center">
                          <span className={`font-medium ${
                            (compScores[comp] || 0) === 2 ? "text-success" 
                              : (compScores[comp] || 0) === 1 ? "text-warning" 
                              : "text-muted-foreground"
                          }`} data-testid={`text-competitor-score-${result.id}-${comp}`}>
                            {compScores[comp] || 0}
                          </span>
                        </td>
                      ))}
                      <td className="py-3 px-2 text-center">
                        {isGap ? (
                          <Badge variant="destructive" data-testid={`badge-status-${result.id}`}>Gap</Badge>
                        ) : result.brandScore === 2 ? (
                          <Badge variant="default" className="bg-success" data-testid={`badge-status-${result.id}`}>Winning</Badge>
                        ) : result.brandScore === 1 ? (
                          <Badge variant="secondary" data-testid={`badge-status-${result.id}`}>Mentioned</Badge>
                        ) : (
                          <Badge variant="outline" data-testid={`badge-status-${result.id}`}>Invisible</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {filteredResults.length > 20 && (
          <p className="text-center text-sm text-muted-foreground mt-4" data-testid="text-results-truncated">
            Showing 20 of {filteredResults.length} results. View all in Results tab.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface OverviewTabProps {
  project: Project;
  visibilityScore: number | null;
  promptCount: number;
  mentionCount: number;
  recommendationCount: number;
  shareOfVoice: number;
  engineCount: number;
  lastScanDate: Date | null;
  competitorScores: Record<string, number>;
  results: (ScanResult & { prompt: Prompt })[];
  gaps: GapAnalysis[];
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  valueColor,
  testId,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  valueColor?: string;
  testId?: string;
}) {
  const getDefaultColor = () => {
    if (typeof value !== "number") return "";
    if (title.includes("Score")) {
      if (value >= 1.5) return "text-success";
      if (value >= 0.75) return "text-warning";
      return "text-destructive";
    }
    return "";
  };

  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold ${valueColor || getDefaultColor()}`}>{value}</span>
          {trend && (
            <span className={`flex items-center text-sm ${
              trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground"
            }`}>
              {trend === "up" && <TrendingUp className="h-4 w-4" />}
              {trend === "down" && <TrendingDown className="h-4 w-4" />}
              {trend === "neutral" && <Minus className="h-4 w-4" />}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

function ScoreBar({ label, score, maxScore = 2 }: { label: string; score: number; maxScore?: number }) {
  const percentage = (score / maxScore) * 100;
  const getColor = () => {
    if (score >= 1.5) return "bg-success";
    if (score >= 0.75) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className="flex items-center gap-3">
      <span className="w-32 text-sm font-medium truncate">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${getColor()}`} style={{ width: `${percentage}%` }} />
      </div>
      <span className={`w-12 text-right text-sm font-bold ${
        score >= 1.5 ? "text-success" : score >= 0.75 ? "text-warning" : "text-destructive"
      }`}>
        {score.toFixed(2)}
      </span>
    </div>
  );
}

export function OverviewTab({
  project,
  visibilityScore,
  promptCount,
  mentionCount,
  recommendationCount,
  shareOfVoice,
  engineCount,
  lastScanDate,
  competitorScores,
  results,
  gaps,
}: OverviewTabProps) {
  const queryClient = useQueryClient();
  const sortedCompetitors = Object.entries(competitorScores)
    .sort(([, a], [, b]) => b - a);

  const [showDetails, setShowDetails] = useState(false);

  const { data: seoReadiness, isLoading: seoLoading } = useQuery<SeoReadinessReport & { analysisDetails?: Record<string, string> }>({
    queryKey: ["/api/projects", project.id, "seo-readiness"],
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/projects/${project.id}/seo-readiness/analyze`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id, "seo-readiness"] });
    },
  });

  // Calculate competitor share of voice
  const competitorShareOfVoice = sortedCompetitors.map(([name, score]) => {
    const mentions = results.filter(r => {
      const compScores = r.competitorScores as Record<string, number>;
      return compScores[name] >= 1;
    }).length;
    return {
      name,
      score,
      mentions,
      shareOfVoice: results.length > 0 ? Math.round((mentions / results.length) * 100) : 0
    };
  });

  // Top gaps to fix
  const topGapsToFix = gaps.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Overview</h2>
        <p className="text-muted-foreground">AI visibility metrics for {project.brandName}</p>
      </div>

      {/* Core AI Visibility Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" data-testid="tour-metrics-grid">
        <MetricCard
          title="AI Visibility Score"
          value={visibilityScore !== null ? visibilityScore.toFixed(2) : "—"}
          subtitle="0-2 scale"
          icon={Eye}
          testId="tour-card-visibility-score"
        />
        <MetricCard
          title="AI Mentions"
          value={mentionCount}
          subtitle={`of ${promptCount} prompts`}
          icon={MessageSquare}
          valueColor={mentionCount > 0 ? "text-success" : "text-muted-foreground"}
          testId="tour-card-mentions"
        />
        <MetricCard
          title="Recommendations"
          value={recommendationCount}
          subtitle="Strongly endorsed"
          icon={ThumbsUp}
          valueColor={recommendationCount > 0 ? "text-success" : "text-muted-foreground"}
          testId="tour-card-recommendations"
        />
        <MetricCard
          title="Share of Voice"
          value={`${shareOfVoice}%`}
          subtitle="vs competitors"
          icon={PieChart}
          valueColor={shareOfVoice >= 50 ? "text-success" : shareOfVoice >= 25 ? "text-warning" : "text-destructive"}
          testId="tour-card-share-of-voice"
        />
        <MetricCard
          title="Gap Opportunities"
          value={gaps.length}
          subtitle="Content to create"
          icon={AlertTriangle}
          valueColor={gaps.length > 0 ? "text-warning" : "text-success"}
          testId="tour-card-gap-opportunities"
        />
      </div>

      {/* Secondary metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" data-testid="tour-secondary-metrics">
        <MetricCard
          title="Total Prompts"
          value={promptCount}
          subtitle="Questions tracked"
          icon={Target}
          testId="tour-card-total-prompts"
        />
        <MetricCard
          title="Engines Tested"
          value={engineCount}
          subtitle="AI engines used"
          icon={Cpu}
          testId="tour-card-engines-tested"
        />
        <MetricCard
          title="Last Scan"
          value={lastScanDate ? new Date(lastScanDate).toLocaleDateString() : "Never"}
          subtitle={lastScanDate ? new Date(lastScanDate).toLocaleTimeString() : "Run your first scan"}
          icon={Calendar}
          testId="tour-card-last-scan"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand Performance */}
        <Card data-testid="tour-card-brand-performance">
          <CardHeader>
            <CardTitle className="text-lg">Your Brand Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScoreBar label={project.brandName} score={visibilityScore || 0} />
            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Domain</span>
                <span className="font-medium">{project.brandDomain}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mention Rate</span>
                <span className="font-medium">
                  {promptCount > 0 ? `${Math.round((mentionCount / promptCount) * 100)}%` : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Recommendation Rate</span>
                <span className="font-medium">
                  {promptCount > 0 ? `${Math.round((recommendationCount / promptCount) * 100)}%` : "—"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competitor Share of Voice */}
        <Card data-testid="tour-card-competitor-sov">
          <CardHeader>
            <CardTitle className="text-lg">Competitor Share of Voice</CardTitle>
          </CardHeader>
          <CardContent>
            {project.competitors.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No competitors configured</p>
                <p className="text-sm">Add competitors to compare visibility</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Your brand first */}
                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">You</Badge>
                    <span className="font-medium">{project.brandName}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{mentionCount} mentions</span>
                    <span className="font-bold text-primary">{shareOfVoice}%</span>
                  </div>
                </div>
                
                {competitorShareOfVoice.map(({ name, score, mentions, shareOfVoice: compSoV }) => (
                  <div key={name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">{name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{mentions} mentions</span>
                      <span className={`font-bold ${
                        compSoV > shareOfVoice ? "text-destructive" : "text-muted-foreground"
                      }`}>
                        {compSoV}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Gaps to Fix */}
      {topGapsToFix.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Top Prompts to Fix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topGapsToFix.map((gap, index) => (
                <div key={gap.promptId} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-warning/20 text-warning text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{gap.promptText}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Competitors: {Object.entries(gap.competitorScores).filter(([, score]) => score >= 1).map(([name]) => name).join(", ")}
                    </p>
                  </div>
                  <Badge variant="destructive" className="flex-shrink-0">Gap</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SEO Readiness Section */}
      <div className="space-y-4" data-testid="seo-readiness-section">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">AEO Readiness Assessment</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending}
            data-testid="button-analyze-seo"
          >
            {analyzeMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
            ) : seoReadiness?.assessment?.overallScore ? (
              <><RefreshCw className="h-4 w-4 mr-2" /> Re-analyze</>
            ) : (
              <><Globe className="h-4 w-4 mr-2" /> Analyze Website</>
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          We automatically scan your website to check if your SEO foundation is strong enough for AEO (Answer Engine Optimization).
        </p>

        {seoLoading && (
          <Card>
            <CardContent className="py-8">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-muted-foreground">Loading assessment...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {!seoLoading && (!seoReadiness || seoReadiness.assessment.overallScore === 0) && !analyzeMutation.isPending && (
          <Card className="border-dashed">
            <CardContent className="py-8">
              <div className="text-center space-y-3">
                <Globe className="h-10 w-10 mx-auto text-muted-foreground/40" />
                <div>
                  <p className="font-medium">No analysis run yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click "Analyze Website" to scan <span className="font-medium">{project.brandDomain}</span> and check your SEO readiness for AEO.
                  </p>
                </div>
                <Button
                  onClick={() => analyzeMutation.mutate()}
                  disabled={analyzeMutation.isPending}
                  data-testid="button-analyze-seo-cta"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Run SEO Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {analyzeMutation.isPending && (
          <Card>
            <CardContent className="py-8">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-center">
                  <p className="font-medium">Analyzing {project.brandDomain}...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Checking meta tags, structured data, headers, content, and more
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!seoLoading && seoReadiness && seoReadiness.assessment.overallScore > 0 && !analyzeMutation.isPending && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className={seoReadiness.aeoReady ? "border-green-500/30 bg-green-500/5" : "border-amber-500/30 bg-amber-500/5"}>
                <CardContent className="py-6">
                  <div className="text-center space-y-3">
                    <div className={`inline-flex p-3 rounded-full ${seoReadiness.aeoReady ? "bg-green-500/20" : "bg-amber-500/20"}`}>
                      <ShieldCheck className={`h-8 w-8 ${seoReadiness.aeoReady ? "text-green-600" : "text-amber-600"}`} />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{seoReadiness.assessment.overallScore}</div>
                      <div className="text-sm text-muted-foreground">/100</div>
                    </div>
                    <Badge className={seoReadiness.aeoReady ? "bg-green-500 text-white" : "bg-amber-500 text-white"}>
                      {seoReadiness.assessment.recommendationLevel === "excellent" ? "Excellent" 
                        : seoReadiness.assessment.recommendationLevel === "ready" ? "AEO Ready" 
                        : seoReadiness.assessment.recommendationLevel === "needs_work" ? "Needs Work" 
                        : "Not Ready"}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {seoReadiness.aeoReady 
                        ? "Your site has a solid foundation for AI visibility" 
                        : "Improve your SEO to unlock better AI visibility"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">SEO Checklist Results</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDetails(!showDetails)}
                        data-testid="toggle-seo-details"
                      >
                        {showDetails ? "Hide Details" : "Show Details"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {seoReadiness.checklist.map((item) => (
                        <div
                          key={item.key}
                          className="flex items-start gap-3 py-2 border-b last:border-0"
                          data-testid={`seo-item-${item.key}`}
                        >
                          {item.checked ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{item.label}</span>
                              <span className={`text-xs font-medium ${item.checked ? "text-green-600" : "text-muted-foreground"}`}>
                                {item.checked ? `+${item.weight} pts` : `+${item.weight} pts`}
                              </span>
                            </div>
                            {showDetails && (
                              <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {seoReadiness.guidance.length > 0 && (
              <GuidanceMessages messages={seoReadiness.guidance} />
            )}
          </>
        )}
      </div>

      {/* Prompt Performance Table */}
      {results.length > 0 && (
        <PromptPerformanceTable 
          results={results} 
          competitors={project.competitors} 
        />
      )}
    </div>
  );
}
