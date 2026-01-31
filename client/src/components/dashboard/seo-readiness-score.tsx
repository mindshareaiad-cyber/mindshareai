import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, Trophy } from "lucide-react";

interface SeoReadinessScoreProps {
  score: number;
  level: "not_ready" | "needs_work" | "ready" | "excellent";
  aeoReady: boolean;
}

const levelConfig = {
  not_ready: {
    label: "Not Ready",
    color: "bg-destructive text-destructive-foreground",
    icon: XCircle,
    description: "Build your SEO foundation before starting AEO",
  },
  needs_work: {
    label: "Needs Work",
    color: "bg-yellow-500 text-white",
    icon: AlertTriangle,
    description: "Getting there! Complete more checklist items",
  },
  ready: {
    label: "Ready",
    color: "bg-green-500 text-white",
    icon: CheckCircle2,
    description: "Good foundation for AI visibility optimization",
  },
  excellent: {
    label: "Excellent",
    color: "bg-primary text-primary-foreground",
    icon: Trophy,
    description: "Outstanding SEO foundation for AEO success",
  },
};

export function SeoReadinessScore({ score, level, aeoReady }: SeoReadinessScoreProps) {
  const config = levelConfig[level];
  const Icon = config.icon;

  const getProgressColor = () => {
    if (score < 30) return "bg-destructive";
    if (score < 60) return "bg-yellow-500";
    if (score < 85) return "bg-green-500";
    return "bg-primary";
  };

  return (
    <Card data-testid="seo-readiness-score-widget">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">SEO Readiness Score</CardTitle>
          <Badge className={config.color} data-testid="readiness-level-badge">
            <Icon className="h-3.5 w-3.5 mr-1" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold" data-testid="readiness-score-value">
              {score}
            </span>
            <span className="text-lg text-muted-foreground mb-1">/ 100</span>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={score} 
              className="h-3"
              data-testid="readiness-progress-bar"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Not Ready</span>
              <span>Needs Work</span>
              <span>Ready</span>
              <span>Excellent</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {config.description}
          </p>

          {!aeoReady && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Complete the SEO checklist to unlock the full potential of AEO tracking.
              </p>
            </div>
          )}

          {aeoReady && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-700 dark:text-green-400">
                You're ready to start tracking and improving your AI visibility!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
