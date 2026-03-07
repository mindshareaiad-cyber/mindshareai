import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertTriangle,
  Lightbulb,
  Loader2,
  Lock,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  MoreVertical,
  ArrowRight,
  Sparkles,
  Info,
} from "lucide-react";
import type { GapAnalysis } from "@shared/schema";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GapsTabProps {
  gaps: GapAnalysis[];
  isGenerating: string | null;
  onGenerateSuggestion: (promptId: string) => void;
  onNavigateToSuggestions?: () => void;
  planId?: string;
  userId?: string;
}

type ImpactLevel = "high" | "medium" | "low";
type StatusFilter = "all" | "with_suggestion" | "without_suggestion";
type SortOption = "impact" | "competitors" | "alpha";

function computeImpact(gap: GapAnalysis): { level: ImpactLevel; reason: string } {
  const competitorCount = Object.values(gap.competitorScores).filter(s => s > 0).length;
  const maxCompScore = Math.max(...Object.values(gap.competitorScores), 0);
  const totalBrands = (gap.mentionedBrands?.length || 0) + competitorCount;

  if (maxCompScore >= 2 || competitorCount >= 2 || totalBrands >= 3) {
    return { level: "high", reason: "Multiple competitors recommended or strong competitor presence" };
  }
  if (maxCompScore >= 1 || competitorCount >= 1 || totalBrands >= 1) {
    return { level: "medium", reason: "Competitors mentioned in AI response" };
  }
  return { level: "low", reason: "No specific competitors found — lower urgency" };
}

