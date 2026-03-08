import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Trophy,
  AlertTriangle,
  Activity,
  Clock,
  Bookmark,
  Plus,
  X,
  Calendar,
  Mail,
  Download,
  Lock,
  ArrowUpRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import type { ScanWithStats, TrendDataPoint, ScanComparisonResult, HealthScore, SavedView, ReportSchedule } from "@shared/schema";
import type { Project } from "@shared/schema";

interface ReportsTabProps {
  project: Project;
  planId?: string;
}

function HealthScoreGauge({ score, factors }: { score: number; factors: HealthScore["factors"] }) {
  const getColor = (val: number) => {
    if (val >= 70) return "text-success";
    if (val >= 40) return "text-warning";
    return "text-destructive";
  };

  const getLabel = (val: number) => {
    if (val >= 80) return "Excellent";
    if (val >= 60) return "Good";
    if (val >= 40) return "Fair";
    if (val >= 20) return "Needs Work";
    return "Critical";
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/30" />
          <circle
            cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="10"
            className={getColor(score)}
            strokeDasharray={`${(score / 100) * 314} 314`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${getColor(score)}`} data-testid="text-health-score">{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <Badge variant="secondary" data-testid="badge-health-label">{getLabel(score)}</Badge>
      <div className="w-full grid grid-cols-2 gap-2 text-sm">
        {[
          { label: "Visibility", value: factors.visibility },
          { label: "Mentions", value: factors.mentionRate },
          { label: "Recommendations", value: factors.recommendationRate },
          { label: "Gap Coverage", value: factors.gapRatio },
          { label: "Trend", value: factors.trendDirection },
        ].map((f) => (
          <div key={f.label} className="flex justify-between items-center px-2 py-1 rounded bg-muted/50">
            <span className="text-muted-foreground">{f.label}</span>
            <span className={`font-medium ${getColor(f.value)}`}>{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendCharts({ data, engineFilter }: { data: TrendDataPoint[]; engineFilter: string }) {
  const filtered = engineFilter === "all"
    ? data.filter((d) => !d.engine)
    : data.filter((d) => d.engine === engineFilter);

  const chartData = filtered.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    visibility: d.visibilityScore,
    mentions: Math.round(d.mentionRate * 100),
    recommendations: Math.round(d.recommendationRate * 100),
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        No trend data available. Run multiple scans to see trends.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-2">Visibility Score Over Time</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 2]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="visibility" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} name="Visibility Score" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h4 className="text-sm font-medium mb-2">Mention & Recommendation Rates</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
            <Tooltip />
            <Legend />
            <Bar dataKey="mentions" fill="hsl(var(--primary))" name="Mention Rate" radius={[4, 4, 0, 0]} />
            <Bar dataKey="recommendations" fill="hsl(142, 71%, 45%)" name="Recommendation Rate" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ComparisonSection({ data }: { data: ScanComparisonResult[] }) {
  const wins = data.filter((d) => d.type === "win");
  const losses = data.filter((d) => d.type === "loss");

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Run at least two scans to see comparison data.
      </div>
    );
  }

  const engineLabel = (e: string) => {
    const labels: Record<string, string> = { chatgpt: "ChatGPT", claude: "Claude", gemini: "Gemini", perplexity: "Perplexity" };
    return labels[e] || e;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-5 w-5 text-success" />
            Top Wins ({wins.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {wins.length === 0 ? (
            <p className="text-sm text-muted-foreground">No wins this scan.</p>
          ) : (
            <div className="space-y-3">
              {wins.slice(0, 10).map((w, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-success/5 border border-success/20" data-testid={`card-win-${i}`}>
                  <ArrowUp className="h-4 w-4 text-success mt-1 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{w.promptText}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{engineLabel(w.engine)}</Badge>
                      <span className="text-xs text-muted-foreground">{w.previousScore} → {w.currentScore}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            High-Risk Losses ({losses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {losses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No losses this scan.</p>
          ) : (
            <div className="space-y-3">
              {losses.slice(0, 10).map((l, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-destructive/5 border border-destructive/20" data-testid={`card-loss-${i}`}>
                  <ArrowDown className="h-4 w-4 text-destructive mt-1 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{l.promptText}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{engineLabel(l.engine)}</Badge>
                      <span className="text-xs text-muted-foreground">{l.previousScore} → {l.currentScore}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ScanHistory({ scans }: { scans: ScanWithStats[] }) {
  if (scans.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No scan history yet.
      </div>
    );
  }

  const engineLabel = (e: string) => {
    const labels: Record<string, string> = { chatgpt: "ChatGPT", claude: "Claude", gemini: "Gemini", perplexity: "Perplexity" };
    return labels[e] || e;
  };

  return (
    <div className="space-y-2">
      {scans.map((scan, i) => (
        <div key={scan.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors" data-testid={`row-scan-${i}`}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              {new Date(scan.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
          <div className="flex gap-1">
            {((scan.engines as string[]) || []).map((e) => (
              <Badge key={e} variant="outline" className="text-xs">{engineLabel(e)}</Badge>
            ))}
          </div>
          <div className="flex items-center gap-4 ml-auto text-sm">
            <div className="flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">{scan.visibilityScore}</span>
            </div>
            <div className="text-muted-foreground">{scan.mentionCount}/{scan.totalPrompts} mentioned</div>
            <div className="text-muted-foreground">{scan.shareOfVoice}% SoV</div>
          </div>
          {scan.notes && <span className="text-xs text-muted-foreground italic truncate max-w-[120px]">{scan.notes}</span>}
        </div>
      ))}
    </div>
  );
}

function SavedViewsSection({ projectId, views, onApply }: { projectId: string; views: SavedView[]; onApply: (filters: any) => void }) {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newFilters, setNewFilters] = useState<{ engines?: string[]; funnelStage?: string; country?: string }>({});

  const createView = useMutation({
    mutationFn: (data: { name: string; filters: any }) =>
      apiRequest("POST", `/api/projects/${projectId}/saved-views`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "saved-views"] });
      setShowAdd(false);
      setNewName("");
      setNewFilters({});
      toast({ title: "View saved" });
    },
  });

  const deleteView = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/saved-views/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "saved-views"] });
      toast({ title: "View deleted" });
    },
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {views.map((v) => (
          <div key={v.id} className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => onApply(v.filters)}
              data-testid={`button-view-${v.name}`}
            >
              <Bookmark className="h-3 w-3 mr-1" />
              {v.name}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => deleteView.mutate(v.id)}
              data-testid={`button-delete-view-${v.name}`}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {!showAdd && (
          <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowAdd(true)} data-testid="button-add-view">
            <Plus className="h-3 w-3 mr-1" /> Save View
          </Button>
        )}
      </div>
      {showAdd && (
        <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
          <Input
            placeholder="View name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-8 text-sm max-w-[180px]"
            data-testid="input-view-name"
          />
          <Select value={newFilters.funnelStage || ""} onValueChange={(v) => setNewFilters({ ...newFilters, funnelStage: v || undefined })}>
            <SelectTrigger className="h-8 text-sm w-[140px]">
              <SelectValue placeholder="Funnel stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top">Top of Funnel</SelectItem>
              <SelectItem value="middle">Middle of Funnel</SelectItem>
              <SelectItem value="bottom">Bottom of Funnel</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Country..."
            value={newFilters.country || ""}
            onChange={(e) => setNewFilters({ ...newFilters, country: e.target.value || undefined })}
            className="h-8 text-sm max-w-[120px]"
            data-testid="input-view-country"
          />
          <Button
            size="sm"
            className="h-8"
            disabled={!newName.trim()}
            onClick={() => createView.mutate({ name: newName.trim(), filters: newFilters })}
            data-testid="button-save-view"
          >
            Save
          </Button>
          <Button variant="ghost" size="sm" className="h-8" onClick={() => { setShowAdd(false); setNewName(""); setNewFilters({}); }}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

function ScheduleSection({ projectId, schedules }: { projectId: string; schedules: ReportSchedule[] }) {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [frequency, setFrequency] = useState("weekly");
  const [emails, setEmails] = useState("");

  const createSchedule = useMutation({
    mutationFn: (data: { frequency: string; recipientEmails: string[] }) =>
      apiRequest("POST", `/api/projects/${projectId}/report-schedules`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "report-schedules"] });
      setShowAdd(false);
      setEmails("");
      toast({ title: "Report schedule created" });
    },
  });

  const toggleSchedule = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      apiRequest("PATCH", `/api/report-schedules/${id}`, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "report-schedules"] });
    },
  });

  const deleteSchedule = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/report-schedules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "report-schedules"] });
      toast({ title: "Schedule deleted" });
    },
  });

  return (
    <div className="space-y-3">
      {schedules.map((s) => (
        <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`row-schedule-${s.id}`}>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium capitalize">{s.frequency} Report</p>
              <p className="text-xs text-muted-foreground">{(s.recipientEmails as string[]).join(", ")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={s.enabled ? "default" : "secondary"} className="text-xs">
              {s.enabled ? "Active" : "Paused"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSchedule.mutate({ id: s.id, enabled: !s.enabled })}
              data-testid={`button-toggle-schedule-${s.id}`}
            >
              {s.enabled ? "Pause" : "Resume"}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteSchedule.mutate(s.id)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
      {!showAdd ? (
        <Button variant="outline" size="sm" onClick={() => setShowAdd(true)} data-testid="button-add-schedule">
          <Plus className="h-4 w-4 mr-1" /> Add Schedule
        </Button>
      ) : (
        <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger className="h-8 text-sm w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Emails (comma-separated)..."
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            className="h-8 text-sm flex-1"
            data-testid="input-schedule-emails"
          />
          <Button
            size="sm"
            className="h-8"
            disabled={!emails.trim()}
            onClick={() => {
              const emailList = emails.split(",").map((e) => e.trim()).filter(Boolean);
              if (emailList.length > 0) {
                createSchedule.mutate({ frequency, recipientEmails: emailList });
              }
            }}
            data-testid="button-save-schedule"
          >
            Save
          </Button>
          <Button variant="ghost" size="sm" className="h-8" onClick={() => { setShowAdd(false); setEmails(""); }}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

export function ReportsTab({ project, planId }: ReportsTabProps) {
  const [engineFilter, setEngineFilter] = useState("all");
  const isUnlocked = planId !== "starter";

  const { data: scanHistory = [] } = useQuery<ScanWithStats[]>({
    queryKey: ["/api/projects", project.id, "scans", "history"],
    enabled: !!project.id && isUnlocked,
  });

  const { data: trendData = [] } = useQuery<TrendDataPoint[]>({
    queryKey: ["/api/projects", project.id, "trends"],
    enabled: !!project.id && isUnlocked,
  });

  const { data: comparison = [] } = useQuery<ScanComparisonResult[]>({
    queryKey: ["/api/projects", project.id, "scan-comparison"],
    enabled: !!project.id && isUnlocked,
  });

  const { data: healthScore } = useQuery<HealthScore>({
    queryKey: ["/api/projects", project.id, "health-score"],
    enabled: !!project.id && isUnlocked,
  });

  const { data: savedViews = [] } = useQuery<SavedView[]>({
    queryKey: ["/api/projects", project.id, "saved-views"],
    enabled: !!project.id && isUnlocked,
  });

  const { data: schedules = [] } = useQuery<ReportSchedule[]>({
    queryKey: ["/api/projects", project.id, "report-schedules"],
    enabled: !!project.id && isUnlocked,
  });

  if (!isUnlocked) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-10 text-center">
          <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Advanced Reports is available on Growth and Pro plans</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Upgrade your plan to unlock advanced reports, trend analysis, scan comparisons, health scoring, and scheduled email reports.
          </p>
          <Button onClick={() => window.location.href = "/payment"} size="lg" data-testid="button-upgrade-reports">
            <ArrowUpRight className="h-4 w-4 mr-2" /> Upgrade Your Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  const availableEngines = Array.from(
    new Set(trendData.filter((d) => d.engine).map((d) => d.engine!))
  );

  const handleApplyView = (filters: any) => {
    if (filters.engines?.length === 1) {
      setEngineFilter(filters.engines[0]);
    } else {
      setEngineFilter("all");
    }
  };

  const exportCSV = () => {
    if (scanHistory.length === 0) return;
    const headers = ["Date", "Visibility Score", "Mentions", "Recommendations", "Total Prompts", "Share of Voice %", "Engines", "Notes"];
    const rows = scanHistory.map((s) => [
      new Date(s.createdAt).toISOString(),
      s.visibilityScore,
      s.mentionCount,
      s.recommendationCount,
      s.totalPrompts,
      s.shareOfVoice,
      ((s.engines as string[]) || []).join("; "),
      s.notes || "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.brandName}-scan-history.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-reports-title">Advanced Reports</h2>
          <p className="text-muted-foreground">Track trends, wins, losses, and overall brand health.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={engineFilter} onValueChange={setEngineFilter}>
            <SelectTrigger className="w-[150px]" data-testid="select-engine-filter">
              <SelectValue placeholder="All Engines" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Engines</SelectItem>
              {availableEngines.map((e) => (
                <SelectItem key={e} value={e}>
                  {e === "chatgpt" ? "ChatGPT" : e === "claude" ? "Claude" : e === "gemini" ? "Gemini" : e === "perplexity" ? "Perplexity" : e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportCSV} data-testid="button-export-csv">
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      <SavedViewsSection projectId={project.id} views={savedViews} onApply={handleApplyView} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Visibility Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrendCharts data={trendData} engineFilter={engineFilter} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Brand Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            {healthScore ? (
              <HealthScoreGauge score={healthScore.overall} factors={healthScore.factors} />
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                Run a scan to see your health score.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ComparisonSection data={comparison} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scan History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScanHistory scans={scanHistory} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduled Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleSection projectId={project.id} schedules={schedules} />
        </CardContent>
      </Card>
    </div>
  );
}
