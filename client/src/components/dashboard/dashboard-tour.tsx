import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

interface TourStep {
  target: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "tour-card-visibility-score",
    title: "AI Visibility Score",
    description:
      "Your overall visibility score across AI assistants, measured on a 0-2 scale. A score of 2 means AI engines strongly recommend your brand. Below 1 means you're mostly invisible to AI.",
  },
  {
    target: "tour-card-mentions",
    title: "AI Mentions",
    description:
      "How many of your tracked prompts result in AI assistants mentioning your brand. The higher this number relative to your total prompts, the better your AI presence.",
  },
  {
    target: "tour-card-recommendations",
    title: "Recommendations",
    description:
      "The number of times AI engines strongly endorse or recommend your brand as the top choice. These are your strongest wins — where AI actively suggests you to users.",
  },
  {
    target: "tour-card-share-of-voice",
    title: "Share of Voice",
    description:
      "Your brand's mention percentage compared to competitors across all prompts. If competitors are mentioned more, your share of voice will be lower. Aim for above 50%.",
  },
  {
    target: "tour-card-gap-opportunities",
    title: "Gap Opportunities",
    description:
      "Prompts where competitors are mentioned but your brand is not. These are content opportunities — by optimizing for these topics, you can improve your AI visibility.",
  },
  {
    target: "tour-card-brand-performance",
    title: "Brand Performance",
    description:
      "A visual summary of how your brand performs, including your visibility score bar, domain info, and mention rate at a glance.",
  },
  {
    target: "tour-card-competitor-sov",
    title: "Competitor Comparison",
    description:
      "See how each competitor stacks up against your brand. Compare mention counts and share of voice percentages to understand your competitive landscape in AI answers.",
  },
];

const TOUR_STORAGE_KEY = "mindshare_tour_completed";

interface DashboardTourProps {
  enabled: boolean;
}

export function DashboardTour({ enabled }: DashboardTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) {
      setShowTour(false);
      return;
    }
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => setShowTour(true), 800);
      return () => clearTimeout(timer);
    }
  }, [enabled]);

  const positionTooltip = useCallback(() => {
    const step = TOUR_STEPS[currentStep];
    const el = document.querySelector(`[data-testid="${step.target}"]`);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const padding = 8;

    setHighlightStyle({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });

    const tooltipWidth = 340;
    const tooltipHeight = 220;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let top: number;
    let left: number;

    if (rect.bottom + tooltipHeight + 20 < viewportH) {
      top = rect.bottom + 16;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    } else if (rect.top - tooltipHeight - 20 > 0) {
      top = rect.top - tooltipHeight - 16;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    } else {
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      left = rect.right + 16;
    }

    left = Math.max(16, Math.min(left, viewportW - tooltipWidth - 16));
    top = Math.max(16, Math.min(top, viewportH - tooltipHeight - 16));

    setTooltipStyle({ top, left, width: tooltipWidth });
  }, [currentStep]);

  useEffect(() => {
    if (!showTour) return;
    positionTooltip();

    const step = TOUR_STEPS[currentStep];
    const el = document.querySelector(`[data-testid="${step.target}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(positionTooltip, 400);
    }

    window.addEventListener("resize", positionTooltip);
    window.addEventListener("scroll", positionTooltip, true);
    return () => {
      window.removeEventListener("resize", positionTooltip);
      window.removeEventListener("scroll", positionTooltip, true);
    };
  }, [showTour, currentStep, positionTooltip]);

  const completeTour = useCallback(() => {
    setShowTour(false);
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
  }, []);

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  if (!showTour) return null;

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;
  const isFirst = currentStep === 0;

  return (
    <div className="fixed inset-0 z-[100]" data-testid="dashboard-tour">
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(0,0,0,0.5)",
          maskImage: `
            linear-gradient(#000, #000),
            linear-gradient(#000, #000)
          `,
          WebkitMaskImage: `
            linear-gradient(#000, #000),
            linear-gradient(#000, #000)
          `,
        }}
        onClick={completeTour}
      />

      <div
        className="absolute rounded-xl border-2 border-primary/60 transition-all duration-300 ease-in-out pointer-events-none"
        style={{
          ...highlightStyle,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.55), 0 0 20px 4px rgba(124,58,237,0.3)",
        }}
      />

      <div
        ref={tooltipRef}
        className="absolute bg-background border border-border rounded-xl shadow-2xl p-5 transition-all duration-300 ease-in-out"
        style={tooltipStyle}
        data-testid="tour-tooltip"
      >
        {isFirst && (
          <div className="flex items-center gap-2 text-primary mb-3">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-semibold">Welcome Tour</span>
          </div>
        )}

        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-base" data-testid="tour-step-title">
            {step.title}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 -mt-1 -mr-2"
            onClick={completeTour}
            data-testid="tour-close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4" data-testid="tour-step-description">
          {step.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === currentStep
                    ? "w-4 bg-primary"
                    : i < currentStep
                    ? "w-1.5 bg-primary/40"
                    : "w-1.5 bg-muted-foreground/20"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <Button
                variant="ghost"
                size="sm"
                onClick={prevStep}
                className="h-8 px-3"
                data-testid="tour-prev"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            {isFirst && (
              <Button
                variant="ghost"
                size="sm"
                onClick={completeTour}
                className="h-8 px-3 text-muted-foreground"
                data-testid="tour-skip"
              >
                Skip
              </Button>
            )}
            <Button
              size="sm"
              onClick={nextStep}
              className="h-8 px-4"
              data-testid="tour-next"
            >
              {isLast ? "Got it!" : "Next"}
              {!isLast && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground/60 mt-3 text-center">
          Step {currentStep + 1} of {TOUR_STEPS.length}
        </div>
      </div>
    </div>
  );
}
