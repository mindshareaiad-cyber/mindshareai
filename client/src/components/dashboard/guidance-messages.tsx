import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, CheckCircle2, Zap, ExternalLink, ChevronRight } from "lucide-react";
import type { GuidanceMessage } from "@shared/schema";

interface GuidanceMessagesProps {
  messages: GuidanceMessage[];
  onActionClick?: (message: GuidanceMessage) => void;
}

const typeConfig = {
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-500/10 border-yellow-500/20",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    titleColor: "text-yellow-700 dark:text-yellow-300",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-500/10 border-blue-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    titleColor: "text-blue-700 dark:text-blue-300",
  },
  success: {
    icon: CheckCircle2,
    bgColor: "bg-green-500/10 border-green-500/20",
    iconColor: "text-green-600 dark:text-green-400",
    titleColor: "text-green-700 dark:text-green-300",
  },
  action: {
    icon: Zap,
    bgColor: "bg-primary/10 border-primary/20",
    iconColor: "text-primary",
    titleColor: "text-primary",
  },
};

export function GuidanceMessages({ messages, onActionClick }: GuidanceMessagesProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <Card data-testid="guidance-messages-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {messages.map((message, index) => {
            const config = typeConfig[message.type];
            const Icon = config.icon;

            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${config.bgColor} transition-colors`}
                data-testid={`guidance-message-${index}`}
              >
                <div className="flex gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
                  <div className="flex-1 space-y-2">
                    <h4 className={`font-medium ${config.titleColor}`}>
                      {message.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {message.message}
                    </p>
                    {message.actionLabel && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 -ml-2"
                        onClick={() => {
                          if (message.actionUrl) {
                            window.open(message.actionUrl, "_blank");
                          } else if (onActionClick) {
                            onActionClick(message);
                          }
                        }}
                        data-testid={`guidance-action-${index}`}
                      >
                        {message.actionLabel}
                        {message.actionUrl ? (
                          <ExternalLink className="h-3.5 w-3.5 ml-1" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
