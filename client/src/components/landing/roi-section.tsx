import { Clock, Search, ClipboardList } from "lucide-react";

const stats = [
  {
    icon: Clock,
    title: "Save hours of manual AI prompt checking",
    description: "Automate the tedious process of testing prompts across multiple AI assistants.",
  },
  {
    icon: Search,
    title: "See where AI should mention you but doesn't",
    description: "Identify blind spots in your AEO strategy with comprehensive gap analysis.",
  },
  {
    icon: ClipboardList,
    title: "Give your team a clear AEO backlog in minutes",
    description: "Prioritized recommendations so your team knows exactly what to work on next.",
  },
];

export function ROISection() {
  return (
    <section className="py-20 md:py-28 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why teams choose our platform
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Focus on what matters—creating great content that AI loves to recommend.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="text-center p-8 rounded-xl bg-white/10 backdrop-blur-sm"
            >
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
                <stat.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">{stat.title}</h3>
              <p className="opacity-80">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
