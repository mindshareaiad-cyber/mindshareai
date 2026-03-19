import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Loader2, Eye, MessageSquare, ThumbsUp, BarChart3, ArrowRight, Search, X, Plus, AlertCircle, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FreeCheckResult {
  brandName: string;
  brandDomain: string;
  competitors: string[];
  category: string;
  engine: string;
  results: {
    prompt: string;
    brandScore: number;
    competitorScores: Record<string, number>;
    engine: string;
  }[];
  summary: {
    visibilityScore: number;
    mentionCount: number;
    recommendCount: number;
    totalPrompts: number;
    shareOfVoice: number;
  };
}

function ScoreBadge({ score }: { score: number }) {
  if (score === 2) return <Badge className="bg-green-500/10 text-green-600 border-green-200">Recommended</Badge>;
  if (score === 1) return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Mentioned</Badge>;
  return <Badge className="bg-red-500/10 text-red-500 border-red-200">Invisible</Badge>;
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 60 ? "text-green-500" : score >= 30 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
          <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className={color} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{score}</span>
        </div>
      </div>
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

export default function FreeCheckPage() {
  const [brandName, setBrandName] = useState("");
  const [brandDomain, setBrandDomain] = useState("");
  const [category, setCategory] = useState("");
  const [competitorInput, setCompetitorInput] = useState("");
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FreeCheckResult | null>(null);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Free AI Visibility Check | Mindshare AI";
  }, []);

  const addCompetitor = () => {
    const name = competitorInput.trim();
    if (!name) return;
    if (competitors.length >= 2) {
      toast({ title: "Maximum 2 competitors for the free check", variant: "destructive" });
      return;
    }
    if (competitors.includes(name)) return;
    setCompetitors([...competitors, name]);
    setCompetitorInput("");
  };

  const removeCompetitor = (name: string) => {
    setCompetitors(competitors.filter(c => c !== name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || !brandDomain.trim() || !category.trim()) {
      setError("Please fill in your brand name, website, and category.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const response = await apiRequest("POST", "/api/free-check", {
        brandName: brandName.trim(),
        brandDomain: brandDomain.trim(),
        competitors,
        category: category.trim(),
      });
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      const msg = err?.message || "Something went wrong. Please try again.";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {!result && !loading && (
        <section className="py-16 md:py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4">Free Tool</Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" data-testid="text-free-check-title">
                AI Visibility Check
              </h1>
              <p className="text-lg text-muted-foreground mb-2">
                See how AI assistants talk about your brand. Enter your details below and we'll run 5 buyer-intent questions through an AI engine to check your visibility.
              </p>
              <p className="text-sm text-muted-foreground">
                No signup required. Takes about 30 seconds.
              </p>
            </div>
          </div>
        </section>
      )}

      {!result && (
        <section className={`${loading ? "py-16" : "pb-16"}`}>
          <div className="container mx-auto px-6">
            <div className="max-w-lg mx-auto">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-6" />
                  <h2 className="text-xl font-semibold mb-2">Running your AI visibility check</h2>
                  <p className="text-muted-foreground mb-1">Generating buyer-intent questions for your category...</p>
                  <p className="text-sm text-muted-foreground">Querying AI engines and scoring results. This takes about 30 seconds.</p>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="brandName">Brand Name</Label>
                        <Input
                          id="brandName"
                          placeholder="e.g. Mindshare AI"
                          value={brandName}
                          onChange={e => setBrandName(e.target.value)}
                          data-testid="input-brand-name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="brandDomain">Website</Label>
                        <Input
                          id="brandDomain"
                          placeholder="e.g. mindshare-ai.com"
                          value={brandDomain}
                          onChange={e => setBrandDomain(e.target.value)}
                          data-testid="input-brand-domain"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category / Niche</Label>
                        <Input
                          id="category"
                          placeholder="e.g. AI visibility tracking, email marketing software"
                          value={category}
                          onChange={e => setCategory(e.target.value)}
                          data-testid="input-category"
                        />
                        <p className="text-xs text-muted-foreground">What type of product or service is your brand?</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Competitors (optional, up to 2)</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g. Competitor name"
                            value={competitorInput}
                            onChange={e => setCompetitorInput(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addCompetitor();
                              }
                            }}
                            disabled={competitors.length >= 2}
                            data-testid="input-competitor"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={addCompetitor}
                            disabled={competitors.length >= 2 || !competitorInput.trim()}
                            data-testid="button-add-competitor"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {competitors.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {competitors.map(c => (
                              <Badge key={c} variant="secondary" className="gap-1 pr-1">
                                {c}
                                <button
                                  type="button"
                                  onClick={() => removeCompetitor(c)}
                                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                                  data-testid={`button-remove-competitor-${c}`}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          {error}
                        </div>
                      )}

                      <Button type="submit" className="w-full gap-2" size="lg" data-testid="button-run-check">
                        <Search className="h-4 w-4" />
                        Run Free Visibility Check
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      )}

      {result && (
        <>
          <section className="py-12 md:py-16 bg-gradient-to-b from-primary/5 to-background">
            <div className="container mx-auto px-6">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-result-title">
                      AI Visibility Report: {result.brandName}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                      {result.summary.totalPrompts} prompts checked via {result.engine === "perplexity" ? "Perplexity" : result.engine === "chatgpt" ? "ChatGPT" : result.engine === "claude" ? "Claude" : result.engine === "gemini" ? "Gemini" : result.engine}
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => { setResult(null); }} data-testid="button-run-another">
                    Run Another Check
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <ScoreRing score={result.summary.visibilityScore} label="Visibility Score" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                      <Eye className="h-6 w-6 text-primary" />
                      <div className="text-2xl font-bold">{result.summary.mentionCount}/{result.summary.totalPrompts}</div>
                      <span className="text-sm text-muted-foreground">Mentions</span>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                      <ThumbsUp className="h-6 w-6 text-green-500" />
                      <div className="text-2xl font-bold">{result.summary.recommendCount}/{result.summary.totalPrompts}</div>
                      <span className="text-sm text-muted-foreground">Recommendations</span>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                      <BarChart3 className="h-6 w-6 text-blue-500" />
                      <div className="text-2xl font-bold">{result.summary.shareOfVoice}%</div>
                      <span className="text-sm text-muted-foreground">Share of Voice</span>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          <section className="py-8 md:py-12">
            <div className="container mx-auto px-6">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-xl font-bold mb-4">Prompt-Level Results</h2>
                <div className="space-y-3">
                  {result.results.map((r, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium mb-2" data-testid={`text-prompt-${i}`}>"{r.prompt}"</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-muted-foreground">{result.brandName}:</span>
                              <ScoreBadge score={r.brandScore} />
                              {result.competitors.map(comp => (
                                <span key={comp} className="flex items-center gap-1">
                                  <span className="text-xs text-muted-foreground">{comp}:</span>
                                  <ScoreBadge score={r.competitorScores[comp] || 0} />
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="py-8 md:py-12 bg-muted/30">
            <div className="container mx-auto px-6">
              <div className="max-w-3xl mx-auto">
                <Card className="border-primary/20">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Lock className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">Get the full picture with Mindshare AI</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                          <li className="flex items-center gap-2">
                            <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
                            Track visibility across ChatGPT, Claude, Gemini, and Perplexity
                          </li>
                          <li className="flex items-center gap-2">
                            <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
                            Get AI-generated content briefs to fix your visibility gaps
                          </li>
                          <li className="flex items-center gap-2">
                            <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
                            Monitor competitor share of voice over time
                          </li>
                          <li className="flex items-center gap-2">
                            <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
                            Organise prompts by persona, funnel stage, and market
                          </li>
                        </ul>
                        <Link href="/signup">
                          <Button className="gap-2" data-testid="button-signup-cta">
                            Start Your 14-Day Free Trial
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <div className="text-center py-4 text-xs text-muted-foreground">
            Report created with <Link href="/" className="text-primary hover:underline">Mindshare AI</Link>
          </div>
        </>
      )}

      {!result && !loading && <Footer />}
      {result && <Footer />}
    </div>
  );
}
