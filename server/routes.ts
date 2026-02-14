import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateAnswer, scoreVisibility, generateSuggestedAnswer, getAvailableEngines, getAvailableEnginesForUser, getEnginesForTier, type LLMEngine, type SubscriptionTier } from "./llm-client";
import { insertProjectSchema, insertPromptSetSchema, insertPromptSchema, updateUserProfileSchema, updateSeoReadinessSchema } from "@shared/schema";
import { calculateOverallScore, getRecommendationLevel, buildReadinessReport, createDefaultAssessment } from "./seo-readiness";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { getPlan, getPlanByPriceId, canCreateProject, canAddPrompts, canRunScan, canUseEngine, getPromptsForMultiEngine, ENGINE_TIERS, type PlanId } from "./plans";
import { sendWelcomeEmail, sendSubscriptionActivatedEmail } from "./email-service";
import { requireAuth, requireOwnership } from "./auth-middleware";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'mindshareai@gmail.com').split(',').map(e => e.trim().toLowerCase());

function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

function sanitizeProfile(profile: any) {
  if (!profile) return profile;
  const { stripeCustomerId, stripeSubscriptionId, stripePriceId, ...safe } = profile;
  return safe;
}

function getUserPlanId(subscriptionStatus: string | null | undefined, stripePriceId?: string | null, email?: string | null): PlanId {
  if (isAdminEmail(email)) {
    return 'pro';
  }
  if (!subscriptionStatus || subscriptionStatus !== 'active') {
    return 'starter';
  }
  
  if (stripePriceId) {
    if (stripePriceId === process.env.STRIPE_PRO_PRICE_ID) {
      return "pro";
    }
    if (stripePriceId === process.env.STRIPE_GROWTH_PRICE_ID) {
      return "growth";
    }
    if (stripePriceId === process.env.STRIPE_STARTER_PRICE_ID) {
      return "starter";
    }
    const priceLower = stripePriceId.toLowerCase();
    if (priceLower.includes("pro") || priceLower.includes("199")) {
      return "pro";
    }
    if (priceLower.includes("growth") || priceLower.includes("79")) {
      return "growth";
    }
  }
  
  return 'starter';
}

