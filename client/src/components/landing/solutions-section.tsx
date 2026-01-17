import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, MapPin, X } from "lucide-react";

const solutions = [
  {
    icon: Building2,
    title: "For SaaS & B2B Marketers",
    description: "Track how AI assistants recommend your product when prospects ask buyer-intent questions.",
    replaces: [
      "Manual prompt checking in ChatGPT",
      "Messy screenshot folders",
      "Ad-hoc competitor monitoring",
      "Guessing at AI visibility gaps",
    ],
  },
  {
    icon: Users,
    title: "For Agencies",
    description: "Deliver AI visibility reports for your clients and show them exactly where they stand.",
    replaces: [
      "Time-consuming manual audits",
      "Inconsistent reporting methods",
      "No AEO benchmarking data",
      "Reactive rather than proactive strategy",
    ],
  },
  {
    icon: MapPin,
    title: "For Local & Service Businesses",
    description: "Ensure AI assistants recommend your business when people ask for local services.",
    replaces: [
      "Hoping AI finds your business",
      "No visibility into AI recommendations",
      "Missing local search opportunities",
      "Outdated business information",
    ],
  },
];

export function SolutionsSection() {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            AI solutions for every team
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're marketing SaaS products, running an agency, or growing a local business—understand your AI visibility.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutions.map((solution) => (
            <Card key={solution.title} className="hover-elevate">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <solution.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{solution.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">{solution.description}</p>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Replaces</p>
                  {solution.replaces.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <X className="h-3 w-3 text-destructive flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
