import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { getStripeSync } from './stripeClient';
import { WebhookHandlers } from './webhookHandlers';

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

// Prevent information leakage
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

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn('DATABASE_URL not set, skipping Stripe initialization');
    return;
  }

  const isReplit = !!process.env.REPL_ID;

  try {
    if (isReplit) {
      const { runMigrations } = await import('stripe-replit-sync');
      log('Initializing Stripe schema...', 'stripe');
      await runMigrations({ databaseUrl });
      log('Stripe schema ready', 'stripe');

      const stripeSync = await getStripeSync();

      log('Setting up managed webhook...', 'stripe');
      const domains = process.env.REPLIT_DOMAINS?.split(',') || [];
      if (domains.length > 0 && domains[0]) {
        try {
          const webhookBaseUrl = `https://${domains[0]}`;
          const result = await stripeSync.findOrCreateManagedWebhook(
            `${webhookBaseUrl}/api/stripe/webhook`
          );
          if (result?.webhook?.url) {
            log(`Webhook configured: ${result.webhook.url}`, 'stripe');
          } else {
            log('Webhook endpoint registered', 'stripe');
          }
        } catch (webhookError) {
          log('Webhook setup skipped (may work via dashboard)', 'stripe');
        }
      } else {
        log('No domains configured, webhook setup skipped', 'stripe');
      }

      log('Syncing Stripe data...', 'stripe');
      stripeSync.syncBackfill()
        .then(() => log('Stripe data synced', 'stripe'))
        .catch((err: any) => console.error('Error syncing Stripe data:', err));
    } else {
      log('Running outside Replit - Stripe webhook should be configured via Stripe Dashboard', 'stripe');
    }
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
  }
}

// Initialize Stripe
await initStripe();

// Register Stripe webhook route BEFORE express.json()
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

// Now apply JSON middleware for all other routes
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

  // Global error handler - sanitizes errors in production to prevent info leakage
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const isProduction = process.env.NODE_ENV === "production";
    
    // Log full error server-side (never exposed to client)
    console.error("Internal Server Error:", isProduction ? err.message : err);

    if (res.headersSent) {
      return next(err);
    }

    // In production, never expose internal error details or stack traces
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
  const listenOptions: any = {
    port,
    host: "0.0.0.0",
  };
  if (process.env.REPL_ID) {
    listenOptions.reusePort = true;
  }
  httpServer.listen(
    listenOptions,
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
