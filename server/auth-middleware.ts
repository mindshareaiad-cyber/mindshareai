import type { Request, Response, NextFunction, RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const requireAuth: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const token = authHeader.slice(7);

  supabase.auth.getUser(token).then(({ data, error }) => {
    if (error || !data.user) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    req.userId = data.user.id;
    next();
  }).catch(() => {
    res.status(401).json({ error: "Authentication failed" });
  });
};

export function requireOwnership(paramName: string = "userId"): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const targetUserId = req.params[paramName];
    if (targetUserId && targetUserId !== req.userId) {
      res.status(403).json({ error: "Access denied" });
      return;
    }
    next();
  };
}
