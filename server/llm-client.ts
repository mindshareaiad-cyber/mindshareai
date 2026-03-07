import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-placeholder",
});

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "placeholder",
});

const geminiClient = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || "placeholder",
});

console.log("[AI Engines] Configuration:", {
  openai: process.env.OPENAI_API_KEY ? "Configured" : "Not configured",
  anthropic: process.env.ANTHROPIC_API_KEY ? "Configured" : "Not configured",
  gemini: process.env.GOOGLE_API_KEY ? "Configured" : "Not configured",
  perplexity: process.env.PERPLEXITY_API_KEY ? "Configured" : "Not configured",
});

export type LLMEngine = "chatgpt" | "claude" | "gemini" | "perplexity";
export type SubscriptionTier = "starter" | "growth" | "pro";

const ENGINE_TIERS: Record<SubscriptionTier, LLMEngine[]> = {
  starter: ["chatgpt"],
  growth: ["chatgpt", "claude", "gemini"],
  pro: ["chatgpt", "claude", "gemini", "perplexity"],
};

export function getEnginesForTier(tier: SubscriptionTier): LLMEngine[] {
  return ENGINE_TIERS[tier] || ENGINE_TIERS.starter;
}

export function isEngineAvailableForTier(engine: LLMEngine, tier: SubscriptionTier): boolean {
  return ENGINE_TIERS[tier]?.includes(engine) || false;
}

async function callChatGPT(messages: { role: string; content: string }[], maxTokens: number, temperature: number): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  const response = await openaiClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages as any,
    max_tokens: maxTokens,
    temperature,
  });
  return response.choices[0]?.message?.content?.trim() || "";
}

async function callClaude(messages: { role: string; content: string }[], maxTokens: number, temperature: number): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  const systemMessage = messages.find(m => m.role === "system");
  const userMessages = messages.filter(m => m.role !== "system");
  
  const response = await anthropicClient.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: maxTokens,
    system: systemMessage?.content || "",
    messages: userMessages.map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });
  
  const content = response.content[0];
  return content.type === "text" ? content.text : "";
}

async function callGemini(messages: { role: string; content: string }[], maxTokens: number): Promise<string> {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY is not configured");
  }
  const systemMessage = messages.find(m => m.role === "system");
  const userMessages = messages.filter(m => m.role !== "system");
  
  const contents = userMessages.map(m => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));
  
  const response = await geminiClient.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
    config: {
      maxOutputTokens: maxTokens,
      systemInstruction: systemMessage?.content,
    },
  });
  
  return response.text || "";
}

async function callPerplexity(messages: { role: string; content: string }[], maxTokens: number, temperature: number): Promise<string> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error("Perplexity API key not configured");
  }
  
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-online",
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

async function callEngine(
  engine: LLMEngine,
  messages: { role: string; content: string }[],
  maxTokens: number,
  temperature: number
): Promise<string> {
  switch (engine) {
    case "chatgpt":
      return callChatGPT(messages, maxTokens, temperature);
    case "claude":
      return callClaude(messages, maxTokens, temperature);
    case "gemini":
      return callGemini(messages, maxTokens);
    case "perplexity":
      return callPerplexity(messages, maxTokens, temperature);
    default:
      throw new Error(`Unknown engine: ${engine}`);
  }
}

export async function generateAnswer(promptText: string, engine?: LLMEngine): Promise<string> {
  if (!engine) {
    const available = getAvailableEngines();
    engine = available.includes("chatgpt") ? "chatgpt" : available[0];
  }
  try {
    const messages = [
      {
        role: "system",
        content:
          "You are an expert assistant answering user questions about products, services, and businesses. Provide a concise, practical answer in under 120 words, suitable for being used as an AI result.",
      },
      {
        role: "user",
        content: promptText,
      },
    ];

    return await callEngine(engine, messages, 300, 0.7);
  } catch (error) {
    console.error(`Error generating answer with ${engine}:`, error);
    throw new Error(`Failed to generate answer with ${engine}`);
  }
}