// Keep old function for backward compatibility
function getSubscriptionTier(subscriptionStatus: string | null | undefined): SubscriptionTier {
  return getUserPlanId(subscriptionStatus) as SubscriptionTier;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ============= User Profiles =============

  // Get user profile
  app.get("/api/user-profile/:userId", requireAuth, requireOwnership("userId"), async (req, res) => {
    try {
      const profile = await storage.getUserProfile(req.params.userId);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(sanitizeProfile(profile));
    } catch (error) {
      console.error("Error getting user profile:", error);
      res.status(500).json({ error: "Failed to get user profile" });
    }
  });

  app.post("/api/user-profile", requireAuth, async (req, res) => {
    try {
      const { id, email, firstName, lastName, companyName } = req.body;
      
      if (id !== req.userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      let profile = await storage.getUserProfile(id);
      
      if (profile) {
        profile = await storage.updateUserProfile(id, { email, firstName, lastName, companyName });
      } else {
        profile = await storage.createUserProfile({
          id,
          email,
          firstName,
          lastName,
          companyName,
        });
        sendWelcomeEmail(email, firstName || null).catch(() => {});
      }
      
      res.json(sanitizeProfile(profile));
    } catch (error) {
      console.error("Error creating/updating user profile:", error);
      res.status(500).json({ error: "Failed to save user profile" });
    }
  });

  // Update onboarding info
  app.post("/api/user-profile/:userId/onboarding", requireAuth, requireOwnership("userId"), async (req, res) => {
    try {
      const parsed = updateUserProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).message });
      }

      const profile = await storage.updateUserProfile(req.params.userId, {
        ...parsed.data,
        onboardingCompleted: true,
      });

      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      res.json(sanitizeProfile(profile));
    } catch (error) {
      console.error("Error updating onboarding:", error);
      res.status(500).json({ error: "Failed to update onboarding" });
    }
  });

  // ============= Stripe Endpoints =============

  app.get("/api/stripe/price-ids", async (req, res) => {
    res.json({
      starter: process.env.STRIPE_STARTER_PRICE_ID || null,
      growth: process.env.STRIPE_GROWTH_PRICE_ID || null,
      pro: process.env.STRIPE_PRO_PRICE_ID || null,
    });
  });

  // Get Stripe publishable key
  app.get("/api/stripe/publishable-key", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Error getting publishable key:", error);
      res.status(500).json({ error: "Failed to get publishable key" });
    }
  });

  app.post("/api/stripe/create-checkout-session", requireAuth, async (req, res) => {
    try {
      const { userId, email, priceId } = req.body;
      const stripe = await getUncachableStripeClient();

      let profile = await storage.getUserProfile(userId);
      let customerId = profile?.stripeCustomerId;

      // Create or get Stripe customer
      if (!customerId) {
        const customer = await stripe.customers.create({
          email,
          metadata: { userId },
        });
        customerId = customer.id;
        await storage.updateUserProfile(userId, { stripeCustomerId: customerId });
      }

      const baseUrl = process.env.APP_URL || 'http://localhost:5000';

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/payment`,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.post("/api/stripe/verify-payment", requireAuth, async (req, res) => {
    try {
      const { sessionId, userId } = req.body;
      const stripe = await getUncachableStripeClient();

      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items.data.price'],
      });
      
      if (session.payment_status === 'paid' && session.subscription) {
        const priceId = session.line_items?.data?.[0]?.price?.id;
        
        const updateData: Record<string, unknown> = {
          stripeSubscriptionId: session.subscription as string,
          subscriptionStatus: 'active',
        };
        
        if (priceId) {
          updateData.stripePriceId = priceId;
        }
        
        await storage.updateUserProfile(userId, updateData);

        const profile = await storage.getUserProfile(userId);
        if (profile?.email) {
          const planId = getPlanByPriceId(priceId || null);
          sendSubscriptionActivatedEmail(profile.email, profile.firstName || null, planId).catch(() => {});
        }

        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  app.get("/api/stripe/subscription/:userId", requireAuth, requireOwnership("userId"), async (req, res) => {
    try {
      const profile = await storage.getUserProfile(req.params.userId);
      if (!profile) {
        return res.json({ hasActiveSubscription: false });
      }

      if (isAdminEmail(profile.email)) {
        return res.json({
          hasActiveSubscription: true,
          subscriptionStatus: 'active',
          onboardingCompleted: profile.onboardingCompleted,
        });
      }

      const hasActiveSubscription = profile.subscriptionStatus === 'active';
      res.json({
        hasActiveSubscription,
        subscriptionStatus: profile.subscriptionStatus,
        onboardingCompleted: profile.onboardingCompleted,
      });
    } catch (error) {
      console.error("Error getting subscription:", error);
      res.status(500).json({ error: "Failed to get subscription status" });
    }
  });

  app.post("/api/stripe/customer-portal", requireAuth, async (req, res) => {
    try {
      const { userId } = req.body;
      const stripe = await getUncachableStripeClient();

      const profile = await storage.getUserProfile(userId);
      if (!profile?.stripeCustomerId) {
        return res.status(400).json({ error: "No customer found" });
      }

      const baseUrl = process.env.APP_URL || 'http://localhost:5000';

      const session = await stripe.billingPortal.sessions.create({
        customer: profile.stripeCustomerId,
        return_url: `${baseUrl}/dashboard`,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating portal session:", error);
      res.status(500).json({ error: "Failed to create portal session" });
    }
  });

  // ============= Projects =============
  
  app.get("/api/projects", requireAuth, async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error getting projects:", error);
      res.status(500).json({ error: "Failed to get projects" });
    }
  });

  app.get("/api/projects/:projectId", requireAuth, async (req, res) => {
    try {
      const project = await storage.getProject(req.params.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error getting project:", error);
      res.status(500).json({ error: "Failed to get project" });
    }
  });

  app.post("/api/projects", requireAuth, async (req, res) => {
    try {
      const parsed = insertProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).message });
      }
      
      // Enforce project limit based on user's plan
      const userId = parsed.data.userId;
      if (userId) {
        const profile = await storage.getUserProfile(userId);
        const planId = getUserPlanId(profile?.subscriptionStatus, profile?.stripePriceId, profile?.email);
        const projectCount = await storage.countProjectsByUser(userId);
        
        if (!canCreateProject(planId, projectCount)) {
          const plan = getPlan(planId);
          return res.status(403).json({ 
            error: `You've reached the ${plan.maxProjects} project limit on your ${plan.name} plan. Upgrade to create more projects.` 
          });
        }
      }
      
      const project = await storage.createProject(parsed.data);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.delete("/api/projects/:projectId", requireAuth, async (req, res) => {
    try {
      await storage.deleteProject(req.params.projectId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // ============= Prompt Sets =============
  
  // Get prompt sets for a project (with prompts)
  app.get("/api/projects/:projectId/prompt-sets", requireAuth, async (req, res) => {
    try {
      const promptSets = await storage.getPromptSets(req.params.projectId);
      const setsWithPrompts = await Promise.all(
        promptSets.map(async (set) => ({
          ...set,
          prompts: await storage.getPrompts(set.id),
        }))
      );
      res.json(setsWithPrompts);
    } catch (error) {
      console.error("Error getting prompt sets:", error);
      res.status(500).json({ error: "Failed to get prompt sets" });
    }
  });

  // Create prompt set
  app.post("/api/projects/:projectId/prompt-sets", requireAuth, async (req, res) => {
    try {
      const parsed = insertPromptSetSchema.safeParse({
        ...req.body,
        projectId: req.params.projectId,
      });
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).message });
      }
      const promptSet = await storage.createPromptSet(parsed.data);
      res.status(201).json(promptSet);
    } catch (error) {
      console.error("Error creating prompt set:", error);
      res.status(500).json({ error: "Failed to create prompt set" });
    }
  });

  // Delete prompt set
  app.delete("/api/prompt-sets/:promptSetId", requireAuth, async (req, res) => {
    try {
      await storage.deletePromptSet(req.params.promptSetId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting prompt set:", error);
      res.status(500).json({ error: "Failed to delete prompt set" });
    }
  });

  // ============= Prompts =============
  
  // Add prompt to a set
  app.post("/api/prompt-sets/:promptSetId/prompts", requireAuth, async (req, res) => {
    try {
      const parsed = insertPromptSchema.safeParse({
        ...req.body,
        promptSetId: req.params.promptSetId,
      });
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).message });
      }
      
      // Get the prompt set to find the project and user
      const promptSet = await storage.getPromptSet(req.params.promptSetId);
      if (!promptSet) {
        return res.status(404).json({ error: "Prompt set not found" });
      }
      
      const project = await storage.getProject(promptSet.projectId);
      const userId = project?.userId;
      
      // Enforce prompt limit based on user's plan
      if (userId) {
        const profile = await storage.getUserProfile(userId);
        const planId = getUserPlanId(profile?.subscriptionStatus, profile?.stripePriceId, profile?.email);
        const promptCount = await storage.countPromptsByUser(userId);
        
        if (!canAddPrompts(planId, promptCount, 1)) {
          const plan = getPlan(planId);
          return res.status(403).json({ 
            error: `You've reached the ${plan.maxPrompts} prompt limit on your ${plan.name} plan. Upgrade to add more prompts.` 
          });
        }
      }
      
      const prompt = await storage.createPrompt(parsed.data);
      res.status(201).json(prompt);
    } catch (error) {
      console.error("Error creating prompt:", error);
      res.status(500).json({ error: "Failed to create prompt" });
    }
  });

  // Delete prompt
  app.delete("/api/prompts/:promptId", requireAuth, async (req, res) => {
    try {
      await storage.deletePrompt(req.params.promptId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting prompt:", error);
      res.status(500).json({ error: "Failed to delete prompt" });
    }
  });

  // ============= Plans =============
  
  // Get plan info for a user
  app.get("/api/plans/:userId", requireAuth, requireOwnership("userId"), async (req, res) => {
    try {
      const profile = await storage.getUserProfile(req.params.userId);
      const planId = getUserPlanId(profile?.subscriptionStatus, profile?.stripePriceId, profile?.email);
      const plan = getPlan(planId);
      
      // Get current usage
      const projectCount = await storage.countProjectsByUser(req.params.userId);
      const promptCount = await storage.countPromptsByUser(req.params.userId);
      const scansThisMonth = await storage.countScansThisMonth(req.params.userId);
      
      res.json({
        plan,
        usage: {
          projects: projectCount,
          prompts: promptCount,
          scansThisMonth,
        },
        limits: {
          projectsRemaining: plan.maxProjects - projectCount,
          promptsRemaining: plan.maxPrompts - promptCount,
          scansRemaining: plan.maxScansPerMonth - scansThisMonth,
        },
      });
    } catch (error) {
      console.error("Error getting plan info:", error);
      res.status(500).json({ error: "Failed to get plan info" });
    }
  });

  // Get all available plans
  app.get("/api/plans", async (req, res) => {
    try {
      const { PLANS } = await import("./plans");
      res.json(Object.values(PLANS));
    } catch (error) {
      console.error("Error getting plans:", error);
      res.status(500).json({ error: "Failed to get plans" });
    }
  });

  // ============= Engines =============
  
  // Get available AI engines (all configured)
  app.get("/api/engines", async (req, res) => {
    try {
      const engines = getAvailableEngines();
      res.json({ engines });
    } catch (error) {
      console.error("Error getting engines:", error);
      res.status(500).json({ error: "Failed to get engines" });
    }
  });

  // Get engines available for a specific user based on their subscription
  app.get("/api/engines/:userId", requireAuth, requireOwnership("userId"), async (req, res) => {
    try {
      const profile = await storage.getUserProfile(req.params.userId);
      const tier = getUserPlanId(profile?.subscriptionStatus, profile?.stripePriceId, profile?.email) as SubscriptionTier;
      const allTierEngines = getEnginesForTier(tier);
      const availableEngines = getAvailableEnginesForUser(tier);
      
      res.json({ 
        tier,
        allTierEngines,
        availableEngines,
      });
    } catch (error) {
      console.error("Error getting user engines:", error);
      res.status(500).json({ error: "Failed to get user engines" });
    }
  });

  // ============= Scans =============
  
  // Run a scan
  app.post("/api/projects/:projectId/scans", requireAuth, async (req, res) => {
    try {
      const scanInputSchema = z.object({
        userId: z.string().optional(),
        engines: z.array(z.enum(["chatgpt", "claude", "gemini", "perplexity", "deepseek"])).optional(),
        multiEngine: z.boolean().default(false),
        notes: z.string().optional(), // User annotation: "site update", "launch", "PR", etc.
      });
      const parsed = scanInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).message });
      }
      const { userId, multiEngine, notes } = parsed.data;
      const projectId = req.params.projectId;

      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Get user plan and check limits
      const effectiveUserId = userId || project.userId;
      let planId: PlanId = "starter";
      
      if (effectiveUserId) {
        const profile = await storage.getUserProfile(effectiveUserId);
        planId = getUserPlanId(profile?.subscriptionStatus, profile?.stripePriceId, profile?.email);
        
        // Check scan limit
        const scansThisMonth = await storage.countScansThisMonth(effectiveUserId);
        if (!canRunScan(planId, scansThisMonth)) {
          const plan = getPlan(planId);
          return res.status(403).json({ 
            error: `You've used all ${plan.maxScansPerMonth} scans for this month on your ${plan.name} plan. Upgrade to get more scans.` 
          });
        }
      }

      const plan = getPlan(planId);
      
      // Determine which engines to use based on plan
      let enginesToUse: string[];
      
      if (multiEngine && plan.features.multiEngineComparison) {
        // Multi-engine comparison: use allowed engines for this plan
        enginesToUse = plan.allowedEngines.filter(e => canUseEngine(planId, e));
      } else {
        // Default: always use primary (cheapest) engine only
        enginesToUse = [ENGINE_TIERS.primary];
      }

      const prompts = await storage.getPromptsByProject(projectId);
      if (prompts.length === 0) {
        return res.status(400).json({ error: "No prompts to scan" });
      }

      // For multi-engine, limit prompts to prevent excessive costs
      let promptsToScan = prompts;
      if (multiEngine && enginesToUse.length > 1) {
        const maxPrompts = getPromptsForMultiEngine(planId, prompts.length);
        promptsToScan = prompts.slice(0, maxPrompts);
      }

      // Create the scan
      const scan = await storage.createScan({
        projectId,
        engines: enginesToUse,
        notes,
      });

      // Process each prompt
      const results = [];
      for (const prompt of promptsToScan) {
        for (const engine of enginesToUse) {
          try {
            // Generate answer using LLM
            const answer = await generateAnswer(prompt.text, engine as LLMEngine);
            
            // Score visibility
            const { brandScore, competitorScores } = await scoreVisibility(
              answer,
              project.brandName,
              project.brandDomain,
              project.competitors,
              engine as LLMEngine
            );

            // Save result
            const result = await storage.createScanResult({
              scanId: scan.id,
              promptId: prompt.id,
              engine,
              answer,
              brandScore,
              competitorScores,
            });

            results.push(result);
          } catch (error) {
            console.error(`Error processing prompt ${prompt.id} with ${engine}:`, error);
          }
        }
      }

      // Calculate visibility score
      const totalScore = results.reduce((sum, r) => sum + r.brandScore, 0);
      const visibilityScore = results.length > 0 ? totalScore / results.length : 0;

      res.status(201).json({
        scan,
        resultsCount: results.length,
        visibilityScore,
        enginesUsed: enginesToUse,
        promptsScanned: promptsToScan.length,
      });
    } catch (error) {
      console.error("Error running scan:", error);
      res.status(500).json({ error: "Failed to run scan" });
    }
  });

  // Get latest scan with results
  app.get("/api/projects/:projectId/scans/latest", requireAuth, async (req, res) => {
    try {
      const projectId = req.params.projectId;
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const latestScan = await storage.getLatestScan(projectId);
      if (!latestScan) {
        return res.status(404).json({ error: "No scans found" });
      }

      const scanResults = await storage.getScanResults(latestScan.id);
      
      // Enrich results with prompt data
      const resultsWithPrompts = await Promise.all(
        scanResults.map(async (result) => ({
          ...result,
          prompt: await storage.getPrompt(result.promptId),
        }))
      );

      // Calculate visibility score
      const totalBrandScore = scanResults.reduce((sum, r) => sum + r.brandScore, 0);
      const visibilityScore = scanResults.length > 0 ? totalBrandScore / scanResults.length : 0;

      // Calculate competitor scores
      const competitorScores: Record<string, number> = {};
      for (const competitor of project.competitors) {
        const totalCompScore = scanResults.reduce(
          (sum, r) => sum + (r.competitorScores[competitor] || 0),
          0
        );
        competitorScores[competitor] = scanResults.length > 0
          ? totalCompScore / scanResults.length
          : 0;
      }

      res.json({
        scan: latestScan,
        results: resultsWithPrompts,
        visibilityScore,
        competitorScores,
      });
    } catch (error) {
      console.error("Error getting latest scan:", error);
      res.status(500).json({ error: "Failed to get latest scan" });
    }
  });
  
  // Update scan notes
  app.patch("/api/scans/:scanId/notes", requireAuth, async (req, res) => {
    try {
      const { notes } = req.body;
      const scan = await storage.updateScanNotes(req.params.scanId, notes || "");
      if (!scan) {
        return res.status(404).json({ error: "Scan not found" });
      }
      res.json(scan);
    } catch (error) {
      console.error("Error updating scan notes:", error);
      res.status(500).json({ error: "Failed to update scan notes" });
    }
  });

  // ============= Gaps =============
  
  // Get gaps for a project (requires Growth or Pro plan)
  app.get("/api/projects/:projectId/gaps", requireAuth, async (req, res) => {
    try {
      const { projectId } = req.params;
      
      // Get project to find user
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Check plan feature access - default to starter if no user
      let planId: PlanId = "starter";
      if (project.userId) {
        const user = await storage.getUserProfile(project.userId);
        planId = getPlanByPriceId(user?.stripePriceId || null);
      }
      const plan = getPlan(planId);
      
      if (!plan.features.gapAnalysis) {
        return res.status(403).json({ 
          error: "Gap analysis is not available on your plan",
          requiredPlan: "growth",
          currentPlan: planId
        });
      }

      const gaps = await storage.getGaps(projectId);
      res.json(gaps);
    } catch (error) {
      console.error("Error getting gaps:", error);
      res.status(500).json({ error: "Failed to get gaps" });
    }
  });

  // Generate suggestion for a gap (requires Growth or Pro plan)
  app.post("/api/gaps/:promptId/suggest", requireAuth, async (req, res) => {
    try {
      const promptId = req.params.promptId;
      const prompt = await storage.getPrompt(promptId);
      if (!prompt) {
        return res.status(404).json({ error: "Prompt not found" });
      }

      // Find the project for this prompt
      const promptSet = await storage.getPromptSet(prompt.promptSetId);
      if (!promptSet) {
        return res.status(404).json({ error: "Prompt set not found" });
      }

      const project = await storage.getProject(promptSet.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Check plan feature access for AEO suggestions - default to starter if no user
      let planId: PlanId = "starter";
      if (project.userId) {
        const user = await storage.getUserProfile(project.userId);
        planId = getPlanByPriceId(user?.stripePriceId || null);
      }
      const plan = getPlan(planId);
      
      if (!plan.features.aeoSuggestions) {
        return res.status(403).json({ 
          error: "AEO content suggestions are not available on your plan",
          requiredPlan: "growth",
          currentPlan: planId
        });
      }

      // Generate suggestion
      const { suggestedAnswer, suggestedPageType } = await generateSuggestedAnswer(
        prompt.text,
        project.brandName,
        project.brandDomain
      );

      // Store the suggestion
      await storage.updateGapSuggestion(promptId, suggestedAnswer, suggestedPageType);

      res.json({ suggestedAnswer, suggestedPageType });
    } catch (error) {
      console.error("Error generating suggestion:", error);
      res.status(500).json({ error: "Failed to generate suggestion" });
    }
  });

  // ============= SEO Readiness =============

  // Get SEO readiness assessment for a project
  app.get("/api/projects/:projectId/seo-readiness", requireAuth, async (req, res) => {
    try {
      const { projectId } = req.params;
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      let assessment = await storage.getSeoReadiness(projectId);
      
      if (!assessment) {
        // Create default assessment if none exists
        const defaultData = createDefaultAssessment(projectId);
        assessment = await storage.createSeoReadiness({
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
        });
      }

      const report = buildReadinessReport(assessment, project.brandName);
      res.json(report);
    } catch (error) {
      console.error("Error getting SEO readiness:", error);
      res.status(500).json({ error: "Failed to get SEO readiness" });
    }
  });

  // Update SEO readiness assessment
  app.patch("/api/projects/:projectId/seo-readiness", requireAuth, async (req, res) => {
    try {
      const { projectId } = req.params;
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Validate request body using Zod schema
      const parseResult = updateSeoReadinessSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid fields provided", 
          details: parseResult.error.flatten() 
        });
      }

      const validatedData = parseResult.data;
      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({ error: "No valid fields provided" });
      }

      // Get or create existing assessment
      let assessment = await storage.getSeoReadiness(projectId);
      
      if (!assessment) {
        assessment = await storage.createSeoReadiness({
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
        });
      }

      // Merge with validated data only
      const updatedData = { ...assessment, ...validatedData };
      
      // Recalculate score and level
      const overallScore = calculateOverallScore(updatedData);
      const recommendationLevel = getRecommendationLevel(overallScore);

      const updated = await storage.updateSeoReadiness(projectId, {
        ...validatedData,
        overallScore,
        recommendationLevel,
      });

      if (!updated) {
        return res.status(500).json({ error: "Failed to update assessment" });
      }

      const report = buildReadinessReport(updated, project.brandName);
      res.json(report);
    } catch (error) {
      console.error("Error updating SEO readiness:", error);
      res.status(500).json({ error: "Failed to update SEO readiness" });
    }
  });

  // Get guidance messages based on current visibility score
  app.get("/api/projects/:projectId/guidance", requireAuth, async (req, res) => {
    try {
      const { projectId } = req.params;
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Get SEO readiness
      const seoAssessment = await storage.getSeoReadiness(projectId);
      
      // Get latest scan results
      const latestScan = await storage.getLatestScan(projectId);
      const scanResults = latestScan ? await storage.getScanResults(latestScan.id) : [];
      
      // Calculate average visibility score
      const avgScore = scanResults.length > 0 
        ? scanResults.reduce((sum, r) => sum + r.brandScore, 0) / scanResults.length 
        : 0;

      const guidance: any[] = [];

      // SEO readiness guidance
      if (seoAssessment && seoAssessment.overallScore < 60) {
        guidance.push({
          type: "warning",
          title: "Improve SEO Foundation",
          message: `Your SEO readiness score is ${seoAssessment.overallScore}/100. A stronger SEO foundation will help improve your AI visibility.`,
          priority: 1,
        });
      }

      // Visibility score guidance
      if (scanResults.length > 0) {
        if (avgScore < 0.5) {
          guidance.push({
            type: "action",
            title: "Low AI Visibility",
            message: `${project.brandName} is rarely mentioned in AI responses. Focus on creating authoritative content that directly answers user questions.`,
            priority: 2,
          });
        } else if (avgScore < 1.5) {
          guidance.push({
            type: "info",
            title: "Moderate AI Visibility",
            message: `${project.brandName} is sometimes mentioned. Review gaps to understand where competitors are featured instead.`,
            priority: 3,
          });
        } else {
          guidance.push({
            type: "success",
            title: "Strong AI Visibility",
            message: `${project.brandName} has good visibility in AI responses. Continue monitoring and optimizing for new prompts.`,
            priority: 4,
          });
        }
      } else {
        guidance.push({
          type: "info",
          title: "Run Your First Scan",
          message: "Create prompts and run an AI visibility scan to see how your brand appears in AI responses.",
          priority: 0,
        });
      }

      // Gap analysis guidance
      const gaps = await storage.getGaps(projectId);
      if (gaps.length > 0) {
        guidance.push({
          type: "action",
          title: `${gaps.length} Gap Opportunities`,
          message: `Found ${gaps.length} prompts where competitors are mentioned but ${project.brandName} isn't. Review the Gap Analysis for improvement opportunities.`,
          priority: 2,
        });
      }

      res.json({ guidance: guidance.sort((a, b) => a.priority - b.priority) });
    } catch (error) {
      console.error("Error getting guidance:", error);
      res.status(500).json({ error: "Failed to get guidance" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
        subject: z.string().optional(),
        message: z.string().min(1),
      });
      const data = schema.parse(req.body);
      console.log("[Contact Form]", {
        name: data.name,
        email: data.email,
        subject: data.subject || "(none)",
        message: data.message.substring(0, 200),
        timestamp: new Date().toISOString(),
      });
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromError(error).toString() });
      } else {
        res.status(500).json({ error: "Failed to process contact form" });
      }
    }
  });

  return httpServer;
}
