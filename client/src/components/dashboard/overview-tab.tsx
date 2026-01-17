import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, MessageSquare, Cpu, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Project } from "@shared/schema";

interface OverviewTabProps {
  project: Project;
  visibilityScore: number | null;
  promptCount: number;
  engineCount: number;
  lastScanDate: Date | null;
  competitorScores: Record<string, number>;
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
}) {
  const getScoreColor = () => {
    if (typeof value !== "number") return "";
    if (value >= 1.5) return "text-success";
    if (value >= 0.75) return "text-warning";
    return "text-destructive";
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
          <span className={`text-3xl font-bold ${getScoreColor()}`}>{value}</span>
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

export function OverviewTab({
  project,
  visibilityScore,
  promptCount,
  engineCount,
  lastScanDate,
  competitorScores,
}: OverviewTabProps) {
  const sortedCompetitors = Object.entries(competitorScores)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="AI Visibility Score"
          value={visibilityScore !== null ? visibilityScore.toFixed(2) : "—"}
          subtitle="0 = invisible, 2 = strongly recommended"
          icon={Eye}
        />
        <MetricCard
          title="Total Prompts"
          value={promptCount}
          subtitle="Questions being tracked"
          icon={MessageSquare}
        />
        <MetricCard
          title="Engines"
          value={engineCount || 1}
          subtitle="AI models scanned"
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Brand Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{project.brandName}</span>
                  <span className={`font-bold ${
                    (visibilityScore || 0) >= 1.5 ? "text-success" 
                      : (visibilityScore || 0) >= 0.75 ? "text-warning" 
                      : "text-destructive"
                  }`}>
                    {visibilityScore?.toFixed(2) || "—"}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      (visibilityScore || 0) >= 1.5 ? "bg-success" 
                        : (visibilityScore || 0) >= 0.75 ? "bg-warning" 
                        : "bg-destructive"
                    }`}
                    style={{ width: `${((visibilityScore || 0) / 2) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{project.brandDomain}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Competitor Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {project.competitors.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No competitors configured</p>
                <p className="text-sm">Add competitors to compare visibility</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedCompetitors.length > 0 ? (
                  sortedCompetitors.map(([competitor, score]) => (
                    <div key={competitor} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">{competitor}</span>
                      <span className={`font-bold ${
                        score >= 1.5 ? "text-success" 
                          : score >= 0.75 ? "text-warning" 
                          : "text-destructive"
                      }`}>
                        {score.toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  project.competitors.map((competitor) => (
                    <div key={competitor} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">{competitor}</span>
                      <span className="text-muted-foreground">—</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