export async function scoreVisibility(
  answer: string,
  brandName: string,
  brandDomain: string,
  competitors: string[],
  engine?: LLMEngine
): Promise<{ brandScore: number; competitorScores: Record<string, number> }> {
  if (!engine) {
    const available = getAvailableEngines();
    engine = available.includes("chatgpt") ? "chatgpt" : available[0];
  }
  try {
    const competitorList = competitors.map((c) => `- ${c}`).join("\n");

    const messages = [
      {
        role: "system",
        content:
          "You are an evaluation engine scoring brand visibility in AI answers for Answer Engine Optimization (AEO). You only output strict JSON with no additional text or markdown.",
      },
      {
        role: "user",
        content: `You will receive:
- An AI answer to a user's question.
- One primary brand (name + domain).
- A list of competitor brand names.

Assign a visibility score for the primary brand and each competitor:
- 2 = clearly recommended or strongly endorsed
- 1 = mentioned but not the main recommendation
- 0 = not mentioned at all

Output ONLY valid JSON (no markdown, no explanation) with this exact shape:
{
  "brand_score": 0,
  "competitor_scores": { "Competitor 1": 0, "Competitor 2": 0 }
}

ANSWER:
"""${answer}"""

BRAND:
- name: ${brandName}
- domain: ${brandDomain}

COMPETITORS:
${competitorList || "None specified"}`,
      },
    ];

    const content = await callEngine(engine, messages, 200, 0.3);
    const jsonContent = content.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(jsonContent);

    const brandScore = Math.max(0, Math.min(2, parsed.brand_score || 0));
    const competitorScores: Record<string, number> = {};

    for (const competitor of competitors) {
      competitorScores[competitor] = Math.max(
        0,
        Math.min(2, parsed.competitor_scores?.[competitor] || 0)
      );
    }

    return { brandScore, competitorScores };
  } catch (error) {
    console.error(`Error scoring visibility with ${engine}:`, error);
    const competitorScores: Record<string, number> = {};
    for (const competitor of competitors) {
      competitorScores[competitor] = 0;
    }
    return { brandScore: 0, competitorScores };
  }
}

export async function generateSuggestedAnswer(
  promptText: string,
  brandName: string,
  brandDomain: string,
  engine?: LLMEngine
): Promise<{
  suggestedAnswer: string;
  suggestedPageType: string;
  contentTask: string;
  contentType: string;
  coverageChecklist: string[];
  implementationPlace: string;
  internalLinkIdeas: string[];
  suggestedTitle: string;
  suggestedHeadings: string[];
  suggestedIntro: string;
  intentTag: string;
}> {
  if (!engine) {
    const available = getAvailableEngines();
    engine = available.includes("chatgpt") ? "chatgpt" : available[0];
  }
  try {
    const messages = [
      {
        role: "system",
        content: `You are an AEO (Answer Engine Optimization) expert. Your job is to give clear, opinionated content direction so SEOs and content teams know exactly what to create or improve so AI engines start mentioning their brand.

Output ONLY valid JSON (no markdown, no explanation) with this exact shape:
{
  "suggested_answer": "A concise answer (under 100 words) showing how AI should ideally mention and recommend the brand",
  "suggested_page_type": "The type of content page (e.g. 'Comparison Guide', 'How-To Article', 'Product Page', 'FAQ Page', 'Case Study')",
  "content_task": "A simple, explicit instruction line, e.g. 'Create a new guide page focused on: types of exhibition stands' or 'Add a detailed FAQ section to your Exhibition Stands page answering this question'",
  "content_type": "One of: Blog guide, FAQ block, Landing page, Comparison page, Product/feature page, Case study, How-to guide",
  "coverage_checklist": ["Point 1 the content should cover", "Point 2", "Point 3", "Point 4"],
  "implementation_place": "Where to implement, e.g. 'New page', 'Update existing page: /example-page', 'Add FAQ block to: /example'",
  "internal_link_ideas": ["Link from: /page1, /page2", "Suggested anchor text: 'keyword phrase'"],
  "suggested_title": "Suggested H1 / page title (one line)",
  "suggested_headings": ["Suggested H2 heading 1", "Suggested H2 heading 2", "Suggested H2 heading 3"],
  "suggested_intro": "A 30-40 word summary paragraph as a starting point (clearly a draft, not final copy)",
  "intent_tag": "One of: Informational, Comparison, Transactional, FAQ, How-to"
}

Be specific and opinionated. The coverage checklist should include 4-6 concrete points that would give AI strong reasons to surface this brand. Think about what information AI engines need to see on the page to confidently recommend the brand.`,
      },
      {
        role: "user",
        content: `User question: "${promptText}"

Brand to optimize for:
- Name: ${brandName}
- Domain: ${brandDomain}

Generate a comprehensive AEO content brief for this query. Be specific to the brand and query — avoid generic advice.`,
      },
    ];

    const content = await callEngine(engine, messages, 800, 0.7);
    const jsonContent = content.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(jsonContent);

    return {
      suggestedAnswer: parsed.suggested_answer || "",
      suggestedPageType: parsed.suggested_page_type || "Landing Page",
      contentTask: parsed.content_task || "",
      contentType: parsed.content_type || parsed.suggested_page_type || "Blog guide",
      coverageChecklist: Array.isArray(parsed.coverage_checklist) ? parsed.coverage_checklist : [],
      implementationPlace: parsed.implementation_place || "New page",
      internalLinkIdeas: Array.isArray(parsed.internal_link_ideas) ? parsed.internal_link_ideas : [],
      suggestedTitle: parsed.suggested_title || "",
      suggestedHeadings: Array.isArray(parsed.suggested_headings) ? parsed.suggested_headings : [],
      suggestedIntro: parsed.suggested_intro || "",
      intentTag: parsed.intent_tag || "Informational",
    };
  } catch (error) {
    console.error(`Error generating suggestion with ${engine}:`, error);
    throw new Error(`Failed to generate suggestion with ${engine}`);
  }
}

