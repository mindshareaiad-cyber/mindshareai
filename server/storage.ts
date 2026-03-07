import {
  type Project,
  type InsertProject,
  type PromptSet,
  type InsertPromptSet,
  type Prompt,
  type InsertPrompt,
  type Scan,
  type InsertScan,
  type ScanResult,
  type InsertScanResult,
  type GapAnalysis,
  type UserProfile,
  type InsertUserProfile,
  type UpdateUserProfile,
  type SeoReadiness,
  type InsertSeoReadiness,
  userProfiles,
  projects,
  promptSets,
  prompts,
  scans,
  scanResults,
  seoReadinessAssessments,
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc, and, gte, inArray } from "drizzle-orm";

export interface IStorage {
  getUserProfile(id: string): Promise<UserProfile | undefined>;
  getUserProfileByEmail(email: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(id: string, data: UpdateUserProfile): Promise<UserProfile | undefined>;

  getProjectsByUser(userId: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  countProjectsByUser(userId: string): Promise<number>;

  getPromptSets(projectId: string): Promise<PromptSet[]>;
  getPromptSet(id: string): Promise<PromptSet | undefined>;
  createPromptSet(promptSet: InsertPromptSet): Promise<PromptSet>;
  deletePromptSet(id: string): Promise<void>;

  getPrompts(promptSetId: string): Promise<Prompt[]>;
  getPromptsByProject(projectId: string): Promise<Prompt[]>;
  getPrompt(id: string): Promise<Prompt | undefined>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  deletePrompt(id: string): Promise<void>;
  countPromptsByUser(userId: string): Promise<number>;

  getScans(projectId: string): Promise<Scan[]>;
  getScan(id: string): Promise<Scan | undefined>;
  getLatestScan(projectId: string): Promise<Scan | undefined>;
  createScan(scan: InsertScan): Promise<Scan>;
  updateScanNotes(scanId: string, notes: string): Promise<Scan | null>;
  countScansThisMonth(userId: string): Promise<number>;

  getScanResults(scanId: string): Promise<ScanResult[]>;
  createScanResult(result: InsertScanResult): Promise<ScanResult>;

  getGaps(projectId: string): Promise<GapAnalysis[]>;
  updateGapSuggestion(promptId: string, data: GapSuggestionData): Promise<void>;

  getStripeProduct(productId: string): Promise<any>;
  listStripeProducts(): Promise<any[]>;
  getStripeSubscription(subscriptionId: string): Promise<any>;

  getSeoReadiness(projectId: string): Promise<SeoReadiness | undefined>;
  createSeoReadiness(assessment: InsertSeoReadiness): Promise<SeoReadiness>;
  updateSeoReadiness(projectId: string, data: Partial<InsertSeoReadiness>): Promise<SeoReadiness | undefined>;
}

type GapSuggestionData = {
  suggestedAnswer: string;
  suggestedPageType: string;
  contentTask?: string;
  contentType?: string;
  coverageChecklist?: string[];
  implementationPlace?: string;
  internalLinkIdeas?: string[];
  suggestedTitle?: string;
  suggestedHeadings?: string[];
  suggestedIntro?: string;
  intentTag?: string;
};

export class DatabaseStorage implements IStorage {
  private gapSuggestions: Map<string, GapSuggestionData> = new Map();

  async getUserProfile(id: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.id, id));
    return profile;
  }

