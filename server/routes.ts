import type { Express } from "express";

export function registerRoutes(app: Express) {
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Stub: auth routes — to be implemented in auth phase
  app.post("/api/auth/register", (_req, res) => {
    res.status(501).json({ message: "Not implemented yet" });
  });

  app.post("/api/auth/login", (_req, res) => {
    res.status(501).json({ message: "Not implemented yet" });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if ((req.session as any).userId) {
      res.json({ userId: (req.session as any).userId });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
}
