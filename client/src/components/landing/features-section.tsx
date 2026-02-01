import { Check, Eye, Map, Users, BarChart3, FileText, Target } from "lucide-react";

const features = [
  {
    id: "visibility",
    title: "See how AI responds to your prompts",
    description: "Run controlled prompts through AI models via API and analyse the responses for brand mentions.",
    icon: Eye,
    bullets: [
      "AI Visibility Score from 0 to 2",
      "Share of voice vs competitors",
      "Prompt-based monitoring you control",
      "Multi-engine scanning (GPT-4o, Claude, etc.)",
    ],
  },
  {
    id: "roadmap",
    title: "Identify potential visibility gaps",
    description: "Discover prompts where competitors appear but you don't, and get content suggestions that may help.",
    icon: Map,
    bullets: [
      "Gap analysis for missing mentions",
      "Suggested content for each gap",
      "Content type recommendations",
      "Priority scoring for potential quick wins",
    ],
  },
  {
    id: "teams",
    title: "Designed for growth teams and agencies",
    description: "Manage multiple brands and deliver professional reports to stakeholders.",
    icon: Users,
    bullets: [
      "Multi-project workspace",
      "White-label reporting",
      "Team collaboration features",
      "Client-ready exports",
    ],
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tools to support your AEO strategy
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Monitor, analyse, and work towards improving your brand's visibility in AI-powered answers.
          </p>
        </div>
        
        <div className="space-y-20">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } gap-12 items-center`}
            >
              <div className="flex-1">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">{feature.title}</h3>
                <p className="text-lg text-muted-foreground mb-6">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-success/10 flex items-center justify-center">
                        <Check className="h-3 w-3 text-success" />
                      </div>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex-1 w-full">
                <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
                  {feature.id === "visibility" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-4 border-b">
                        <span className="font-medium">Visibility Overview</span>
                        <BarChart3 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                          <p className="text-3xl font-bold text-success">1.7</p>
                          <p className="text-sm text-muted-foreground">Your Score</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                          <p className="text-3xl font-bold text-muted-foreground">1.2</p>
                          <p className="text-sm text-muted-foreground">Competitor Avg</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Your Brand</span>
                          <span className="font-medium">85%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-[85%] bg-success rounded-full" />
                        </div>
                      </div>
                    </div>
                  )}
                  {feature.id === "roadmap" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-4 border-b">
                        <span className="font-medium">AEO Suggestions</span>
                        <Target className="h-5 w-5 text-muted-foreground" />
                      </div>
                      {[
                        { prompt: "Best CRM for startups", priority: "High" },
                        { prompt: "Top project management tools", priority: "Medium" },
                        { prompt: "Marketing automation software", priority: "High" },
                      ].map((item) => (
                        <div key={item.prompt} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm">{item.prompt}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.priority === "High" 
                              ? "bg-destructive/10 text-destructive" 
                              : "bg-warning/10 text-warning"
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {feature.id === "teams" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-4 border-b">
                        <span className="font-medium">Projects</span>
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      {[
                        { name: "Acme Corp", score: 1.8 },
                        { name: "TechStart Inc", score: 1.4 },
                        { name: "Local Bakery", score: 0.9 },
                      ].map((project) => (
                        <div key={project.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm font-medium">{project.name}</span>
                          <span className={`text-sm font-bold ${
                            project.score >= 1.5 ? "text-success" 
                              : project.score >= 1 ? "text-warning" 
                              : "text-destructive"
                          }`}>
                            {project.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
