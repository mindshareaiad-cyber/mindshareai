import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Play, Loader2 } from "lucide-react";
import type { Project } from "@shared/schema";

interface DashboardHeaderProps {
  project: Project | null;
  visibilityScore: number | null;
  isScanning: boolean;
  onRunScan: () => void;
}

function ScoreBadge({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 1.5) return "bg-success text-success-foreground";
    if (score >= 0.75) return "bg-warning text-warning-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  return (
    <div className={`px-3 py-1 rounded-full text-sm font-bold ${getColor()}`}>
      {score.toFixed(1)} / 2.0
    </div>
  );
}

export function DashboardHeader({
  project,
  visibilityScore,
  isScanning,
  onRunScan,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
      <div className="flex items-center justify-between h-16 px-4 gap-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-lg truncate max-w-[200px] md:max-w-none">
              {project?.name || "Select a project"}
            </h1>
            {project && visibilityScore !== null && (
              <ScoreBadge score={visibilityScore} />
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {project && (
            <Button
              onClick={onRunScan}
              disabled={isScanning}
              className="gap-2"
              data-testid="button-run-scan"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Scanning...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span className="hidden sm:inline">Run Scan</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
