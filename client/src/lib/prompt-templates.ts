export interface PromptTemplate {
  id: string;
  category: string;
  intent: "comparison" | "shortlist" | "validation" | "alternatives" | "discovery";
  funnelStage: "awareness" | "consideration" | "decision";
  template: string;
  example: string;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "comparison-1",
    category: "Comparison",
    intent: "comparison",
    funnelStage: "consideration",
    template: "What are the best {category} tools in 2024?",
    example: "What are the best project management tools in 2024?",
  },
  {
    id: "comparison-2",
    category: "Comparison",
    intent: "comparison",
    funnelStage: "consideration",
    template: "{your_brand} vs {competitor} - which is better for {use_case}?",
    example: "Asana vs Monday.com - which is better for remote teams?",
  },
  {
    id: "shortlist-1",
    category: "Shortlist",
    intent: "shortlist",
    funnelStage: "consideration",
    template: "Top 5 {category} for {audience}",
    example: "Top 5 CRM software for small businesses",
  },
  {
    id: "shortlist-2",
    category: "Shortlist",
    intent: "shortlist",
    funnelStage: "awareness",
    template: "What {category} do {audience} recommend?",
    example: "What email marketing tools do startups recommend?",
  },
  {
    id: "validation-1",
    category: "Validation",
    intent: "validation",
    funnelStage: "decision",
    template: "Is {your_brand} good for {use_case}?",
    example: "Is HubSpot good for B2B marketing?",
  },
  {
    id: "validation-2",
    category: "Validation",
    intent: "validation",
    funnelStage: "decision",
    template: "Should I use {your_brand} for my {business_type}?",
    example: "Should I use Shopify for my e-commerce business?",
  },
  {
    id: "alternatives-1",
    category: "Alternatives",
    intent: "alternatives",
    funnelStage: "consideration",
    template: "What are alternatives to {competitor}?",
    example: "What are alternatives to Salesforce?",
  },
  {
    id: "alternatives-2",
    category: "Alternatives",
    intent: "alternatives",
    funnelStage: "consideration",
    template: "Cheaper alternatives to {competitor}",
    example: "Cheaper alternatives to Adobe Creative Suite",
  },
  {
    id: "discovery-1",
    category: "Discovery",
    intent: "discovery",
    funnelStage: "awareness",
    template: "How do I solve {pain_point}?",
    example: "How do I manage my team's tasks more efficiently?",
  },
  {
    id: "discovery-2",
    category: "Discovery",
    intent: "discovery",
    funnelStage: "awareness",
    template: "Best way to {achieve_goal}",
    example: "Best way to automate email marketing",
  },
];

export const INTENT_LABELS: Record<PromptTemplate["intent"], string> = {
  comparison: "Head-to-head comparison",
  shortlist: "Building a shortlist",
  validation: "Final validation before purchase",
  alternatives: "Looking for alternatives",
  discovery: "Problem discovery",
};

export const FUNNEL_LABELS: Record<PromptTemplate["funnelStage"], string> = {
  awareness: "Awareness",
  consideration: "Consideration",
  decision: "Decision",
};

export function generatePromptFromTemplate(
  template: PromptTemplate,
  variables: Record<string, string>
): string {
  let result = template.template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(`{${key}}`, value);
  }
  return result;
}