function ImpactBadge({ level, reason }: { level: ImpactLevel; reason: string }) {
  const config = {
    high: { label: "High", className: "bg-destructive/10 text-destructive border-destructive/20" },
    medium: { label: "Medium", className: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" },
    low: { label: "Low", className: "bg-muted text-muted-foreground border-border" },
  };
  const c = config[level];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`text-xs cursor-help ${c.className}`}>
            {c.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <p className="text-xs">{reason}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function UpgradePrompt({ feature }: { feature: string }) {
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
        <Button onClick={() => window.location.href = "/payment"} size="lg" data-testid="button-upgrade-plan">
          <ArrowUpRight className="h-4 w-4 mr-2" /> Upgrade Your Plan
        </Button>
      </CardContent>
    </Card>
  );
}

export function GapsTab({ gaps, isGenerating, onGenerateSuggestion, onNavigateToSuggestions, planId }: GapsTabProps) {
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set());
  const [hiddenGaps, setHiddenGaps] = useState<Set<string>>(new Set());
  const [engineFilter, setEngineFilter] = useState<string>("all");
  const [impactFilter, setImpactFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("impact");

  const toggleAnswer = (promptId: string) => {
    const next = new Set(expandedAnswers);
    if (next.has(promptId)) next.delete(promptId);
    else next.add(promptId);
    setExpandedAnswers(next);
  };

  const markNotRelevant = (promptId: string) => {
    setHiddenGaps(prev => new Set(prev).add(promptId));
  };

  const restoreAll = () => {
    setHiddenGaps(new Set());
  };

  const activeGaps = gaps.filter(g => !hiddenGaps.has(g.promptId));

  const engines = useMemo(() => {
    const set = new Set<string>();
    activeGaps.forEach(g => { if (g.engine) set.add(g.engine); });
    return Array.from(set).sort();
  }, [activeGaps]);

  const engineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    activeGaps.forEach(g => {
      const eng = g.engine || "unknown";
      counts[eng] = (counts[eng] || 0) + 1;
    });
    return counts;
  }, [activeGaps]);

  const allBrands = useMemo(() => {
    const set = new Set<string>();
    activeGaps.forEach(g => {
      (g.mentionedBrands || []).forEach(b => set.add(b));
      Object.entries(g.competitorScores).filter(([, s]) => s > 0).forEach(([name]) => set.add(name));
    });
    return set.size;
  }, [activeGaps]);

  const gapsWithSuggestions = activeGaps.filter(g => g.suggestedAnswer);
  const gapsWithoutSuggestions = activeGaps.filter(g => !g.suggestedAnswer);

  const gapsWithImpact = useMemo(() => {
    return activeGaps.map(g => ({ ...g, impact: computeImpact(g) }));
  }, [activeGaps]);

  const filteredGaps = useMemo(() => {
    let filtered = gapsWithImpact;

    if (engineFilter !== "all") {
      filtered = filtered.filter(g => g.engine === engineFilter);
    }
    if (impactFilter !== "all") {
      filtered = filtered.filter(g => g.impact.level === impactFilter);
    }
    if (statusFilter === "with_suggestion") {
      filtered = filtered.filter(g => g.suggestedAnswer);
    } else if (statusFilter === "without_suggestion") {
      filtered = filtered.filter(g => !g.suggestedAnswer);
    }

    const impactOrder: Record<ImpactLevel, number> = { high: 0, medium: 1, low: 2 };
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "impact":
          return impactOrder[a.impact.level] - impactOrder[b.impact.level];
        case "competitors": {
          const aCount = Object.values(a.competitorScores).filter(s => s > 0).length + (a.mentionedBrands?.length || 0);
          const bCount = Object.values(b.competitorScores).filter(s => s > 0).length + (b.mentionedBrands?.length || 0);
          return bCount - aCount;
        }
        case "alpha":
          return a.promptText.localeCompare(b.promptText);
        default:
          return 0;
      }
    });

    return filtered;
  }, [gapsWithImpact, engineFilter, impactFilter, statusFilter, sortBy]);

  if (planId === "starter") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-gaps-title">Gap Analysis</h2>
          <p className="text-muted-foreground">Identify where AI is ignoring your brand and prioritise what to fix first</p>
        </div>
        <UpgradePrompt feature="Gap Analysis" />
      </div>
    );
  }

  if (gaps.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-gaps-title">Gap Analysis</h2>
          <p className="text-muted-foreground">Identify where AI is ignoring your brand and prioritise what to fix first</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <div className="inline-flex p-3 rounded-full bg-green-500/10 mb-4">
              <Sparkles className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2" data-testid="text-no-gaps">No Gaps Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Good news — for the prompts we scanned, AI already mentions your brand. Try adding more prompts or competitors to discover new gaps.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const highImpactWithoutSuggestion = gapsWithImpact.filter(g => g.impact.level === "high" && !g.suggestedAnswer).length;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold" data-testid="text-gaps-title">Gap Analysis</h2>
        <p className="text-muted-foreground">
          Identify where AI is ignoring your brand and prioritise what to fix first
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card
          className={`cursor-pointer transition-colors hover:border-primary/40 ${engineFilter === "all" && impactFilter === "all" && statusFilter === "all" ? "border-primary/30 bg-primary/5" : ""}`}
          onClick={() => { setEngineFilter("all"); setImpactFilter("all"); setStatusFilter("all"); }}
          data-testid="card-total-gaps"
        >
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Total Gaps</p>
            <p className="text-2xl font-bold text-destructive" data-testid="text-total-gaps">{activeGaps.length}</p>
          </CardContent>
        </Card>

        <Card className="cursor-default" data-testid="card-by-engine">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">By Engine</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(engineCounts).map(([eng, count]) => (
                <button
                  key={eng}
                  onClick={() => setEngineFilter(engineFilter === eng ? "all" : eng)}
                  className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${engineFilter === eng ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary/40"}`}
                  data-testid={`filter-engine-${eng}`}
                >
                  {eng}: {count}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-default" data-testid="card-brands-found">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Other Brands Found</p>
            <p className="text-2xl font-bold text-primary" data-testid="text-brands-found">{allBrands}</p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors hover:border-primary/40 ${statusFilter === "with_suggestion" ? "border-primary/30 bg-primary/5" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "with_suggestion" ? "all" : "with_suggestion")}
          data-testid="card-with-suggestions"
        >
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">With SEO Suggestions</p>
            <p className="text-2xl font-bold">
              <span className="text-green-600">{gapsWithSuggestions.length}</span>
              <span className="text-muted-foreground text-base font-normal"> / {activeGaps.length}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {gapsWithoutSuggestions.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20" data-testid="banner-no-suggestions">
          <Info className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            You have {gapsWithoutSuggestions.length} gap{gapsWithoutSuggestions.length !== 1 ? "s" : ""} with no SEO suggestions yet.{" "}
            {highImpactWithoutSuggestion > 0
              ? <>Start by sending your top {Math.min(highImpactWithoutSuggestion, 5)} high-impact gaps to SEO Suggestions.</>
              : <>Send gaps to SEO Suggestions to get actionable content recommendations.</>
            }
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 py-1">
        <Select value={engineFilter} onValueChange={setEngineFilter}>
          <SelectTrigger className="w-[150px] h-8 text-xs" data-testid="select-engine-filter">
            <SelectValue placeholder="Engine" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Engines</SelectItem>
            {engines.map(e => (
              <SelectItem key={e} value={e}>{e}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={impactFilter} onValueChange={setImpactFilter}>
          <SelectTrigger className="w-[140px] h-8 text-xs" data-testid="select-impact-filter">
            <SelectValue placeholder="Impact" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Impact</SelectItem>
            <SelectItem value="high">High Impact</SelectItem>
            <SelectItem value="medium">Medium Impact</SelectItem>
            <SelectItem value="low">Low Impact</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-[180px] h-8 text-xs" data-testid="select-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="with_suggestion">With SEO Suggestion</SelectItem>
            <SelectItem value="without_suggestion">Without SEO Suggestion</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          {hiddenGaps.size > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-8" onClick={restoreAll} data-testid="button-restore-hidden">
              <EyeOff className="h-3.5 w-3.5 mr-1" />
              {hiddenGaps.size} hidden
            </Button>
          )}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[170px] h-8 text-xs" data-testid="select-sort">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="impact">Sort by: Impact</SelectItem>
              <SelectItem value="competitors">Sort by: Competitors</SelectItem>
              <SelectItem value="alpha">Sort by: Prompt A–Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredGaps.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No gaps match your current filters. Try adjusting the filters above.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredGaps.map((gap) => {
            const listedCompetitors = Object.entries(gap.competitorScores).filter(([, s]) => s > 0);
            const discoveredOnly = (gap.mentionedBrands || []).filter(
              b => !listedCompetitors.some(([name]) => name.toLowerCase() === b.toLowerCase())
            );
            const allBrandPills = [
              ...listedCompetitors.map(([name]) => ({ name, type: "listed" as const })),
              ...discoveredOnly.map(name => ({ name, type: "discovered" as const })),
            ];
            const showMax = 5;
            const visibleBrands = allBrandPills.slice(0, showMax);
            const overflowCount = allBrandPills.length - showMax;
            const isExpanded = expandedAnswers.has(gap.promptId);
            const hasSuggestion = !!gap.suggestedAnswer;

            return (
              <Card key={gap.promptId} className="overflow-hidden" data-testid={`card-gap-${gap.promptId}`}>
                <div className="p-4 md:p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0 space-y-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <ImpactBadge level={gap.impact.level} reason={gap.impact.reason} />
                        {gap.engine && (
                          <Badge variant="outline" className="text-xs font-normal" data-testid={`badge-engine-${gap.promptId}`}>
                            {gap.engine}
                          </Badge>
                        )}
                        {hasSuggestion ? (
                          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20" data-testid={`badge-status-ready-${gap.promptId}`}>
                            SEO suggestion ready
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-muted text-muted-foreground" data-testid={`badge-status-pending-${gap.promptId}`}>
                            Not analysed
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm font-medium leading-snug" data-testid={`text-gap-prompt-${gap.promptId}`}>
                        {gap.promptText}
                      </p>

                      {allBrandPills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {visibleBrands.map(({ name, type }) => (
                            <span
                              key={name}
                              className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full ${type === "listed" ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-muted text-muted-foreground border border-border"}`}
                              data-testid={`pill-brand-${gap.promptId}-${name}`}
                            >
                              {name}
                            </span>
                          ))}
                          {overflowCount > 0 && (
                            <span className="text-xs text-muted-foreground">+{overflowCount} more</span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No other brands mentioned — opportunity to be first</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {hasSuggestion ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1.5"
                          onClick={onNavigateToSuggestions}
                          data-testid={`button-view-suggestion-${gap.promptId}`}
                        >
                          View SEO Suggestions
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          className="text-xs gap-1.5"
                          disabled={isGenerating !== null}
                          onClick={async () => {
                            onGenerateSuggestion(gap.promptId);
                            if (onNavigateToSuggestions) {
                              setTimeout(() => onNavigateToSuggestions(), 500);
                            }
                          }}
                          data-testid={`button-send-suggestion-${gap.promptId}`}
                        >
                          {isGenerating === gap.promptId ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Generating…
                            </>
                          ) : (
                            <>
                              <Lightbulb className="h-3.5 w-3.5" />
                              Send to SEO Suggestions
                            </>
                          )}
                        </Button>
                      )}

                      <button
                        onClick={() => toggleAnswer(gap.promptId)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title={isExpanded ? "Hide AI answer" : "View AI answer"}
                        data-testid={`button-toggle-answer-${gap.promptId}`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            data-testid={`button-menu-${gap.promptId}`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => markNotRelevant(gap.promptId)} data-testid={`menu-mark-irrelevant-${gap.promptId}`}>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Mark not relevant
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {isExpanded && gap.answer && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap leading-relaxed border" data-testid={`text-ai-answer-${gap.promptId}`}>
                      {gap.answer}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
