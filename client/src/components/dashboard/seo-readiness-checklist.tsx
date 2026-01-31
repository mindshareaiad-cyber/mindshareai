import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import type { SeoChecklistItem } from "@shared/schema";

interface SeoReadinessChecklistProps {
  items: SeoChecklistItem[];
  onItemChange?: (key: string, checked: boolean) => void;
  isLoading?: boolean;
  editable?: boolean;
}

export function SeoReadinessChecklist({ 
  items, 
  onItemChange, 
  isLoading = false,
  editable = true 
}: SeoReadinessChecklistProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">SEO Readiness Checklist</CardTitle>
        <CardDescription>
          Complete these items to build a strong foundation for AI visibility
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div 
              key={item.key} 
              className="flex items-start gap-3 p-3 rounded-lg hover-elevate border border-transparent hover:border-border transition-colors"
              data-testid={`checklist-item-${item.key}`}
            >
              <Checkbox
                id={item.key}
                checked={item.checked}
                disabled={isLoading || !editable}
                onCheckedChange={(checked) => {
                  if (onItemChange && typeof checked === "boolean") {
                    onItemChange(item.key, checked);
                  }
                }}
                className="mt-0.5"
                data-testid={`checkbox-${item.key}`}
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Label 
                    htmlFor={item.key} 
                    className={`text-sm font-medium cursor-pointer ${item.checked ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {item.label}
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-sm">{item.description}</p>
                    </TooltipContent>
                  </Tooltip>
                  <span className="text-xs text-muted-foreground ml-auto">
                    +{item.weight} pts
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
