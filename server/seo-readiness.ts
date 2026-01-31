import type { SeoReadiness, SeoChecklistItem, GuidanceMessage, SeoReadinessReport } from "@shared/schema";

export const SEO_CHECKLIST_ITEMS: Omit<SeoChecklistItem, "checked">[] = [
  {
    key: "hasWebsite",
    label: "Active Website",
    description: "Your brand has a functioning website that is accessible to search engines and AI crawlers.",
    weight: 20,
  },
  {
    key: "hasMetaDescriptions",
    label: "Meta Descriptions",
    description: "Your pages have unique, descriptive meta descriptions that summarize content.",
    weight: 10,
  },
  {
    key: "hasStructuredHeaders",
    label: "Structured Headers",
    description: "Content is organized with proper H1, H2, H3 heading hierarchy.",
    weight: 10,
  },
  {
    key: "hasBlogOrKnowledgeBase",
    label: "Blog or Knowledge Base",
    description: "You have a blog, help center, or knowledge base with valuable content.",
    weight: 15,
  },
  {
    key: "hasSchemaMarkup",
    label: "Schema Markup",
    description: "Your site uses structured data (Schema.org) to help AI understand your content.",
    weight: 10,
  },
  {
    key: "hasFaqSection",
    label: "FAQ Section",
    description: "You have FAQ pages that directly answer common questions about your brand/products.",
    weight: 15,
  },
  {
    key: "hasContactInfo",
    label: "Contact Information",
    description: "Clear contact information and business details are available on your site.",
    weight: 10,
  },
  {
    key: "hasSocialProfiles",
    label: "Social Profiles",
    description: "Your brand has active social media profiles linked from your website.",
    weight: 10,
  },
];

export function calculateOverallScore(assessment: Partial<SeoReadiness>): number {
  let score = 0;
  
  for (const item of SEO_CHECKLIST_ITEMS) {
    const key = item.key as keyof SeoReadiness;
    if (assessment[key] === true) {
      score += item.weight;
    }
  }
  
  return Math.min(100, Math.max(0, score));
}

export function getRecommendationLevel(score: number): "not_ready" | "needs_work" | "ready" | "excellent" {
  if (score < 30) return "not_ready";
  if (score < 60) return "needs_work";
  if (score < 85) return "ready";
  return "excellent";
}

export function buildChecklist(assessment: Partial<SeoReadiness>): SeoChecklistItem[] {
  return SEO_CHECKLIST_ITEMS.map(item => ({
    ...item,
    checked: Boolean(assessment[item.key as keyof SeoReadiness]),
  }));
}

export function generateGuidance(assessment: Partial<SeoReadiness>, brandName?: string): GuidanceMessage[] {
  const messages: GuidanceMessage[] = [];
  const score = calculateOverallScore(assessment);
  const level = getRecommendationLevel(score);
  const brand = brandName || "your brand";

  if (level === "not_ready") {
    messages.push({
      type: "warning",
      title: "SEO Foundation Needed",
      message: `${brand} needs stronger SEO fundamentals before AEO can be effective. AI engines pull information from indexed content—without a solid web presence, there's nothing for AI to reference.`,
    });
  }

  if (!assessment.hasWebsite) {
    messages.push({
      type: "action",
      title: "Create a Website",
      message: "AI assistants can only recommend brands they can find information about. A functioning website is the first step to AI visibility.",
      actionLabel: "Learn More",
      actionUrl: "https://www.google.com/business/",
    });
  }

  if (!assessment.hasBlogOrKnowledgeBase && assessment.hasWebsite) {
    messages.push({
      type: "action",
      title: "Create Authoritative Content",
      message: "AI engines favor brands with deep, helpful content. Start a blog or knowledge base that answers common questions in your industry.",
      actionLabel: "Content Strategy Guide",
    });
  }

  if (!assessment.hasFaqSection && assessment.hasWebsite) {
    messages.push({
      type: "action",
      title: "Add FAQ Pages",
      message: "FAQ sections are goldmines for AEO. They match the question-answer format AI assistants use when responding to users.",
      actionLabel: "Create FAQ Section",
    });
  }

  if (!assessment.hasSchemaMarkup && assessment.hasWebsite) {
    messages.push({
      type: "info",
      title: "Add Structured Data",
      message: "Schema markup helps AI understand your content's context. Add Organization, Product, and FAQ schema to your pages.",
    });
  }

  if (level === "needs_work") {
    messages.push({
      type: "info",
      title: "Making Progress",
      message: `${brand} has some SEO foundations in place. Focus on the unchecked items above to improve your AEO readiness. Each improvement increases your chances of being mentioned by AI assistants.`,
    });
  }

  if (level === "ready") {
    messages.push({
      type: "success",
      title: "Ready for AEO",
      message: `${brand} has a solid SEO foundation. You're ready to start tracking and improving your AI visibility. Run scans to see where you stand!`,
    });
  }

  if (level === "excellent") {
    messages.push({
      type: "success",
      title: "Excellent SEO Foundation",
      message: `${brand} has an excellent foundation for AEO. Your comprehensive web presence gives AI assistants plenty of content to reference. Focus on monitoring your visibility and optimizing for gaps.`,
    });
  }

  if (score > 0 && score < 100) {
    const missingItems = SEO_CHECKLIST_ITEMS.filter(
      item => !assessment[item.key as keyof SeoReadiness]
    );
    if (missingItems.length > 0) {
      const topMissing = missingItems.slice(0, 2).map(i => i.label).join(" and ");
      messages.push({
        type: "info",
        title: "Quick Wins Available",
        message: `Adding ${topMissing} could quickly boost your readiness score and improve AI visibility.`,
      });
    }
  }

  return messages;
}

export function buildReadinessReport(assessment: SeoReadiness, brandName?: string): SeoReadinessReport {
  const checklist = buildChecklist(assessment);
  const guidance = generateGuidance(assessment, brandName);
  const aeoReady = assessment.overallScore >= 60;

  return {
    assessment,
    checklist,
    guidance,
    aeoReady,
  };
}

export function createDefaultAssessment(projectId: string): Partial<SeoReadiness> {
  return {
    projectId,
    overallScore: 0,
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
    recommendationLevel: "not_ready",
  };
}
