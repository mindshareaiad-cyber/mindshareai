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
  userProfiles,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // User Profiles
  getUserProfile(id: string): Promise<UserProfile | undefined>;
  getUserProfileByEmail(email: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(id: string, data: UpdateUserProfile): Promise<UserProfile | undefined>;

  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  // Prompt Sets
  getPromptSets(projectId: string): Promise<PromptSet[]>;
  getPromptSet(id: string): Promise<PromptSet | undefined>;
  createPromptSet(promptSet: InsertPromptSet): Promise<PromptSet>;
  deletePromptSet(id: string): Promise<void>;

  // Prompts
  getPrompts(promptSetId: string): Promise<Prompt[]>;
  getPromptsByProject(projectId: string): Promise<Prompt[]>;
  getPrompt(id: string): Promise<Prompt | undefined>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  deletePrompt(id: string): Promise<void>;

  // Scans
  getScans(projectId: string): Promise<Scan[]>;
  getLatestScan(projectId: string): Promise<Scan | undefined>;
  createScan(scan: InsertScan): Promise<Scan>;

  // Scan Results
  getScanResults(scanId: string): Promise<ScanResult[]>;
  createScanResult(result: InsertScanResult): Promise<ScanResult>;

  // Gap Analysis
  getGaps(projectId: string): Promise<GapAnalysis[]>;
  updateGapSuggestion(promptId: string, suggestedAnswer: string, suggestedPageType: string): Promise<void>;

  // Stripe data queries
  getStripeProduct(productId: string): Promise<any>;
  listStripeProducts(): Promise<any[]>;
  getStripeSubscription(subscriptionId: string): Promise<any>;
}

export class MemStorage implements IStorage {
  private userProfilesMap: Map<string, UserProfile> = new Map();
  private projects: Map<string, Project> = new Map();
  private promptSets: Map<string, PromptSet> = new Map();
  private prompts: Map<string, Prompt> = new Map();
  private scans: Map<string, Scan> = new Map();
  private scanResults: Map<string, ScanResult> = new Map();
  private gapSuggestions: Map<string, { suggestedAnswer: string; suggestedPageType: string }> = new Map();

