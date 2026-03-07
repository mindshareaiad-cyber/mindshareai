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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Lightbulb,
  FileText,
  Sparkles,
  Lock,
  ArrowUpRight,
  Loader2,
  Check,
  EyeOff,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Link2,
  Heading1,
  ListChecks,
  MapPin,
  Copy,
  CheckCircle2,
  Info,
} from "lucide-react";
import type { GapAnalysis, AeoSuggestion } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface SuggestionsTabProps {
  gaps: GapAnalysis[];
  isGenerating: string | null;
  onGenerateSuggestion: (promptId: string) => void;
  planId?: string;
  userId?: string;
}

type ImpactLevel = "high" | "medium" | "low";
type TaskStatus = "todo" | "done" | "not_relevant";
type IntentFilter = "all" | "Informational" | "Comparison" | "Transactional" | "FAQ" | "How-to";

function computeImpact(gap: GapAnalysis): { level: ImpactLevel; reason: string } {
  const competitorCount = Object.values(gap.competitorScores).filter(s => s > 0).length;
  const maxCompScore = Math.max(...Object.values(gap.competitorScores), 0);
  const totalBrands = (gap.mentionedBrands?.length || 0) + competitorCount;

  if (maxCompScore >= 2 || competitorCount >= 2 || totalBrands >= 3) {
    return { level: "high", reason: "Commercial intent, many competitors mentioned" };
  }
  if (maxCompScore >= 1 || competitorCount >= 1 || totalBrands >= 1) {
    return { level: "medium", reason: "Competitors mentioned in AI response" };
  }
  return { level: "low", reason: "Informational, early research query" };
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
          <div className="flex flex-col items-start">
            <Badge variant="outline" className={`text-xs cursor-help ${c.className}`}>
              {c.label}
            </Badge>
            <span className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{reason}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <p className="text-xs">Priority based on competitor presence and query intent</p>
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
        <Button onClick={() => window.location.href = "/payment"} size="lg" data-testid="button-upgrade-plan-suggestions">
          <ArrowUpRight className="h-4 w-4 mr-2" /> Upgrade Your Plan
        </Button>
      </CardContent>
    </Card>
  );
}