  async getUserProfileByEmail(email: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.email, email));
    return profile;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [created] = await db.insert(userProfiles).values(profile)
      .onConflictDoUpdate({
        target: userProfiles.id,
        set: {
          email: profile.email,
          firstName: profile.firstName || undefined,
          lastName: profile.lastName || undefined,
          companyName: profile.companyName || undefined,
          updatedAt: new Date(),
        },
      })
      .returning();
    return created;
  }

  async updateUserProfile(id: string, data: UpdateUserProfile): Promise<UserProfile | undefined> {
    const [updated] = await db.update(userProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userProfiles.id, id))
      .returning();
    return updated;
  }

  async getStripeProduct(productId: string): Promise<any> {
    try {
      const result = await db.execute(
        sql`SELECT * FROM stripe.products WHERE id = ${productId}`
      );
      return result.rows[0] || null;
    } catch {
      return null;
    }
  }

  async listStripeProducts(): Promise<any[]> {
    try {
      const result = await db.execute(
        sql`SELECT p.*, pr.id as price_id, pr.unit_amount, pr.currency, pr.recurring 
            FROM stripe.products p 
            LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true 
            WHERE p.active = true`
      );
      return result.rows;
    } catch {
      return [];
    }
  }

  async getStripeSubscription(subscriptionId: string): Promise<any> {
    try {
      const result = await db.execute(
        sql`SELECT * FROM stripe.subscriptions WHERE id = ${subscriptionId}`
      );
      return result.rows[0] || null;
    } catch {
      return null;
    }
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    return db.select().from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async countProjectsByUser(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` })
      .from(projects)
      .where(eq(projects.userId, userId));
    return result[0]?.count || 0;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  async getPromptSets(projectId: string): Promise<PromptSet[]> {
    return db.select().from(promptSets)
      .where(eq(promptSets.projectId, projectId))
      .orderBy(desc(promptSets.createdAt));
  }

  async getPromptSet(id: string): Promise<PromptSet | undefined> {
    const [set] = await db.select().from(promptSets).where(eq(promptSets.id, id));
    return set;
  }

  async createPromptSet(insertPromptSet: InsertPromptSet): Promise<PromptSet> {
    const [set] = await db.insert(promptSets).values(insertPromptSet).returning();
    return set;
  }

  async deletePromptSet(id: string): Promise<void> {
    await db.delete(promptSets).where(eq(promptSets.id, id));
  }

  async getPrompts(promptSetId: string): Promise<Prompt[]> {
    return db.select().from(prompts)
      .where(eq(prompts.promptSetId, promptSetId))
      .orderBy(prompts.createdAt);
  }

  async getPromptsByProject(projectId: string): Promise<Prompt[]> {
    const sets = await this.getPromptSets(projectId);
    if (sets.length === 0) return [];
    const setIds = sets.map(s => s.id);
    return db.select().from(prompts)
      .where(inArray(prompts.promptSetId, setIds))
      .orderBy(prompts.createdAt);
  }

  async getPrompt(id: string): Promise<Prompt | undefined> {
    const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));
    return prompt;
  }

  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const [prompt] = await db.insert(prompts).values(insertPrompt).returning();
    return prompt;
  }

  async deletePrompt(id: string): Promise<void> {
    await db.delete(prompts).where(eq(prompts.id, id));
  }

  async countPromptsByUser(userId: string): Promise<number> {
    const userProjects = await this.getProjectsByUser(userId);
    if (userProjects.length === 0) return 0;
    const projectIds = userProjects.map(p => p.id);
    const userSets = await db.select().from(promptSets)
      .where(inArray(promptSets.projectId, projectIds));
    if (userSets.length === 0) return 0;
    const setIds = userSets.map(s => s.id);
    const result = await db.select({ count: sql<number>`count(*)::int` })
      .from(prompts)
      .where(inArray(prompts.promptSetId, setIds));
    return result[0]?.count || 0;
  }

  async getScans(projectId: string): Promise<Scan[]> {
    return db.select().from(scans)
      .where(eq(scans.projectId, projectId))
      .orderBy(desc(scans.createdAt));
  }

  async getScan(id: string): Promise<Scan | undefined> {
    const [scan] = await db.select().from(scans).where(eq(scans.id, id));
    return scan;
  }

  async getLatestScan(projectId: string): Promise<Scan | undefined> {
    const [scan] = await db.select().from(scans)
      .where(eq(scans.projectId, projectId))
      .orderBy(desc(scans.createdAt))
      .limit(1);
    return scan;
  }

  async createScan(insertScan: InsertScan): Promise<Scan> {
    const [scan] = await db.insert(scans).values(insertScan).returning();
    return scan;
  }

  async updateScanNotes(scanId: string, notes: string): Promise<Scan | null> {
    const [updated] = await db.update(scans)
      .set({ notes })
      .where(eq(scans.id, scanId))
      .returning();
    return updated || null;
  }

  async countScansThisMonth(userId: string): Promise<number> {
    const userProjects = await this.getProjectsByUser(userId);
    if (userProjects.length === 0) return 0;
    const projectIds = userProjects.map(p => p.id);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const result = await db.select({ count: sql<number>`count(*)::int` })
      .from(scans)
      .where(and(
        inArray(scans.projectId, projectIds),
        gte(scans.createdAt, startOfMonth)
      ));
    return result[0]?.count || 0;
  }

  async getScanResults(scanId: string): Promise<ScanResult[]> {
    return db.select().from(scanResults)
      .where(eq(scanResults.scanId, scanId));
  }

  async createScanResult(insertResult: InsertScanResult): Promise<ScanResult> {
    const [result] = await db.insert(scanResults).values(insertResult).returning();
    return result;
  }

  async getGaps(projectId: string): Promise<GapAnalysis[]> {
    const latestScan = await this.getLatestScan(projectId);
    if (!latestScan) return [];

    const project = await this.getProject(projectId);
    if (!project) return [];

    const results = await this.getScanResults(latestScan.id);
    const gaps: GapAnalysis[] = [];

    for (const result of results) {
      if (result.brandScore === 0) {
        const prompt = await this.getPrompt(result.promptId);
        if (prompt) {
          const suggestion = this.gapSuggestions.get(result.promptId);
          const mentionedCompetitors = Object.entries(result.competitorScores)
            .filter(([, score]) => score > 0)
            .map(([name]) => name);
          const discoveredBrands = this.extractBrandsFromAnswer(
            result.answer,
            project.brandName,
            [...project.competitors, ...mentionedCompetitors]
          );
          const allMentioned = [...new Set([...mentionedCompetitors, ...discoveredBrands])];

          gaps.push({
            promptId: result.promptId,
            promptText: prompt.text,
            brandScore: result.brandScore,
            competitorScores: result.competitorScores,
            mentionedBrands: allMentioned,
            engine: result.engine,
            answer: result.answer,
            suggestedAnswer: suggestion?.suggestedAnswer,
            suggestedPageType: suggestion?.suggestedPageType,
            suggestion: suggestion ? {
              contentTask: suggestion.contentTask || "",
              contentType: suggestion.contentType || suggestion.suggestedPageType || "",
              coverageChecklist: suggestion.coverageChecklist || [],
              implementationPlace: suggestion.implementationPlace || "",
              internalLinkIdeas: suggestion.internalLinkIdeas || [],
              suggestedTitle: suggestion.suggestedTitle || "",
              suggestedHeadings: suggestion.suggestedHeadings || [],
              suggestedIntro: suggestion.suggestedIntro || "",
              intentTag: suggestion.intentTag || "Informational",
            } : undefined,
          });
        }
      }
    }

    return gaps;
  }

  private extractBrandsFromAnswer(answer: string, brandName: string, knownCompetitors: string[]): string[] {
    const brandPatterns = [
      /\b([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*(?:\.[a-z]{2,})?)\b/g,
      /\b([A-Z][a-zA-Z]*(?:ly|ify|hub|desk|flow|stack|base|craft|wise|bit|spot|form|kit|jar|pod|box|lab|pad|doc|app|ai|io))\b/gi,
    ];

    const discovered = new Set<string>();
    const lowerAnswer = answer.toLowerCase();
    const lowerBrand = brandName.toLowerCase();
    const lowerKnown = knownCompetitors.map(c => c.toLowerCase());
    const commonWords = new Set([
      "the", "and", "for", "are", "but", "not", "you", "all", "can", "had", "her", "was", "one", "our",
      "out", "has", "his", "how", "its", "may", "new", "now", "old", "see", "way", "who", "did", "get",
      "let", "say", "she", "too", "use", "this", "that", "with", "have", "from", "they", "been", "some",
      "when", "what", "your", "each", "make", "like", "just", "over", "such", "take", "than", "them",
      "very", "after", "also", "made", "many", "most", "must", "name", "much", "only", "other", "then",
      "time", "well", "into", "here", "there", "these", "those", "where", "which", "while", "about",
      "could", "would", "should", "their", "first", "being", "still", "using", "known", "based",
      "however", "another", "because", "before", "between", "through", "during", "without",
      "several", "include", "including", "especially", "consider", "depending", "overall",
      "whether", "various", "popular", "great", "good", "best", "better", "tool", "tools",
      "platform", "software", "service", "solution", "option", "options", "features", "offers",
    ]);

    for (const pattern of brandPatterns) {
      let match;
      while ((match = pattern.exec(answer)) !== null) {
        const word = match[1].trim();
        if (word.length < 3 || word.length > 30) continue;
        const lower = word.toLowerCase();
        if (lower === lowerBrand) continue;
        if (lowerKnown.includes(lower)) continue;
        if (commonWords.has(lower)) continue;
        discovered.add(word);
      }
    }

    return Array.from(discovered).slice(0, 10);
  }

  async updateGapSuggestion(promptId: string, data: GapSuggestionData): Promise<void> {
    this.gapSuggestions.set(promptId, data);
  }

  async getSeoReadiness(projectId: string): Promise<SeoReadiness | undefined> {
    const [assessment] = await db.select().from(seoReadinessAssessments)
      .where(eq(seoReadinessAssessments.projectId, projectId));
    return assessment;
  }

  async createSeoReadiness(assessment: InsertSeoReadiness): Promise<SeoReadiness> {
    const [created] = await db.insert(seoReadinessAssessments).values(assessment).returning();
    return created;
  }

  async updateSeoReadiness(projectId: string, data: Partial<InsertSeoReadiness>): Promise<SeoReadiness | undefined> {
    const [updated] = await db.update(seoReadinessAssessments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(seoReadinessAssessments.projectId, projectId))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
