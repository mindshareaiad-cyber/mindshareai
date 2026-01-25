import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateAnswer, scoreVisibility, generateSuggestedAnswer, getAvailableEngines, getAvailableEnginesForUser, getEnginesForTier, isEngineAvailableForTier, type LLMEngine, type SubscriptionTier } from "./llm-client";
import { insertProjectSchema, insertPromptSetSchema, insertPromptSchema, updateUserProfileSchema } from "@shared/schema";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";

// Helper to determine subscription tier from status
function getSubscriptionTier(subscriptionStatus: string | null | undefined): SubscriptionTier {
  if (!subscriptionStatus || subscriptionStatus !== 'active') {
    return 'starter';
  }
  // For now, all active subscribers get 'pro' tier
  // In a full implementation, this would check the Stripe price ID
  return 'pro';
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ============= User Profiles =============

  // Get user profile
  app.get("/api/user-profile/:userId", async (req, res) => {
    try {
      const profile = await storage.getUserProfile(req.params.userId);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error getting user profile:", error);
      res.status(500).json({ error: "Failed to get user profile" });
    }
  });

  // Create or update user profile
  app.post("/api/user-profile", async (req, res) => {
    try {
      const { id, email, firstName, lastName, companyName } = req.body;
      
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
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error creating/updating user profile:", error);
      res.status(500).json({ error: "Failed to save user profile" });
    }
  });

  // Update onboarding info
  app.post("/api/user-profile/:userId/onboarding", async (req, res) => {
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

      res.json(profile);
    } catch (error) {
      console.error("Error updating onboarding:", error);
      res.status(500).json({ error: "Failed to update onboarding" });
    }
  });

  // ============= Stripe Endpoints =============

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

  // Create checkout session
  app.post("/api/stripe/create-checkout-session", async (req, res) => {
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

      // Get the base URL
      const domains = process.env.REPLIT_DOMAINS?.split(',') || [];
      const baseUrl = domains.length > 0 ? `https://${domains[0]}` : 'http://localhost:5000';

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

  // Verify payment success
  app.post("/api/stripe/verify-payment", async (req, res) => {
    try {
      const { sessionId, userId } = req.body;
      const stripe = await getUncachableStripeClient();

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status === 'paid' && session.subscription) {
        await storage.updateUserProfile(userId, {
          stripeSubscriptionId: session.subscription as string,
          subscriptionStatus: 'active',
        });
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  // Get subscription status
  app.get("/api/stripe/subscription/:userId", async (req, res) => {
    try {
      const profile = await storage.getUserProfile(req.params.userId);
      if (!profile) {
        return res.json({ hasActiveSubscription: false });
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

  // Create customer portal session
  app.post("/api/stripe/customer-portal", async (req, res) => {
    try {
      const { userId } = req.body;
      const stripe = await getUncachableStripeClient();

      const profile = await storage.getUserProfile(userId);
      if (!profile?.stripeCustomerId) {
        return res.status(400).json({ error: "No customer found" });
      }

      const domains = process.env.REPLIT_DOMAINS?.split(',') || [];
      const baseUrl = domains.length > 0 ? `https://${domains[0]}` : 'http://localhost:5000';

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
  
  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error getting projects:", error);
      res.status(500).json({ error: "Failed to get projects" });
    }
  });

  // Get single project
  app.get("/api/projects/:projectId", async (req, res) => {
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

  // Create project
  app.post("/api/projects", async (req, res) => {
    try {
      const parsed = insertProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).message });
      }
      const project = await storage.createProject(parsed.data);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Delete project
  app.delete("/api/projects/:projectId", async (req, res) => {
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
  app.get("/api/projects/:projectId/prompt-sets", async (req, res) => {
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
  app.post("/api/projects/:projectId/prompt-sets", async (req, res) => {
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
  app.delete("/api/prompt-sets/:promptSetId", async (req, res) => {
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
  app.post("/api/prompt-sets/:promptSetId/prompts", async (req, res) => {
    try {
      const parsed = insertPromptSchema.safeParse({
        ...req.body,
        promptSetId: req.params.promptSetId,
      });
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).message });
      }
      const prompt = await storage.createPrompt(parsed.data);
      res.status(201).json(prompt);
    } catch (error) {
      console.error("Error creating prompt:", error);
      res.status(500).json({ error: "Failed to create prompt" });
    }
  });

  // Delete prompt
  app.delete("/api/prompts/:promptId", async (req, res) => {
    try {
      await storage.deletePrompt(req.params.promptId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting prompt:", error);
      res.status(500).json({ error: "Failed to delete prompt" });
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
  app.get("/api/engines/:userId", async (req, res) => {
    try {
      const profile = await storage.getUserProfile(req.params.userId);
      const tier = getSubscriptionTier(profile?.subscriptionStatus);
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
  app.post("/api/projects/:projectId/scans", async (req, res) => {
    try {
      const scanInputSchema = z.object({
        engines: z.array(z.enum(["chatgpt", "deepseek"])).default(["chatgpt"]),
      });
      const parsed = scanInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromError(parsed.error).message });
      }
      const { engines } = parsed.data;
      const projectId = req.params.projectId;

      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const prompts = await storage.getPromptsByProject(projectId);
      if (prompts.length === 0) {
        return res.status(400).json({ error: "No prompts to scan" });
      }

      // Create the scan
      const scan = await storage.createScan({
        projectId,
        engines,
      });

      // Process each prompt
      const results = [];
      for (const prompt of prompts) {
        for (const engine of engines) {
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
            console.error(`Error processing prompt ${prompt.id}:`, error);
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
      });
    } catch (error) {
      console.error("Error running scan:", error);
      res.status(500).json({ error: "Failed to run scan" });
    }
  });

  // Get latest scan with results
  app.get("/api/projects/:projectId/scans/latest", async (req, res) => {
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

  // ============= Gaps =============
  
  // Get gaps for a project
  app.get("/api/projects/:projectId/gaps", async (req, res) => {
    try {
      const gaps = await storage.getGaps(req.params.projectId);
      res.json(gaps);
    } catch (error) {
      console.error("Error getting gaps:", error);
      res.status(500).json({ error: "Failed to get gaps" });
    }
  });

  // Generate suggestion for a gap
  app.post("/api/gaps/:promptId/suggest", async (req, res) => {
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

  return httpServer;
}