function SuggestionCard({
  gap,
  impact,
  status,
  expanded,
  isGenerating,
  onToggleExpand,
  onGenerate,
  onMarkDone,
  onMarkNotRelevant,
}: {
  gap: GapAnalysis;
  impact: { level: ImpactLevel; reason: string };
  status: TaskStatus;
  expanded: boolean;
  isGenerating: string | null;
  onToggleExpand: () => void;
  onGenerate: () => void;
  onMarkDone: () => void;
  onMarkNotRelevant: () => void;
}) {
  const suggestion = gap.suggestion;
  const intentTag = suggestion?.intentTag || "Informational";

  return (
    <Card className={`overflow-hidden transition-opacity ${status !== "todo" ? "opacity-60" : ""}`} data-testid={`card-suggestion-${gap.promptId}`}>
      <div className="p-4 md:p-5">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <ImpactBadge level={impact.level} reason={impact.reason} />
              {suggestion && (
                <Badge variant="outline" className="text-xs gap-1">
                  {intentTag}
                </Badge>
              )}
              {suggestion?.contentType && (
                <Badge variant="outline" className="text-xs gap-1 bg-primary/5 text-primary border-primary/20">
                  <FileText className="h-3 w-3" />
                  {suggestion.contentType}
                </Badge>
              )}
              {status === "done" && (
                <Badge className="text-xs bg-green-500/10 text-green-600 border-green-500/20" variant="outline">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Done
                </Badge>
              )}
              {status === "not_relevant" && (
                <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">
                  <EyeOff className="h-3 w-3 mr-1" />
                  Not relevant
                </Badge>
              )}
            </div>

            <p className="text-sm font-medium leading-snug" data-testid={`text-suggestion-prompt-${gap.promptId}`}>
              {gap.promptText}
            </p>

            {suggestion?.contentTask && (
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-sm font-medium text-primary" data-testid={`text-content-task-${gap.promptId}`}>
                  {suggestion.contentTask}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {!suggestion && status === "todo" && (
              <Button
                variant="default"
                size="sm"
                className="text-xs gap-1.5"
                disabled={isGenerating !== null}
                onClick={onGenerate}
                data-testid={`button-generate-suggestion-${gap.promptId}`}
              >
                {isGenerating === gap.promptId ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</>
                ) : (
                  <><Sparkles className="h-3.5 w-3.5" /> Generate Brief</>
                )}
              </Button>
            )}

            {suggestion && (
              <button
                onClick={onToggleExpand}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title={expanded ? "Collapse details" : "Expand details"}
                data-testid={`button-expand-${gap.promptId}`}
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" data-testid={`button-menu-suggestion-${gap.promptId}`}>
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {status !== "done" && (
                  <DropdownMenuItem onClick={onMarkDone} data-testid={`menu-mark-done-${gap.promptId}`}>
                    <Check className="h-4 w-4 mr-2" /> Mark as Done
                  </DropdownMenuItem>
                )}
                {status !== "not_relevant" && (
                  <DropdownMenuItem onClick={onMarkNotRelevant} data-testid={`menu-mark-irrelevant-${gap.promptId}`}>
                    <EyeOff className="h-4 w-4 mr-2" /> Mark as Not relevant
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {suggestion && expanded && (
          <div className="mt-4 space-y-4 pt-4 border-t">
            {suggestion.coverageChecklist.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <ListChecks className="h-3.5 w-3.5" />
                  Coverage Checklist
                </div>
                <ul className="space-y-1.5 pl-1">
                  {suggestion.coverageChecklist.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" data-testid={`text-checklist-${gap.promptId}-${i}`}>
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {suggestion.implementationPlace && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <MapPin className="h-3.5 w-3.5" />
                  Where to Implement
                </div>
                <p className="text-sm" data-testid={`text-implementation-${gap.promptId}`}>{suggestion.implementationPlace}</p>
              </div>
            )}

            {suggestion.internalLinkIdeas.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <Link2 className="h-3.5 w-3.5" />
                  Internal Link Ideas
                </div>
                <ul className="space-y-1">
                  {suggestion.internalLinkIdeas.map((link, i) => (
                    <li key={i} className="text-sm text-muted-foreground" data-testid={`text-link-idea-${gap.promptId}-${i}`}>{link}</li>
                  ))}
                </ul>
              </div>
            )}

            {(suggestion.suggestedTitle || suggestion.suggestedHeadings.length > 0) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <Heading1 className="h-3.5 w-3.5" />
                  SEO Scaffolding
                </div>
                {suggestion.suggestedTitle && (
                  <div className="space-y-0.5">
                    <span className="text-xs text-muted-foreground">Suggested H1:</span>
                    <p className="text-sm font-medium" data-testid={`text-title-${gap.promptId}`}>{suggestion.suggestedTitle}</p>
                  </div>
                )}
                {suggestion.suggestedHeadings.length > 0 && (
                  <div className="space-y-0.5">
                    <span className="text-xs text-muted-foreground">Suggested H2s:</span>
                    <ul className="space-y-0.5">
                      {suggestion.suggestedHeadings.map((h, i) => (
                        <li key={i} className="text-sm" data-testid={`text-heading-${gap.promptId}-${i}`}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {suggestion.suggestedIntro && (
              <div className="p-3 bg-muted/50 rounded-lg border text-sm italic" data-testid={`text-intro-${gap.promptId}`}>
                <span className="text-xs font-medium text-muted-foreground not-italic block mb-1">Suggested intro (edit before publishing):</span>
                {suggestion.suggestedIntro}
              </div>
            )}

            {gap.suggestedAnswer && (
              <div className="p-3 bg-accent/50 rounded-lg border border-accent">
                <div className="flex items-center gap-2 text-xs font-medium mb-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Ideal AI Answer
                </div>
                <p className="text-sm leading-relaxed" data-testid={`text-ideal-answer-${gap.promptId}`}>{gap.suggestedAnswer}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export function SuggestionsTab({ gaps, isGenerating, onGenerateSuggestion, planId }: SuggestionsTabProps) {
  const { toast } = useToast();
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [statuses, setStatuses] = useState<Record<string, TaskStatus>>({});
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [intentFilter, setIntentFilter] = useState<IntentFilter>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);

  const toggleExpand = (promptId: string) => {
    const next = new Set(expandedCards);
    if (next.has(promptId)) next.delete(promptId);
    else next.add(promptId);
    setExpandedCards(next);
  };

  const setStatus = (promptId: string, status: TaskStatus) => {
    setStatuses(prev => ({ ...prev, [promptId]: status }));
  };

  const getStatus = (promptId: string): TaskStatus => statuses[promptId] || "todo";

  const gapsWithImpact = useMemo(() => {
    return gaps.map(g => ({ ...g, impact: computeImpact(g) }));
  }, [gaps]);

  const counts = useMemo(() => {
    const c = { total: gaps.length, high: 0, medium: 0, low: 0, done: 0, notRelevant: 0, todo: 0, withSuggestion: 0, withoutSuggestion: 0 };
    gapsWithImpact.forEach(g => {
      c[g.impact.level]++;
      const s = getStatus(g.promptId);
      if (s === "done") c.done++;
      else if (s === "not_relevant") c.notRelevant++;
      else c.todo++;
      if (g.suggestion) c.withSuggestion++;
      else c.withoutSuggestion++;
    });
    return c;
  }, [gapsWithImpact, statuses]);

  const activeGaps = useMemo(() => {
    return gapsWithImpact.filter(g => {
      const s = getStatus(g.promptId);
      if (statusFilter === "done" || statusFilter === "not_relevant") return true;
      if (!showArchived && (s === "done" || s === "not_relevant")) return false;
      return true;
    });
  }, [gapsWithImpact, statuses, showArchived, statusFilter]);

  const filteredGaps = useMemo(() => {
    let filtered = activeGaps;

    if (priorityFilter !== "all") {
      filtered = filtered.filter(g => g.impact.level === priorityFilter);
    }
    if (intentFilter !== "all") {
      filtered = filtered.filter(g => g.suggestion?.intentTag === intentFilter);
    }
    if (statusFilter === "with_suggestion") {
      filtered = filtered.filter(g => g.suggestion);
    } else if (statusFilter === "without_suggestion") {
      filtered = filtered.filter(g => !g.suggestion);
    } else if (statusFilter === "done") {
      filtered = filtered.filter(g => getStatus(g.promptId) === "done");
    } else if (statusFilter === "not_relevant") {
      filtered = filtered.filter(g => getStatus(g.promptId) === "not_relevant");
    }

    const impactOrder: Record<ImpactLevel, number> = { high: 0, medium: 1, low: 2 };
    filtered.sort((a, b) => impactOrder[a.impact.level] - impactOrder[b.impact.level]);

    return filtered;
  }, [activeGaps, priorityFilter, intentFilter, statusFilter, statuses]);

  const copyAllVisible = () => {
    const text = filteredGaps
      .filter(g => g.suggestion)
      .map(g => {
        const s = g.suggestion!;
        return [
          `PROMPT: ${g.promptText}`,
          `PRIORITY: ${g.impact.level.toUpperCase()} — ${g.impact.reason}`,
          `INTENT: ${s.intentTag}`,
          `CONTENT TASK: ${s.contentTask}`,
          `CONTENT TYPE: ${s.contentType}`,
          `COVERAGE:`,
          ...s.coverageChecklist.map(c => `  • ${c}`),
          `WHERE: ${s.implementationPlace}`,
          s.internalLinkIdeas.length > 0 ? `LINKS:\n${s.internalLinkIdeas.map(l => `  • ${l}`).join("\n")}` : "",
          s.suggestedTitle ? `TITLE: ${s.suggestedTitle}` : "",
          s.suggestedHeadings.length > 0 ? `HEADINGS:\n${s.suggestedHeadings.map(h => `  • ${h}`).join("\n")}` : "",
          s.suggestedIntro ? `INTRO: ${s.suggestedIntro}` : "",
          "---",
        ].filter(Boolean).join("\n");
      })
      .join("\n\n");

    navigator.clipboard.writeText(text).then(() => {
      toast({ title: `Copied ${filteredGaps.filter(g => g.suggestion).length} suggestions to clipboard` });
    });
  };

  if (planId === "starter") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-suggestions-title">AEO Suggestions</h2>
          <p className="text-muted-foreground">Content direction and tasks to improve your AI visibility</p>
        </div>
        <UpgradePrompt feature="AEO Suggestions" />
      </div>
    );
  }

  if (gaps.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-suggestions-title">AEO Suggestions</h2>
          <p className="text-muted-foreground">Content direction and tasks to improve your AI visibility</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-semibold mb-2" data-testid="text-no-suggestions">No AEO suggestions available</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Run a scan first to identify gaps, then generate content briefs for each opportunity.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-suggestions-title">AEO Suggestions</h2>
          <p className="text-muted-foreground text-sm mt-1" data-testid="text-suggestions-summary">
            {counts.total} AEO opportunities: {counts.high} High, {counts.medium} Medium, {counts.low} Low.{" "}
            {counts.done > 0 || counts.notRelevant > 0
              ? <>{counts.done} completed, {counts.notRelevant} dismissed, {counts.todo} to do.</>
              : <>{counts.todo} to do.</>
            }
          </p>
        </div>

        {filteredGaps.some(g => g.suggestion) && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 flex-shrink-0"
            onClick={copyAllVisible}
            data-testid="button-copy-all"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy All Visible
          </Button>
        )}
      </div>

      {counts.withoutSuggestion > 0 && counts.withSuggestion > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20" data-testid="banner-generate-more">
          <Info className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {counts.withoutSuggestion} gaps still need content briefs. Generate suggestions from the Gap Analysis page or click "Generate Brief" below.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 py-1">
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px] h-8 text-xs" data-testid="select-priority-filter">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={intentFilter} onValueChange={(v) => setIntentFilter(v as IntentFilter)}>
          <SelectTrigger className="w-[160px] h-8 text-xs" data-testid="select-intent-filter">
            <SelectValue placeholder="Intent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Intent</SelectItem>
            <SelectItem value="Informational">Informational</SelectItem>
            <SelectItem value="Comparison">Comparison</SelectItem>
            <SelectItem value="Transactional">Transactional</SelectItem>
            <SelectItem value="FAQ">FAQ</SelectItem>
            <SelectItem value="How-to">How-to</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] h-8 text-xs" data-testid="select-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="with_suggestion">With Brief</SelectItem>
            <SelectItem value="without_suggestion">Without Brief</SelectItem>
            <SelectItem value="done">Done</SelectItem>
            <SelectItem value="not_relevant">Not Relevant</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto">
          {(counts.done > 0 || counts.notRelevant > 0) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8"
              onClick={() => setShowArchived(!showArchived)}
              data-testid="button-toggle-archived"
            >
              {showArchived ? "Hide" : "Show"} completed/dismissed ({counts.done + counts.notRelevant})
            </Button>
          )}
        </div>
      </div>

      {filteredGaps.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No suggestions match your current filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredGaps.map((gap) => (
            <SuggestionCard
              key={gap.promptId}
              gap={gap}
              impact={gap.impact}
              status={getStatus(gap.promptId)}
              expanded={expandedCards.has(gap.promptId)}
              isGenerating={isGenerating}
              onToggleExpand={() => toggleExpand(gap.promptId)}
              onGenerate={() => onGenerateSuggestion(gap.promptId)}
              onMarkDone={() => setStatus(gap.promptId, "done")}
              onMarkNotRelevant={() => setStatus(gap.promptId, "not_relevant")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
