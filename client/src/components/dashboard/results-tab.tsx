import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BarChart3, Filter, HelpCircle } from "lucide-react";
import { useState } from "react";
import type { ScanResult, Prompt } from "@shared/schema";

const ENGINE_DISPLAY: Record<string, { label: string; color: string }> = {
  chatgpt: { label: "ChatGPT", color: "bg-emerald-500/10 text-emerald-600" },
  claude: { label: "Claude", color: "bg-orange-500/10 text-orange-600" },
  gemini: { label: "Gemini", color: "bg-blue-500/10 text-blue-600" },
  perplexity: { label: "Perplexity", color: "bg-purple-500/10 text-purple-600" },
  deepseek: { label: "DeepSeek", color: "bg-cyan-500/10 text-cyan-600" },
};

const SCORING_CRITERIA = [
  { score: 2, label: "Recommended", description: "Clearly recommended or strongly endorsed as a top choice" },
  { score: 1, label: "Mentioned", description: "Mentioned in the response but not the primary recommendation" },
  { score: 0, label: "Not Mentioned", description: "Not mentioned at all in the AI response" },
];

interface ResultsTabProps {
  results: (ScanResult & { prompt: Prompt })[];
  competitors: string[];
}

function ScoreBadge({ score }: { score: number }) {
  const getStyle = () => {
    if (score >= 2) return "bg-success/10 text-success";
    if (score >= 1) return "bg-warning/10 text-warning";
    return "bg-destructive/10 text-destructive";
  };

  const getLabel = () => {
    if (score >= 2) return "Recommended";
    if (score >= 1) return "Mentioned";
    return "Not Mentioned";
  };
  
  const criteria = SCORING_CRITERIA.find(c => c.score === score);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-help ${getStyle()}`}>
          <span className="font-bold">{score}</span>
          <span className="hidden sm:inline">- {getLabel()}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="font-medium">{getLabel()}</p>
        <p className="text-xs text-muted-foreground">{criteria?.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function EngineBadge({ engine }: { engine: string }) {
  const display = ENGINE_DISPLAY[engine] || { label: engine, color: "bg-muted text-muted-foreground" };
  return (
    <Badge variant="secondary" className={`text-xs font-medium ${display.color}`}>
      {display.label}
    </Badge>
  );
}

export function ResultsTab({ results, competitors }: ResultsTabProps) {
  const [showGapsOnly, setShowGapsOnly] = useState(false);

  const filteredResults = showGapsOnly
    ? results.filter((r) => {
        const hasCompetitorMention = Object.values(r.competitorScores).some((s) => s > 0);
        return r.brandScore === 0 && hasCompetitorMention;
      })
    : results;

  const gapCount = results.filter((r) => {
    const hasCompetitorMention = Object.values(r.competitorScores).some((s) => s > 0);
    return r.brandScore === 0 && hasCompetitorMention;
  }).length;

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="font-semibold mb-2">No scan results yet</h3>
          <p className="text-muted-foreground">
            Run a scan to see how AI assistants respond to your prompts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold">Scan Results</h2>
          <p className="text-sm text-muted-foreground">
            {results.length} results, {gapCount} gaps identified
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Scoring</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-sm p-4">
              <p className="font-semibold mb-2">Visibility Scoring Criteria</p>
              <ul className="space-y-2 text-sm">
                {SCORING_CRITERIA.map((c) => (
                  <li key={c.score} className="flex gap-2">
                    <span className="font-bold w-4">{c.score}</span>
                    <span><strong>{c.label}:</strong> {c.description}</span>
                  </li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
          <div className="flex items-center gap-2">
            <Switch
              id="gaps-filter"
              checked={showGapsOnly}
              onCheckedChange={setShowGapsOnly}
              data-testid="switch-gaps-only"
            />
            <Label htmlFor="gaps-filter" className="text-sm">
              Show gaps only
            </Label>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[300px]">Prompt</TableHead>
                  <TableHead className="text-center">Your Brand</TableHead>
                  {competitors.map((competitor) => (
                    <TableHead key={competitor} className="text-center min-w-[100px]">
                      {competitor}
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Engine</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow key={result.id} data-testid={`result-row-${result.id}`}>
                    <TableCell className="font-medium">
                      {result.prompt.text}
                    </TableCell>
                    <TableCell className="text-center">
                      <ScoreBadge score={result.brandScore} />
                    </TableCell>
                    {competitors.map((competitor) => (
                      <TableCell key={competitor} className="text-center">
                        <ScoreBadge score={result.competitorScores[competitor] || 0} />
                      </TableCell>
                    ))}
                    <TableCell className="text-center">
                      <EngineBadge engine={result.engine} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {showGapsOnly && filteredResults.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No gaps found. Your brand is visible across all scanned prompts!</p>
        </div>
      )}
    </div>
  );
}
