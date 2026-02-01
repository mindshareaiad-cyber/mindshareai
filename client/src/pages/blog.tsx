import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, ArrowRight } from "lucide-react";

const posts = [
  {
    id: 1,
    title: "What is Answer Engine Optimization (AEO)?",
    excerpt: "Learn how AEO differs from traditional SEO and why it matters for your brand's visibility in AI-powered search.",
    date: "31 January 2026",
    readTime: "5 min read",
    category: "Getting Started",
  },
  {
    id: 2,
    title: "How AI Assistants Choose Which Brands to Recommend",
    excerpt: "Understanding the factors that influence whether ChatGPT, Claude, and other AI tools mention your brand.",
    date: "28 January 2026",
    readTime: "7 min read",
    category: "AI Insights",
  },
  {
    id: 3,
    title: "5 Content Strategies to Improve Your AI Visibility",
    excerpt: "Practical tips for creating content that may help improve how AI assistants perceive and recommend your brand.",
    date: "25 January 2026",
    readTime: "6 min read",
    category: "Strategy",
  },
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 mb-6" data-testid="button-back-home">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Insights on AI visibility, answer engine optimization, and strategies to help your brand get noticed by AI assistants.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="hover-elevate cursor-pointer" data-testid={`card-blog-post-${post.id}`}>
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
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            More articles coming soon. Stay tuned for insights on AI visibility and AEO strategies.
          </p>
        </div>
      </div>
    </div>
  );
}
