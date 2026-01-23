import OpenAI from "openai";

// DeepSeek client
const deepseekClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "sk-placeholder",
  baseURL: "https://api.deepseek.com",
});

// OpenAI/ChatGPT client
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

export type LLMEngine = "chatgpt" | "deepseek";

function getClient(engine: LLMEngine) {
  if (engine === "chatgpt") {
    return { client: openaiClient, model: "gpt-4o-mini" };
  }
  return { client: deepseekClient, model: "deepseek-chat" };
}

export async function generateAnswer(promptText: string, engine: LLMEngine = "chatgpt"): Promise<string> {
  try {
    const { client, model } = getClient(engine);
    
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are an expert assistant answering user questions about products, services, and businesses. Provide a concise, practical answer in under 120 words, suitable for being used as an AI result.",
        },
        {
          role: "user",
          content: promptText,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || "";
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
    const { client, model } = getClient(engine);
    const competitorList = competitors.map((c) => `- ${c}`).join("\n");

    const response = await client.chat.completions.create({
      model,
      messages: [
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
      ],
      max_tokens: 200,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content?.trim() || "{}";
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
    const { client, model } = getClient(engine);
    
    const response = await client.chat.completions.create({
      model,
      messages: [
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
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content?.trim() || "{}";
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
  
  if (process.env.DEEPSEEK_API_KEY) {
    engines.push("deepseek");
  }
  
  // Default to chatgpt if no keys configured (will fail gracefully)
  if (engines.length === 0) {
    engines.push("chatgpt");
  }
  
  return engines;
}
