import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart3, Filter } from "lucide-react";
import { useState } from "react";
import type { ScanResult, Prompt } from "@shared/schema";

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

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStyle()}`}>
      <span className="font-bold">{score}</span>
      <span className="hidden sm:inline">- {getLabel()}</span>
    </span>
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
                      <span className="text-xs text-muted-foreground">
                        {result.engine}
                      </span>
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
