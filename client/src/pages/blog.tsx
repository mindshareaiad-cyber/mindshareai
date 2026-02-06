import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Link } from "wouter";

const posts = [
  {
    id: 1,
    slug: "multimodal-retrieval-aeo",
    title: "How to Implement Multimodal Retrieval in AEO Strategies",
    excerpt: "Making sure answer engines can find and fuse your text, images, video, and audio as a single, coherent answer package.",
    date: "6 February 2026",
    readTime: "10 min read",
    category: "Strategy",
  },
  {
    id: 2,
    slug: "is-aeo-a-myth",
    title: "Is AEO a Myth?",
    excerpt: "AEO isn't a myth, but a lot of the hype around it is. Here's how answer engine optimization actually works and where the real opportunity lies.",
    date: "6 February 2026",
    readTime: "8 min read",
    category: "AI Insights",
  },
  {
    id: 2,
    slug: "why-businesses-need-aeo",
    title: "Why Businesses Need to Consider Answer Engine Optimization (AEO)",
    excerpt: "AI assistants are becoming the front door to the internet. Find out why AEO matters now, who it's really for, and what it looks like in practice.",
    date: "6 February 2026",
    readTime: "14 min read",
    category: "Strategy",
  },
  {
    id: 2,
    slug: "what-is-aeo",
    title: "What is Answer Engine Optimization (AEO)?",
    excerpt: "Learn how AEO differs from traditional SEO and why it matters for your brand's visibility in AI-powered search.",
    date: "31 January 2026",
    readTime: "5 min read",
    category: "Getting Started",
  },
  {
    id: 3,
    slug: "how-ai-chooses-brands",
    title: "How AI Assistants Choose Which Brands to Recommend",
    excerpt: "Understanding the factors that influence whether ChatGPT, Claude, and other AI tools mention your brand.",
    date: "28 January 2026",
    readTime: "12 min read",
    category: "AI Insights",
  },
  {
    id: 4,
    slug: "content-strategies-ai-visibility",
    title: "5 Content Strategies to Improve Your AI Visibility",
    excerpt: "Practical tips for creating content that may help improve how AI assistants perceive and recommend your brand.",
    date: "25 January 2026",
    readTime: "10 min read",
    category: "Strategy",
  },
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4" data-testid="text-blog-title">Blog</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Insights on AI visibility, answer engine optimization, and strategies to help your brand get noticed by AI assistants.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-blog-post-${post.id}`}>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {post.category}
                      </span>
                    </div>
                    <CardTitle className="text-xl leading-tight">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              More articles coming soon. Stay tuned for insights on AI visibility and AEO strategies.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