export async function generatePromptSuggestions(
  promptSetName: string,
  persona: string | null,
  funnelStage: string | null,
  country: string | null,
  brandName: string,
  brandDomain: string,
  competitors: string[],
  existingPrompts: string[],
  count: number = 10
): Promise<string[]> {
  try {
    const contextParts: string[] = [];
    if (persona) contextParts.push(`Target persona: ${persona}`);
    if (funnelStage) contextParts.push(`Funnel stage: ${funnelStage}`);
    if (country) contextParts.push(`Target country/region: ${country}`);
    if (competitors.length > 0) contextParts.push(`Main competitors: ${competitors.join(", ")}`);
    if (existingPrompts.length > 0) contextParts.push(`Already added prompts (do NOT repeat these):\n${existingPrompts.map(p => `- ${p}`).join("\n")}`);

    const messages = [
      {
        role: "system",
        content: `You are an expert in Answer Engine Optimization (AEO). Your job is to generate realistic, brand-agnostic search questions that real people would ask AI assistants (ChatGPT, Claude, Gemini, Perplexity) when looking for products or services in a specific category.

CRITICAL RULES:
- NEVER include the brand name "${brandName}" or any competitor names in the prompts
- NEVER mention any specific brand, company, or product by name
- Prompts must be generic, category-level questions about the type of service/product the brand offers
- The whole point of AEO is to see whether AI engines organically mention a brand — if the prompt already names the brand, the test is meaningless

The prompts should be:
- Natural, conversational questions real buyers would type into an AI assistant
- Focused on discovering, comparing, or choosing products/services in this category
- Varied in style: "best of" lists, comparisons, recommendations, how-to, use-case specific, problem-solving
- Written from the perspective of someone who does NOT know any specific brands yet

Output ONLY a JSON array of strings. No markdown, no explanation.
Example: ["What's the best project management tool for remote teams?", "How do I choose a CRM for my startup?"]`,
      },
      {
        role: "user",
        content: `Generate ${count} brand-agnostic AI search prompts for AEO tracking.

The brand operates at: ${brandDomain}
Industry/service category (infer from the website domain and prompt set topic): "${promptSetName}"
${contextParts.length > 0 ? "\n" + contextParts.join("\n") : ""}

Remember: Do NOT mention "${brandName}" or any competitor names. These should be generic questions a potential customer would ask an AI assistant when searching for this type of product/service.`,
      },
    ];

    const available = getAvailableEngines();
    const engine = available.includes("chatgpt") ? "chatgpt" : available[0];
    const content = await callEngine(engine, messages, 1000, 0.8);
    const jsonContent = content.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(jsonContent);

    if (Array.isArray(parsed)) {
      const brandLower = brandName.toLowerCase();
      const competitorLowers = competitors.map(c => c.toLowerCase());
      return parsed.filter((p: unknown) => {
        if (typeof p !== "string" || p.trim().length === 0) return false;
        const lower = p.toLowerCase();
        if (lower.includes(brandLower)) return false;
        if (competitorLowers.some(c => lower.includes(c))) return false;
        return true;
      });
    }
    return [];
  } catch (error) {
    console.error("Error generating prompt suggestions:", error);
    throw new Error("Failed to generate prompt suggestions");
  }
}

export function getAvailableEngines(): LLMEngine[] {
  const engines: LLMEngine[] = [];
  
  if (process.env.OPENAI_API_KEY) {
    engines.push("chatgpt");
  }
  
  if (process.env.ANTHROPIC_API_KEY) {
    engines.push("claude");
  }
  
  if (process.env.GOOGLE_API_KEY) {
    engines.push("gemini");
  }
  
  if (process.env.PERPLEXITY_API_KEY) {
    engines.push("perplexity");
  }
  
  if (engines.length === 0) {
    engines.push("chatgpt");
  }
  
  return engines;
}

export function getAvailableEnginesForUser(tier: SubscriptionTier): LLMEngine[] {
  const configuredEngines = getAvailableEngines();
  const tierEngines = getEnginesForTier(tier);
  
  return configuredEngines.filter(engine => tierEngines.includes(engine));
}
