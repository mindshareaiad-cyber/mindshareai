import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

const deepseekClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "sk-placeholder",
  baseURL: "https://api.deepseek.com",
});

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
  deepseek: process.env.DEEPSEEK_API_KEY ? "Configured" : "Not configured",
});

export type LLMEngine = "chatgpt" | "claude" | "gemini" | "perplexity" | "deepseek";
export type SubscriptionTier = "starter" | "growth" | "pro";

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

async function callDeepSeek(messages: { role: string; content: string }[], maxTokens: number, temperature: number): Promise<string> {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }
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
  
  if (process.env.DEEPSEEK_API_KEY) {
    engines.push("deepseek");
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
