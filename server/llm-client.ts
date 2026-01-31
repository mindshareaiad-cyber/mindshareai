import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

// ============================================================================
// AI CLIENT CONFIGURATION
// ============================================================================
// Supports two modes:
// 1. REPLIT MODE (development): Uses Replit AI Integrations with managed keys
// 2. DIRECT MODE (production): Uses your own API keys for external hosting
//
// Environment variables for DIRECT MODE (external hosting):
// - OPENAI_API_KEY: Your OpenAI API key
// - ANTHROPIC_API_KEY: Your Anthropic API key  
// - GOOGLE_API_KEY: Your Google AI (Gemini) API key
// - PERPLEXITY_API_KEY: Your Perplexity API key
// - DEEPSEEK_API_KEY: Your DeepSeek API key
//
// If direct keys are not set, falls back to Replit AI Integrations
// ============================================================================

// Check if we're using direct API keys (external hosting mode)
const useDirectOpenAI = !!process.env.OPENAI_API_KEY;
const useDirectAnthropic = !!process.env.ANTHROPIC_API_KEY;
const useDirectGemini = !!process.env.GOOGLE_API_KEY;

// DeepSeek client (Pro only) - always uses direct API key
const deepseekClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "sk-placeholder",
  baseURL: "https://api.deepseek.com",
});

// OpenAI/ChatGPT client (All tiers)
// Priority: Direct API key > Replit AI Integrations
const openaiClient = new OpenAI({
  apiKey: useDirectOpenAI 
    ? process.env.OPENAI_API_KEY 
    : process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: useDirectOpenAI 
    ? undefined  // Use default OpenAI endpoint
    : process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// Anthropic/Claude client (Growth + Pro)
// Priority: Direct API key > Replit AI Integrations
const anthropicClient = new Anthropic({
  apiKey: useDirectAnthropic
    ? process.env.ANTHROPIC_API_KEY!
    : (process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || "placeholder"),
  baseURL: useDirectAnthropic
    ? undefined  // Use default Anthropic endpoint
    : process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

// Gemini client (Growth + Pro)
// Priority: Direct API key > Replit AI Integrations
const geminiClient = new GoogleGenAI({
  apiKey: useDirectGemini
    ? process.env.GOOGLE_API_KEY!
    : (process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "placeholder"),
  httpOptions: useDirectGemini
    ? undefined  // Use default Gemini endpoint
    : {
        apiVersion: "",
        baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
      },
});

// Log which mode we're using (only in development for debugging)
if (process.env.NODE_ENV === "development") {
  console.log("[AI Engines] Configuration:", {
    openai: useDirectOpenAI ? "Direct API Key" : "Replit AI Integration",
    anthropic: useDirectAnthropic ? "Direct API Key" : "Replit AI Integration", 
    gemini: useDirectGemini ? "Direct API Key" : "Replit AI Integration",
    perplexity: process.env.PERPLEXITY_API_KEY ? "Configured" : "Not configured",
    deepseek: process.env.DEEPSEEK_API_KEY ? "Configured" : "Not configured",
  });
}

export type LLMEngine = "chatgpt" | "claude" | "gemini" | "perplexity" | "deepseek";
export type SubscriptionTier = "starter" | "growth" | "pro";

// Engine availability by subscription tier
const ENGINE_TIERS: Record<SubscriptionTier, LLMEngine[]> = {
  starter: ["chatgpt"],
  growth: ["chatgpt", "claude", "gemini"],
  pro: ["chatgpt", "claude", "gemini", "perplexity", "deepseek"],
};

export function getEnginesForTier(tier: SubscriptionTier): LLMEngine[] {
  return ENGINE_TIERS[tier] || ENGINE_TIERS.starter;
}

export function isEngineAvailableForTier(engine: LLMEngine, tier: SubscriptionTier): boolean {
  return ENGINE_TIERS[tier]?.includes(engine) || false;
}

async function callChatGPT(messages: { role: string; content: string }[], maxTokens: number, temperature: number): Promise<string> {
  const response = await openaiClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages as any,
    max_tokens: maxTokens,
    temperature,
  });
  return response.choices[0]?.message?.content?.trim() || "";
}

async function callClaude(messages: { role: string; content: string }[], maxTokens: number, temperature: number): Promise<string> {
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

async function callDeepSeek(messages: { role: string; content: string }[], maxTokens: number, temperature: number): Promise<string> {
  const response = await deepseekClient.chat.completions.create({
    model: "deepseek-chat",
    messages: messages as any,
    max_tokens: maxTokens,
    temperature,
  });
  return response.choices[0]?.message?.content?.trim() || "";
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
    case "deepseek":
      return callDeepSeek(messages, maxTokens, temperature);
    default:
      throw new Error(`Unknown engine: ${engine}`);
  }
}

export async function generateAnswer(promptText: string, engine: LLMEngine = "chatgpt"): Promise<string> {
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
  engine: LLMEngine = "chatgpt"
): Promise<{ brandScore: number; competitorScores: Record<string, number> }> {
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
  engine: LLMEngine = "chatgpt"
): Promise<{ suggestedAnswer: string; suggestedPageType: string }> {
  try {
    const messages = [
      {
        role: "system",
        content: `You are an AEO (Answer Engine Optimization) expert. Your job is to suggest how a brand should be mentioned in AI responses, and what type of content page would help achieve that visibility.

Output ONLY valid JSON (no markdown, no explanation) with this exact shape:
{
  "suggested_answer": "A concise answer that naturally mentions and recommends the brand (under 100 words)",
  "suggested_page_type": "The type of content page to create (e.g., 'Comparison Guide', 'How-To Article', 'Product Page', 'FAQ Page', 'Case Study')"
}`,
      },
      {
        role: "user",
        content: `User question: "${promptText}"

Brand to optimize for:
- Name: ${brandName}
- Domain: ${brandDomain}

Generate a suggested answer that would naturally recommend this brand, and suggest what type of content page the brand should create to improve their visibility for this query.`,
      },
    ];

    const content = await callEngine(engine, messages, 300, 0.7);
    const jsonContent = content.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(jsonContent);

    return {
      suggestedAnswer: parsed.suggested_answer || "",
      suggestedPageType: parsed.suggested_page_type || "Landing Page",
    };
  } catch (error) {
    console.error(`Error generating suggestion with ${engine}:`, error);
    throw new Error(`Failed to generate suggestion with ${engine}`);
  }
}

// Get available engines based on configured API keys
export function getAvailableEngines(): LLMEngine[] {
  const engines: LLMEngine[] = [];
  
  if (process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    engines.push("chatgpt");
  }
  
  if (process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY) {
    engines.push("claude");
  }
  
  if (process.env.AI_INTEGRATIONS_GEMINI_API_KEY) {
    engines.push("gemini");
  }
  
  if (process.env.PERPLEXITY_API_KEY) {
    engines.push("perplexity");
  }
  
  if (process.env.DEEPSEEK_API_KEY) {
    engines.push("deepseek");
  }
  
  // Default to chatgpt if no keys configured (will fail gracefully)
  if (engines.length === 0) {
    engines.push("chatgpt");
  }
  
  return engines;
}

// Get engines available for a user based on their subscription and configured keys
export function getAvailableEnginesForUser(tier: SubscriptionTier): LLMEngine[] {
  const configuredEngines = getAvailableEngines();
  const tierEngines = getEnginesForTier(tier);
  
  return configuredEngines.filter(engine => tierEngines.includes(engine));
}
