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
  ShieldCheck
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Project, ScanResult, Prompt, GapAnalysis, SeoReadinessReport } from "@shared/schema";
import { SeoReadinessChecklist } from "./seo-readiness-checklist";
import { SeoReadinessScore } from "./seo-readiness-score";
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
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  valueColor?: string;
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
    <Card>
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

  const [showChecklist, setShowChecklist] = useState(false);

  // Fetch SEO readiness data
  const { data: seoReadiness, isLoading: seoLoading } = useQuery<SeoReadinessReport>({
    queryKey: ["/api/projects", project.id, "seo-readiness"],
  });

  // Mutation to update SEO readiness
  const updateSeoReadiness = useMutation({
    mutationFn: async (updates: Record<string, boolean>) => {
      const res = await apiRequest("PATCH", `/api/projects/${project.id}/seo-readiness`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id, "seo-readiness"] });
    },
  });

  const handleChecklistChange = (key: string, checked: boolean) => {
    updateSeoReadiness.mutate({ [key]: checked });
  };

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="AI Visibility Score"
          value={visibilityScore !== null ? visibilityScore.toFixed(2) : "—"}
          subtitle="0-2 scale"
          icon={Eye}
        />
        <MetricCard
          title="AI Mentions"
          value={mentionCount}
          subtitle={`of ${promptCount} prompts`}
          icon={MessageSquare}
          valueColor={mentionCount > 0 ? "text-success" : "text-muted-foreground"}
        />
        <MetricCard
          title="Recommendations"
          value={recommendationCount}
          subtitle="Strongly endorsed"
          icon={ThumbsUp}
          valueColor={recommendationCount > 0 ? "text-success" : "text-muted-foreground"}
        />
        <MetricCard
          title="Share of Voice"
          value={`${shareOfVoice}%`}
          subtitle="vs competitors"
          icon={PieChart}
          valueColor={shareOfVoice >= 50 ? "text-success" : shareOfVoice >= 25 ? "text-warning" : "text-destructive"}
        />
        <MetricCard
          title="Gap Opportunities"
          value={gaps.length}
          subtitle="Content to create"
          icon={AlertTriangle}
          valueColor={gaps.length > 0 ? "text-warning" : "text-success"}
        />
      </div>

      {/* Secondary metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Prompts"
          value={promptCount}
          subtitle="Questions tracked"
          icon={Target}
        />
        <MetricCard
          title="Engines Tested"
          value={engineCount}
          subtitle="ChatGPT, DeepSeek"
          icon={Cpu}
        />
        <MetricCard
          title="Last Scan"
          value={lastScanDate ? new Date(lastScanDate).toLocaleDateString() : "Never"}
          subtitle={lastScanDate ? new Date(lastScanDate).toLocaleTimeString() : "Run your first scan"}
          icon={Calendar}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand Performance */}
        <Card>
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
        <Card>
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

      {/* SEO Readiness Section - Loading State */}
      {seoLoading && (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
              <span className="text-muted-foreground">Loading SEO readiness...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SEO Readiness Section - Not Ready */}
      {seoReadiness && !seoReadiness.aeoReady && (
        <div className="space-y-4" data-testid="seo-readiness-section">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">SEO Readiness Assessment</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Complete this checklist to build a strong foundation for AI visibility. Brands with better SEO are more likely to be mentioned by AI assistants.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <SeoReadinessScore 
                score={seoReadiness.assessment.overallScore} 
                level={seoReadiness.assessment.recommendationLevel as "not_ready" | "needs_work" | "ready" | "excellent"}
                aeoReady={seoReadiness.aeoReady}
              />
            </div>
            <div className="lg:col-span-2">
              <SeoReadinessChecklist 
                items={seoReadiness.checklist}
                onItemChange={handleChecklistChange}
                isLoading={updateSeoReadiness.isPending}
              />
            </div>
          </div>
          {seoReadiness.guidance.length > 0 && (
            <GuidanceMessages messages={seoReadiness.guidance} />
          )}
        </div>
      )}

      {/* Collapsed SEO Readiness for AEO-ready projects - with toggle */}
      {seoReadiness && seoReadiness.aeoReady && (
        <div className="space-y-4" data-testid="seo-readiness-ready-section">
          <Card className="bg-green-500/5 border-green-500/20">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-500/20">
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-400">SEO Foundation Ready</p>
                    <p className="text-sm text-muted-foreground">
                      Score: {seoReadiness.assessment.overallScore}/100 — Ready for AEO optimization
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500 text-white">
                    {seoReadiness.assessment.recommendationLevel === "excellent" ? "Excellent" : "Ready"}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowChecklist(!showChecklist)}
                    data-testid="toggle-checklist-button"
                  >
                    {showChecklist ? "Hide Checklist" : "View Checklist"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {showChecklist && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <SeoReadinessScore 
                  score={seoReadiness.assessment.overallScore} 
                  level={seoReadiness.assessment.recommendationLevel as "not_ready" | "needs_work" | "ready" | "excellent"}
                  aeoReady={seoReadiness.aeoReady}
                />
              </div>
              <div className="lg:col-span-2">
                <SeoReadinessChecklist 
                  items={seoReadiness.checklist}
                  onItemChange={handleChecklistChange}
                  isLoading={updateSeoReadiness.isPending}
                />
              </div>
            </div>
          )}
        </div>
      )}

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
