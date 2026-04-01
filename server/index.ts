import express from "express";
import session from "express-session";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic } from "./vite.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session middleware (connect-pg-simple requires DB — skipped for dev without DB)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "sika-dev-secret-change-in-prod",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

registerRoutes(app);

const PORT = parseInt(process.env.PORT || "5000");

if (process.env.NODE_ENV === "production") {
  serveStatic(app);
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} else {
  setupVite(app).then(() => {
    app.listen(PORT, () => {
      console.log(`Dev server running on http://localhost:${PORT}`);
    });
  });
}
