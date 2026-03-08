import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
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
  Info,
  ChevronRight,
  Lightbulb,
  FileText,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import type { ScanWithStats, TrendDataPoint, ScanComparisonResult, HealthScore, SavedView, ReportSchedule, ScanResult } from "@shared/schema";
import type { Project } from "@shared/schema";

type EnrichedScanResult = ScanResult & { promptText: string };

interface ReportsTabProps {
  project: Project;
  planId?: string;
}

const ENGINE_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
};

const SCORE_LABELS: Record<number, string> = {
  0: "Invisible",
  1: "Mentioned",
  2: "Recommended",
};

const SECTION_OPTIONS = [
  { id: "health_score", label: "Health Score" },
  { id: "wins_losses", label: "Wins & Losses" },
  { id: "trends", label: "Visibility Trends" },
  { id: "scan_history", label: "Scan History" },
];

function getChangeDescription(previousScore: number, currentScore: number): string {
  if (previousScore === 0 && currentScore === 1) return "Newly mentioned";
  if (previousScore === 0 && currentScore === 2) return "Newly recommended";
  if (previousScore === 1 && currentScore === 2) return "Upgraded to recommendation";
  if (previousScore === 2 && currentScore === 1) return "Downgraded to mention only";
  if (previousScore === 1 && currentScore === 0) return "Lost mention entirely";
  if (previousScore === 2 && currentScore === 0) return "Lost all visibility";
  return `${SCORE_LABELS[previousScore] || previousScore} → ${SCORE_LABELS[currentScore] || currentScore}`;
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative w-32 h-32 cursor-help">
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
              <div className="absolute -top-1 -right-1">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs p-4">
            <p className="font-semibold mb-2">How the score is calculated</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span>Visibility (avg score)</span><span className="font-medium">30%</span></div>
              <div className="flex justify-between"><span>Mention rate</span><span className="font-medium">20%</span></div>
              <div className="flex justify-between"><span>Recommendation rate</span><span className="font-medium">20%</span></div>
              <div className="flex justify-between"><span>Gap coverage</span><span className="font-medium">15%</span></div>
              <div className="flex justify-between"><span>Trend direction</span><span className="font-medium">15%</span></div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
            <RechartsTooltip />
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
            <RechartsTooltip />
            <Legend />
            <Bar dataKey="mentions" fill="hsl(var(--primary))" name="Mention Rate" radius={[4, 4, 0, 0]} />
            <Bar dataKey="recommendations" fill="hsl(142, 71%, 45%)" name="Recommendation Rate" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ComparisonSection({ data, onViewSuggestions }: { data: ScanComparisonResult[]; onViewSuggestions?: () => void }) {
  const wins = data.filter((d) => d.type === "win");
  const losses = data.filter((d) => d.type === "loss");

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Run at least two scans to see comparison data.
      </div>
    );
  }

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
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20" data-testid={`card-win-${i}`}>
                  <ArrowUp className="h-4 w-4 text-success mt-1 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug">{w.promptText}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge variant="outline" className="text-xs">{ENGINE_LABELS[w.engine] || w.engine}</Badge>
                      <Badge variant="secondary" className="text-xs text-success border-success/30">
                        {getChangeDescription(w.previousScore, w.currentScore)}
                      </Badge>
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
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-2">No losses this scan — nice work!</p>
              <p className="text-xs text-muted-foreground">Keep scanning regularly to catch regressions early.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {losses.slice(0, 10).map((l, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20" data-testid={`card-loss-${i}`}>
                  <ArrowDown className="h-4 w-4 text-destructive mt-1 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug">{l.promptText}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge variant="outline" className="text-xs">{ENGINE_LABELS[l.engine] || l.engine}</Badge>
                      <Badge variant="secondary" className="text-xs text-destructive border-destructive/30">
                        {getChangeDescription(l.previousScore, l.currentScore)}
                      </Badge>
                    </div>
                    {onViewSuggestions && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 mt-1.5 text-xs text-primary hover:text-primary"
                        onClick={onViewSuggestions}
                        data-testid={`button-view-suggestions-${i}`}
                      >
                        <Lightbulb className="h-3 w-3 mr-1" /> View AEO Suggestions
                      </Button>
                    )}
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

function ScanHistory({ scans, projectId }: { scans: ScanWithStats[]; projectId: string }) {
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);
  const selectedScan = scans.find((s) => s.id === selectedScanId);

  const { data: scanResults = [], isLoading: isLoadingResults } = useQuery<EnrichedScanResult[]>({
    queryKey: ["/api/projects", projectId, "scans", selectedScanId, "results"],
    enabled: !!selectedScanId,
  });

  if (scans.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No scan history yet.
      </div>
    );
  }

  const getBiggestWinLoss = (results: EnrichedScanResult[]) => {
    let bestPrompt = "";
    let bestScore = -1;
    let worstPrompt = "";
    let worstScore = 3;

    for (const r of results) {
      if (r.brandScore > bestScore) {
        bestScore = r.brandScore;
        bestPrompt = r.promptText || "Unknown";
      }
      if (r.brandScore < worstScore) {
        worstScore = r.brandScore;
        worstPrompt = r.promptText || "Unknown";
      }
    }
    return { bestPrompt, bestScore, worstPrompt, worstScore };
  };

  const summary = scanResults.length > 0 ? getBiggestWinLoss(scanResults) : null;

  return (
    <>
      <div className="space-y-2">
        {scans.map((scan, i) => {
          const engines = ((scan.engines as string[]) || []);
          return (
            <div
              key={scan.id}
              className={`flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer ${selectedScanId === scan.id ? "ring-2 ring-primary border-primary" : ""}`}
              onClick={() => setSelectedScanId(selectedScanId === scan.id ? null : scan.id)}
              data-testid={`row-scan-${i}`}
            >
              <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  {new Date(scan.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div className="flex gap-1 shrink-0">
                {engines.map((e) => (
                  <Badge key={e} variant="outline" className="text-xs">{ENGINE_LABELS[e] || e}</Badge>
                ))}
              </div>
              <div className="flex items-center gap-4 ml-auto text-sm shrink-0">
                <div className="flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium">{scan.visibilityScore.toFixed(2)}</span>
                </div>
                <span className="text-muted-foreground">
                  {scan.mentionCount}/{scan.totalPrompts} mentions ({scan.shareOfVoice}% SoV)
                </span>
              </div>
              <ChevronRight className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${selectedScanId === scan.id ? "rotate-90" : ""}`} />
            </div>
          );
        })}
      </div>

      <Sheet open={!!selectedScanId} onOpenChange={(open) => { if (!open) setSelectedScanId(null); }}>
        <SheetContent className="w-[400px] sm:w-[480px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Scan Summary
            </SheetTitle>
          </SheetHeader>
          {selectedScan && (
            <div className="mt-6 space-y-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedScan.createdAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </p>
                <div className="flex gap-1 mt-1">
                  {((selectedScan.engines as string[]) || []).map((e) => (
                    <Badge key={e} variant="outline" className="text-xs">{ENGINE_LABELS[e] || e}</Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Visibility Score</p>
                  <p className="text-lg font-bold" data-testid="text-scan-detail-visibility">{selectedScan.visibilityScore.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Share of Voice</p>
                  <p className="text-lg font-bold">{selectedScan.shareOfVoice}%</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Mentions</p>
                  <p className="text-lg font-bold">{selectedScan.mentionCount}/{selectedScan.totalPrompts}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Recommendations</p>
                  <p className="text-lg font-bold">{selectedScan.recommendationCount}/{selectedScan.totalPrompts}</p>
                </div>
              </div>

              {isLoadingResults && (
                <div className="text-center py-4 text-muted-foreground text-sm">Loading scan details...</div>
              )}

              {!isLoadingResults && summary && scanResults.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Highlights</h4>
                  <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="h-3.5 w-3.5 text-success" />
                      <span className="text-xs font-medium text-success">Best Result</span>
                    </div>
                    <p className="text-sm">{summary.bestPrompt}</p>
                    <Badge variant="secondary" className="text-xs mt-1">{SCORE_LABELS[summary.bestScore] || `Score: ${summary.bestScore}`}</Badge>
                  </div>
                  {summary.worstScore < 2 && (
                    <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                        <span className="text-xs font-medium text-destructive">Biggest Gap</span>
                      </div>
                      <p className="text-sm">{summary.worstPrompt}</p>
                      <Badge variant="secondary" className="text-xs mt-1">{SCORE_LABELS[summary.worstScore] || `Score: ${summary.worstScore}`}</Badge>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
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
  const [scheduleName, setScheduleName] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [emails, setEmails] = useState("");
  const [selectedSections, setSelectedSections] = useState<string[]>(["health_score", "wins_losses", "trends", "scan_history"]);

  const createSchedule = useMutation({
    mutationFn: (data: { name: string; frequency: string; recipientEmails: string[]; sections: string[] }) =>
      apiRequest("POST", `/api/projects/${projectId}/report-schedules`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "report-schedules"] });
      setShowAdd(false);
      setScheduleName("");
      setEmails("");
      setSelectedSections(["health_score", "wins_losses", "trends", "scan_history"]);
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

  const toggleSection = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((s) => s !== sectionId)
        : [...prev, sectionId]
    );
  };

  const sectionLabel = (id: string) => SECTION_OPTIONS.find((s) => s.id === id)?.label || id;

  return (
    <div className="space-y-4">
      {schedules.length === 0 && !showAdd && (
        <div className="text-center py-6">
          <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-1">No scheduled reports yet.</p>
          <p className="text-xs text-muted-foreground">Create automated email reports to keep your team informed.</p>
        </div>
      )}

      {schedules.map((s) => {
        const scheduleSections = (s.sections as string[]) || [];
        return (
          <div key={s.id} className="p-4 border rounded-lg space-y-2" data-testid={`row-schedule-${s.id}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold">{(s as any).name || `${s.frequency} Report`}</p>
                  <p className="text-xs text-muted-foreground capitalize">{s.frequency} to {(s.recipientEmails as string[]).join(", ")}</p>
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
            {scheduleSections.length > 0 && (
              <div className="flex gap-1 flex-wrap pl-7">
                {scheduleSections.map((sec) => (
                  <Badge key={sec} variant="outline" className="text-xs">{sectionLabel(sec)}</Badge>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {!showAdd ? (
        <Button variant="outline" size="sm" onClick={() => setShowAdd(true)} data-testid="button-add-schedule">
          <Plus className="h-4 w-4 mr-1" /> Add Schedule
        </Button>
      ) : (
        <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Schedule Name</Label>
              <Input
                placeholder="e.g. Weekly CMO Summary..."
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
                className="h-9 text-sm"
                data-testid="input-schedule-name"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Recipients</Label>
            <Input
              placeholder="Emails (comma-separated)..."
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              className="h-9 text-sm"
              data-testid="input-schedule-emails"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Include in Report</Label>
            <div className="flex flex-wrap gap-3">
              {SECTION_OPTIONS.map((section) => (
                <label key={section.id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedSections.includes(section.id)}
                    onCheckedChange={() => toggleSection(section.id)}
                    data-testid={`checkbox-section-${section.id}`}
                  />
                  <span className="text-sm">{section.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              disabled={!emails.trim() || selectedSections.length === 0}
              onClick={() => {
                const emailList = emails.split(",").map((e) => e.trim()).filter(Boolean);
                if (emailList.length > 0) {
                  createSchedule.mutate({
                    name: scheduleName.trim() || `${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Report`,
                    frequency,
                    recipientEmails: emailList,
                    sections: selectedSections,
                  });
                }
              }}
              data-testid="button-save-schedule"
            >
              Create Schedule
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setShowAdd(false); setScheduleName(""); setEmails(""); setSelectedSections(["health_score", "wins_losses", "trends", "scan_history"]); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ReportsTab({ project, planId }: ReportsTabProps) {
  const [engineFilter, setEngineFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("90");
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

  const now = new Date();
  const cutoffDays = parseInt(timeRange);
  const cutoff = new Date(now.getTime() - cutoffDays * 24 * 60 * 60 * 1000);

  const filteredTrendData = trendData.filter((d) => new Date(d.date) >= cutoff);
  const filteredScanHistory = scanHistory.filter((s) => new Date(s.createdAt) >= cutoff);

  const handleApplyView = (filters: any) => {
    if (filters.engines?.length === 1) {
      setEngineFilter(filters.engines[0]);
    } else {
      setEngineFilter("all");
    }
  };

  const exportCSV = () => {
    if (filteredScanHistory.length === 0) return;
    const headers = ["Date", "Visibility Score", "Mentions", "Recommendations", "Total Prompts", "Share of Voice %", "Engines", "Notes"];
    const rows = filteredScanHistory.map((s) => [
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

  const handleViewSuggestions = () => {
    const sidebarLink = document.querySelector('[data-testid="sidebar-section-suggestions"]') as HTMLElement;
    if (sidebarLink) sidebarLink.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-reports-title">Advanced Reports</h2>
          <p className="text-muted-foreground">Track trends, wins, losses, and overall brand health.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[130px]" data-testid="select-time-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={engineFilter} onValueChange={setEngineFilter}>
            <SelectTrigger className="w-[150px]" data-testid="select-engine-filter">
              <SelectValue placeholder="All Engines" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Engines</SelectItem>
              {availableEngines.map((e) => (
                <SelectItem key={e} value={e}>
                  {ENGINE_LABELS[e] || e}
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
            <TrendCharts data={filteredTrendData} engineFilter={engineFilter} />
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

      <ComparisonSection data={comparison} onViewSuggestions={handleViewSuggestions} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scan History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScanHistory scans={filteredScanHistory} projectId={project.id} />
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