  // User Profiles
  async getUserProfile(id: string): Promise<UserProfile | undefined> {
    try {
      const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.id, id));
      return profile;
    } catch {
      return this.userProfilesMap.get(id);
    }
  }

  async getUserProfileByEmail(email: string): Promise<UserProfile | undefined> {
    try {
      const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.email, email));
      return profile;
    } catch {
      return Array.from(this.userProfilesMap.values()).find(p => p.email === email);
    }
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    try {
      const [created] = await db.insert(userProfiles).values(profile).returning();
      return created;
    } catch {
      const newProfile: UserProfile = {
        ...profile,
        firstName: profile.firstName || null,
        lastName: profile.lastName || null,
        companyName: profile.companyName || null,
        websiteUrl: profile.websiteUrl || null,
        industry: profile.industry || null,
        companySize: profile.companySize || null,
        onboardingCompleted: profile.onboardingCompleted ?? false,
        stripeCustomerId: profile.stripeCustomerId || null,
        stripeSubscriptionId: profile.stripeSubscriptionId || null,
        subscriptionStatus: profile.subscriptionStatus || 'inactive',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.userProfilesMap.set(profile.id, newProfile);
      return newProfile;
    }
  }

  async updateUserProfile(id: string, data: UpdateUserProfile): Promise<UserProfile | undefined> {
    try {
      const [updated] = await db.update(userProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(userProfiles.id, id))
        .returning();
      return updated;
    } catch {
      const existing = this.userProfilesMap.get(id);
      if (!existing) return undefined;
      const updated = { ...existing, ...data, updatedAt: new Date() };
      this.userProfilesMap.set(id, updated);
      return updated;
    }
  }

  // Stripe queries
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

  // Projects
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      ...insertProject,
      id,
      userId: insertProject.userId || null,
      competitors: insertProject.competitors || [],
      createdAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    this.projects.delete(id);
    for (const [setId, set] of this.promptSets) {
      if (set.projectId === id) {
        await this.deletePromptSet(setId);
      }
    }
    for (const [scanId, scan] of this.scans) {
      if (scan.projectId === id) {
        this.scans.delete(scanId);
        for (const [resultId, result] of this.scanResults) {
          if (result.scanId === scanId) {
            this.scanResults.delete(resultId);
          }
        }
      }
    }
  }

  // Prompt Sets
  async getPromptSets(projectId: string): Promise<PromptSet[]> {
    return Array.from(this.promptSets.values())
      .filter((set) => set.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getPromptSet(id: string): Promise<PromptSet | undefined> {
    return this.promptSets.get(id);
  }

  async createPromptSet(insertPromptSet: InsertPromptSet): Promise<PromptSet> {
    const id = randomUUID();
    const promptSet: PromptSet = {
      ...insertPromptSet,
      id,
      persona: insertPromptSet.persona || null,
      funnelStage: insertPromptSet.funnelStage || null,
      country: insertPromptSet.country || null,
      createdAt: new Date(),
    };
    this.promptSets.set(id, promptSet);
    return promptSet;
  }

  async deletePromptSet(id: string): Promise<void> {
    this.promptSets.delete(id);
    for (const [promptId, prompt] of this.prompts) {
      if (prompt.promptSetId === id) {
        this.prompts.delete(promptId);
      }
    }
  }

  // Prompts
  async getPrompts(promptSetId: string): Promise<Prompt[]> {
    return Array.from(this.prompts.values())
      .filter((prompt) => prompt.promptSetId === promptSetId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async getPromptsByProject(projectId: string): Promise<Prompt[]> {
    const sets = await this.getPromptSets(projectId);
    const setIds = new Set(sets.map((s) => s.id));
    return Array.from(this.prompts.values()).filter((prompt) =>
      setIds.has(prompt.promptSetId)
    );
  }

  async getPrompt(id: string): Promise<Prompt | undefined> {
    return this.prompts.get(id);
  }

  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const id = randomUUID();
    const prompt: Prompt = {
      ...insertPrompt,
      id,
      createdAt: new Date(),
    };
    this.prompts.set(id, prompt);
    return prompt;
  }

  async deletePrompt(id: string): Promise<void> {
    this.prompts.delete(id);
  }

  // Scans
  async getScans(projectId: string): Promise<Scan[]> {
    return Array.from(this.scans.values())
      .filter((scan) => scan.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getLatestScan(projectId: string): Promise<Scan | undefined> {
    const scans = await this.getScans(projectId);
    return scans[0];
  }

  async createScan(insertScan: InsertScan): Promise<Scan> {
    const id = randomUUID();
    const scan: Scan = {
      ...insertScan,
      id,
      createdAt: new Date(),
    };
    this.scans.set(id, scan);
    return scan;
  }

  // Scan Results
  async getScanResults(scanId: string): Promise<ScanResult[]> {
    return Array.from(this.scanResults.values()).filter(
      (result) => result.scanId === scanId
    );
  }

  async createScanResult(insertResult: InsertScanResult): Promise<ScanResult> {
    const id = randomUUID();
    const result: ScanResult = {
      ...insertResult,
      id,
      brandScore: insertResult.brandScore ?? 0,
      createdAt: new Date(),
    };
    this.scanResults.set(id, result);
    return result;
  }

  // Gap Analysis
  async getGaps(projectId: string): Promise<GapAnalysis[]> {
    const latestScan = await this.getLatestScan(projectId);
    if (!latestScan) return [];

    const results = await this.getScanResults(latestScan.id);
    const gaps: GapAnalysis[] = [];

    for (const result of results) {
      const hasCompetitorMention = Object.values(result.competitorScores).some(
        (score) => score > 0
      );
      if (result.brandScore === 0 && hasCompetitorMention) {
        const prompt = await this.getPrompt(result.promptId);
        if (prompt) {
          const suggestion = this.gapSuggestions.get(result.promptId);
          gaps.push({
            promptId: result.promptId,
            promptText: prompt.text,
            brandScore: result.brandScore,
            competitorScores: result.competitorScores,
            suggestedAnswer: suggestion?.suggestedAnswer,
            suggestedPageType: suggestion?.suggestedPageType,
          });
        }
      }
    }

    return gaps;
  }

  async updateGapSuggestion(
    promptId: string,
    suggestedAnswer: string,
    suggestedPageType: string
  ): Promise<void> {
    this.gapSuggestions.set(promptId, { suggestedAnswer, suggestedPageType });
  }
}

export const storage = new MemStorage();
