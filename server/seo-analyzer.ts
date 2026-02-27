import { calculateOverallScore, getRecommendationLevel } from "./seo-readiness";

interface AnalysisResult {
  hasWebsite: boolean;
  hasMetaDescriptions: boolean;
  hasStructuredHeaders: boolean;
  hasBlogOrKnowledgeBase: boolean;
  hasSchemaMarkup: boolean;
  hasFaqSection: boolean;
  hasContactInfo: boolean;
  hasSocialProfiles: boolean;
  contentDepthScore: number;
  technicalSeoScore: number;
  details: Record<string, string>;
}

function isPublicDomain(domain: string): boolean {
  const cleaned = domain.replace(/^https?:\/\//, "").split("/")[0].split(":")[0].toLowerCase();
  const blocked = ["localhost", "127.0.0.1", "0.0.0.0", "[::1]", "169.254.", "10.", "192.168.", "172.16.", "172.17.", "172.18.", "172.19.", "172.20.", "172.21.", "172.22.", "172.23.", "172.24.", "172.25.", "172.26.", "172.27.", "172.28.", "172.29.", "172.30.", "172.31."];
  return !blocked.some((b) => cleaned.startsWith(b)) && cleaned.includes(".");
}

export async function analyzeWebsite(domain: string): Promise<AnalysisResult> {
  const result: AnalysisResult = {
    hasWebsite: false,
    hasMetaDescriptions: false,
    hasStructuredHeaders: false,
    hasBlogOrKnowledgeBase: false,
    hasSchemaMarkup: false,
    hasFaqSection: false,
    hasContactInfo: false,
    hasSocialProfiles: false,
    contentDepthScore: 0,
    technicalSeoScore: 0,
    details: {},
  };

  if (!isPublicDomain(domain)) {
    result.details.website = "Invalid or private domain";
    return result;
  }

  const url = domain.startsWith("http") ? domain : `https://${domain}`;

  let html = "";
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "MindshareAI-SEO-Analyzer/1.0 (compatible; bot)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (response.ok) {
      result.hasWebsite = true;
      result.details.website = `Site is live (HTTP ${response.status})`;
      html = await response.text();
    } else {
      result.details.website = `Site returned HTTP ${response.status}`;
      return result;
    }
  } catch (err: any) {
    result.details.website = `Could not reach site: ${err.message || "Connection failed"}`;
    return result;
  }

  const lower = html.toLowerCase();

  const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
    || html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);
  if (metaMatch && metaMatch[1].length > 10) {
    result.hasMetaDescriptions = true;
    result.details.metaDescription = metaMatch[1].substring(0, 100) + (metaMatch[1].length > 100 ? "..." : "");
  } else {
    result.details.metaDescription = "No meta description found";
  }

  const h1Count = (lower.match(/<h1[\s>]/g) || []).length;
  const h2Count = (lower.match(/<h2[\s>]/g) || []).length;
  const h3Count = (lower.match(/<h3[\s>]/g) || []).length;
  if (h1Count >= 1 && h2Count >= 1) {
    result.hasStructuredHeaders = true;
    result.details.headers = `Found ${h1Count} H1, ${h2Count} H2, ${h3Count} H3 tags`;
  } else {
    result.details.headers = `Found ${h1Count} H1, ${h2Count} H2, ${h3Count} H3 tags — needs improvement`;
  }

  const blogPatterns = ["/blog", "/articles", "/news", "/resources", "/knowledge", "/help", "/docs", "/learn", "/insights"];
  const hasBlogLink = blogPatterns.some((p) => lower.includes(`href="${p}`) || lower.includes(`href="/${p.slice(1)}`));
  const hasBlogText = lower.includes("blog") || lower.includes("knowledge base") || lower.includes("help center") || lower.includes("resources");
  if (hasBlogLink || hasBlogText) {
    result.hasBlogOrKnowledgeBase = true;
    result.details.blog = "Blog or knowledge base detected";
  } else {
    result.details.blog = "No blog or knowledge base found";
  }

  const hasJsonLd = lower.includes("application/ld+json");
  const hasMicrodata = lower.includes("itemscope") || lower.includes("itemtype");
  const hasRdfa = lower.includes('typeof="') || lower.includes("vocab=");
  if (hasJsonLd || hasMicrodata || hasRdfa) {
    result.hasSchemaMarkup = true;
    const types: string[] = [];
    if (hasJsonLd) types.push("JSON-LD");
    if (hasMicrodata) types.push("Microdata");
    if (hasRdfa) types.push("RDFa");
    result.details.schema = `Schema markup found: ${types.join(", ")}`;
  } else {
    result.details.schema = "No structured data (Schema.org) detected";
  }

  const faqPatterns = ["faq", "frequently asked", "common questions", "q&a"];
  const hasFaqContent = faqPatterns.some((p) => lower.includes(p));
  const hasFaqLink = lower.includes('href="/faq') || lower.includes('href="/frequently-asked');
  const hasFaqSchema = lower.includes('"faqpage"') || lower.includes('"faq"');
  if (hasFaqContent || hasFaqLink || hasFaqSchema) {
    result.hasFaqSection = true;
    result.details.faq = "FAQ content detected";
  } else {
    result.details.faq = "No FAQ section found";
  }

  const contactPatterns = ["contact us", "get in touch", "reach out", "support@", "info@", "hello@"];
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(html);
  const hasEmail = /[\w.+-]+@[\w-]+\.[\w.]+/.test(html);
  const hasContactLink = lower.includes('href="/contact') || lower.includes('href="/about');
  const hasContactText = contactPatterns.some((p) => lower.includes(p));
  if (hasPhone || hasEmail || hasContactLink || hasContactText) {
    result.hasContactInfo = true;
    const found: string[] = [];
    if (hasEmail) found.push("email");
    if (hasPhone) found.push("phone");
    if (hasContactLink) found.push("contact page");
    result.details.contact = `Contact info found: ${found.join(", ")}`;
  } else {
    result.details.contact = "No contact information detected";
  }

  const socialDomains = ["facebook.com", "twitter.com", "x.com", "linkedin.com", "instagram.com", "youtube.com", "tiktok.com", "github.com"];
  const foundSocials = socialDomains.filter((s) => lower.includes(s));
  if (foundSocials.length >= 1) {
    result.hasSocialProfiles = true;
    result.details.social = `Social profiles linked: ${foundSocials.map((s) => s.split(".")[0]).join(", ")}`;
  } else {
    result.details.social = "No social media links found";
  }

  let techScore = 0;
  if (lower.includes("<title")) techScore += 15;
  if (lower.includes("viewport")) techScore += 10;
  if (lower.includes("canonical")) techScore += 15;
  if (lower.includes('rel="icon') || lower.includes("favicon")) techScore += 5;
  if (lower.includes("og:title") || lower.includes("og:description")) techScore += 15;
  if (lower.includes("twitter:card") || lower.includes("twitter:title")) techScore += 10;
  if (lower.includes("robots")) techScore += 10;
  if (lower.includes("lang=")) techScore += 10;
  if (lower.includes("alt=")) techScore += 10;
  result.technicalSeoScore = Math.min(100, techScore);

  const wordCount = html.replace(/<[^>]*>/g, " ").split(/\s+/).filter((w) => w.length > 2).length;
  if (wordCount > 2000) result.contentDepthScore = 100;
  else if (wordCount > 1000) result.contentDepthScore = 75;
  else if (wordCount > 500) result.contentDepthScore = 50;
  else if (wordCount > 100) result.contentDepthScore = 25;

  result.details.techSeo = `Technical SEO score: ${result.technicalSeoScore}/100`;
  result.details.contentDepth = `Content depth: ~${wordCount} words`;

  return result;
}

export function analysisToAssessment(analysis: AnalysisResult) {
  const assessment = {
    hasWebsite: analysis.hasWebsite,
    hasMetaDescriptions: analysis.hasMetaDescriptions,
    hasStructuredHeaders: analysis.hasStructuredHeaders,
    hasBlogOrKnowledgeBase: analysis.hasBlogOrKnowledgeBase,
    hasSchemaMarkup: analysis.hasSchemaMarkup,
    hasFaqSection: analysis.hasFaqSection,
    hasContactInfo: analysis.hasContactInfo,
    hasSocialProfiles: analysis.hasSocialProfiles,
    contentDepthScore: analysis.contentDepthScore,
    technicalSeoScore: analysis.technicalSeoScore,
  };

  const overallScore = calculateOverallScore(assessment);
  const recommendationLevel = getRecommendationLevel(overallScore);

  return {
    ...assessment,
    overallScore,
    recommendationLevel,
    details: analysis.details,
  };
}
