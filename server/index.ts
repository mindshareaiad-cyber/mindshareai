import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { WebhookHandlers } from './webhookHandlers';
import { pool } from './db';

const app = express();
const httpServer = createServer(app);

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const connectSrcDirectives: string[] = ["'self'", "https://api.stripe.com", "https://*.supabase.co", "wss:", "ws:"];
if (supabaseUrl) {
  connectSrcDirectives.push(supabaseUrl);
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: connectSrcDirectives,
      frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
}));

app.disable('x-powered-by');

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

async function initDatabase() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set, skipping database initialization');
    return;
  }

  try {
    log('Checking database tables...', 'db');
    const client = await pool.connect();
    try {
      const tableCheck = await client.query(
        `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles')`
      );
      if (!tableCheck.rows[0].exists) {
        log('Creating database tables...', 'db');
        await client.query(`
          CREATE TABLE IF NOT EXISTS user_profiles (
            id VARCHAR PRIMARY KEY,
            email TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            company_name TEXT,
            website_url TEXT,
            industry TEXT,
            company_size TEXT,
            onboarding_completed BOOLEAN NOT NULL DEFAULT false,
            stripe_customer_id TEXT,
            stripe_subscription_id TEXT,
            stripe_price_id TEXT,
            subscription_status TEXT DEFAULT 'inactive',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS projects (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id VARCHAR REFERENCES user_profiles(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            brand_name TEXT NOT NULL,
            brand_domain TEXT NOT NULL,
            competitors TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS prompt_sets (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id VARCHAR NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            persona TEXT,
            funnel_stage TEXT,
            country TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS prompts (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
            prompt_set_id VARCHAR NOT NULL REFERENCES prompt_sets(id) ON DELETE CASCADE,
            text TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS scans (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id VARCHAR NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
            engines JSONB NOT NULL,
            notes TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS scan_results (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
            scan_id VARCHAR NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
            prompt_id VARCHAR NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
            engine TEXT NOT NULL,
            answer TEXT NOT NULL,
            brand_score INTEGER NOT NULL DEFAULT 0,
            competitor_scores JSONB NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS seo_readiness_assessments (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id VARCHAR NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
            overall_score INTEGER NOT NULL DEFAULT 0,
            has_website BOOLEAN DEFAULT false,
            has_meta_descriptions BOOLEAN DEFAULT false,
            has_structured_headers BOOLEAN DEFAULT false,
            has_blog_or_knowledge_base BOOLEAN DEFAULT false,
            has_schema_markup BOOLEAN DEFAULT false,
            has_faq_section BOOLEAN DEFAULT false,
            has_contact_info BOOLEAN DEFAULT false,
            has_social_profiles BOOLEAN DEFAULT false,
            content_depth_score INTEGER DEFAULT 0,
            technical_seo_score INTEGER DEFAULT 0,
            recommendation_level TEXT DEFAULT 'not_ready',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);
        log('Database tables created successfully', 'db');
      } else {
        log('Database tables already exist', 'db');
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

try {
  await initDatabase();
} catch (error: any) {
  console.error('FATAL: Database initialization failed:', error.message);
  console.error('Check your DATABASE_URL environment variable');
  process.exit(1);
}

log('Stripe webhook configured - set STRIPE_WEBHOOK_SECRET and configure webhook URL in Stripe Dashboard', 'stripe');

app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature' });
    }

    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;

      if (!Buffer.isBuffer(req.body)) {
        console.error('STRIPE WEBHOOK ERROR: req.body is not a Buffer');
        return res.status(500).json({ error: 'Webhook processing error' });
      }

      await WebhookHandlers.processWebhook(req.body as Buffer, sig);
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ error: 'Webhook processing error' });
    }
  }
);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const isProduction = process.env.NODE_ENV === "production";
    
    console.error("Internal Server Error:", isProduction ? err.message : err);

    if (res.headersSent) {
      return next(err);
    }

    const clientMessage = isProduction && status === 500 
      ? "An unexpected error occurred" 
      : (err.message || "Internal Server Error");

    return res.status(status).json({ message: clientMessage });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    { port, host: "0.0.0.0" },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
