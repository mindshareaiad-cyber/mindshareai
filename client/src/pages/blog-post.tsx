import { useRoute } from "wouter";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

const posts: Record<string, {
  title: string;
  date: string;
  readTime: string;
  category: string;
  content: React.ReactNode;
}> = {
  "what-is-aeo": {
    title: "What is Answer Engine Optimization (AEO)?",
    date: "31 January 2026",
    readTime: "5 min read",
    category: "Getting Started",
    content: (
      <>
        <h2>Quick definition</h2>
        <p>
          Answer Engine Optimization (AEO) is the practice of optimizing your brand and content so that AI systems and modern search features choose your answers when users ask questions in natural language. Instead of just chasing blue links, AEO focuses on "being the answer."
        </p>

        <h2>From SEO to AEO</h2>
        <p>Traditional SEO was built around:</p>
        <ul>
          <li>Keywords and backlinks</li>
          <li>Ranking in the top 10 results</li>
          <li>Optimizing pages for clicks</li>
        </ul>

        <p>AEO shifts the focus to:</p>
        <ul>
          <li>Questions and intent, not just keywords</li>
          <li>Getting selected as the direct answer in AI chat, featured snippets, and rich results</li>
          <li>Structuring information so machines can easily understand and trust it</li>
        </ul>

        <p>
          You're no longer only asking, "How do I rank on page one?" but "How do I become the answer an AI gives to this question?"
        </p>

        <h2>Why AEO matters now</h2>
        <p>Modern users type or speak full questions into search and AI tools:</p>
        <ul>
          <li>"Best CRM for small agencies?"</li>
          <li>"What's the easiest way to track VAT invoices?"</li>
          <li>"Which email tool is best for cold outreach?"</li>
        </ul>

        <p>AI systems and answer engines now:</p>
        <ul>
          <li>Synthesize multiple sources into one response</li>
          <li>Make recommendations without always showing the underlying links</li>
          <li>Prioritize clarity, trust, and authority over raw keyword matching</li>
        </ul>

        <p>If you're not optimized for this, you can be invisible even if your SEO is decent.</p>

        <h2>How AEO works in practice</h2>
        <p>A strong AEO approach typically includes:</p>

        <h3>Clear, question-led content</h3>
        <ul>
          <li>FAQ blocks, Q&A sections, and content built around real user questions</li>
          <li>Concise, direct answers high up on the page</li>
        </ul>

        <h3>Structured data and context</h3>
        <ul>
          <li>Schema markup (Organization, Product, FAQ, HowTo, Review)</li>
          <li>Clear info about who you are, what you do, pricing, locations, and use-cases</li>
        </ul>

        <h3>Topical authority</h3>
        <ul>
          <li>Deep, consistent content around your niche rather than thin, scattered posts</li>
          <li>Demonstrating expertise, evidence, and up-to-date information</li>
        </ul>

        <h3>Brand signals and trust</h3>
        <ul>
          <li>Clear "About," team, and contact details</li>
          <li>Third-party mentions, reviews, and case studies that show you're real and reliable</li>
        </ul>

        <h3>Machine-friendly clarity</h3>
        <ul>
          <li>Simple language, clean headings, and logical structure</li>
          <li>Avoiding jargon and ambiguity so models can confidently pull snippets from you</li>
        </ul>

        <h2>AEO vs traditional SEO: key differences</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">Aspect</th>
                <th className="text-left py-3 px-4 font-semibold">Traditional SEO</th>
                <th className="text-left py-3 px-4 font-semibold">AEO</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-4">Primary goal</td>
                <td className="py-3 px-4 text-muted-foreground">Get clicks to your site</td>
                <td className="py-3 px-4 text-muted-foreground">Get chosen as the direct answer</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Focus unit</td>
                <td className="py-3 px-4 text-muted-foreground">Keywords & pages</td>
                <td className="py-3 px-4 text-muted-foreground">Questions, entities, and brand visibility</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Measurement</td>
                <td className="py-3 px-4 text-muted-foreground">Rankings, clicks, traffic</td>
                <td className="py-3 px-4 text-muted-foreground">Inclusion in AI answers, featured spots, recommendations</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Content style</td>
                <td className="py-3 px-4 text-muted-foreground">Long, keyword-rich, link-driven</td>
                <td className="py-3 px-4 text-muted-foreground">Clear Q&A, concise explanations, context-rich</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Main "decider"</td>
                <td className="py-3 px-4 text-muted-foreground">Search engine algorithm</td>
                <td className="py-3 px-4 text-muted-foreground">Search + AI models + answer engines</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Simple example</h2>
        <p>
          Imagine a user asks an AI: "What's a good tool to pre-check VAT invoices before sending them to Xero?"
        </p>
        <p>AEO thinking asks:</p>
        <ul>
          <li>Do we have a page that directly answers that question?</li>
          <li>Is our product clearly described as solving that exact use case?</li>
          <li>Is our brand recognized by the AI as associated with "VAT invoice pre-check" and "Xero"?</li>
          <li>Is our content structured so the model can safely lift a 1–2 sentence explanation and a recommendation?</li>
        </ul>
        <p>If the answer to those is "yes," you increase your chances of being named in that response.</p>

        <h2>Getting started with AEO</h2>
        <p>If you're starting from scratch, you can:</p>
        <ol>
          <li>List the top 50–100 questions your ideal customer actually asks</li>
          <li>Turn each into: a dedicated section, FAQ entry, or page with a clear, direct answer</li>
          <li>Add structured data where relevant (FAQ, product, how-to)</li>
          <li>Make your brand's "who we are / what we do / who we serve" brutally clear across the site</li>
        </ol>
        <p>
          Once that foundation is in place, you can layer on more advanced work: tracking when/where you're mentioned in AI answers, refining prompts, and iterating content to increase your "answer share" over time.
        </p>
      </>
    ),
  },
  "how-ai-chooses-brands": {
    title: "How AI Assistants Choose Which Brands to Recommend",
    date: "28 January 2026",
    readTime: "7 min read",
    category: "AI Insights",
    content: (
      <>
        <p className="text-lg text-muted-foreground">
          This article is coming soon. Check back for insights on how AI models decide which brands to mention and recommend.
        </p>
      </>
    ),
  },
  "content-strategies-ai-visibility": {
    title: "5 Content Strategies to Improve Your AI Visibility",
    date: "25 January 2026",
    readTime: "6 min read",
    category: "Strategy",
    content: (
      <>
        <p className="text-lg text-muted-foreground">
          This article is coming soon. Check back for practical tips on creating content that may help improve your AI visibility.
        </p>
      </>
    ),
  },
};

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";
  const post = posts[slug];

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">Article not found</h1>
              <p className="text-muted-foreground mb-8">
                The article you're looking for doesn't exist.
              </p>
              <Link href="/blog">
                <Button>Back to Blog</Button>
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <Link href="/blog">
              <Button variant="ghost" size="sm" className="gap-2 mb-8" data-testid="button-back-blog">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Button>
            </Link>

            <div className="mb-8">
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                {post.category}
              </span>
            </div>

            <h1 className="text-4xl font-bold mb-4" data-testid="text-blog-post-title">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{post.readTime}</span>
              </div>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3 [&>p]:text-muted-foreground [&>p]:mb-4 [&>ul]:list-disc [&>ul]:list-inside [&>ul]:text-muted-foreground [&>ul]:space-y-2 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:list-inside [&>ol]:text-muted-foreground [&>ol]:space-y-2 [&>ol]:mb-4">
              {post.content}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
