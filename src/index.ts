import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import fs from "fs";
import path from "path";

import uploadRoutes from "./routes/uploadRoutes";
import { config } from "./config";

const app = express();

// --------------------
// TRUST PROXY (IMPORTANT for Render + rate limiting)
// --------------------
app.set("trust proxy", 1);

// --------------------
// Ensure uploads directory exists (CRITICAL for Render)
// --------------------
const uploadPath = path.resolve(config.uploadDir);

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// --------------------
// Security Middleware
// --------------------
app.use(helmet());
app.use(compression());

// --------------------
// Rate Limiter (safe for proxies)
// --------------------
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === "/health", // optional optimization
  })
);

// --------------------
// Body Parsing
// --------------------
app.use(express.json());

// --------------------
// CORS (HARDENED + TRIM SAFE)
// --------------------
const allowedOrigins = [
  "http://localhost:5173",
  config.frontendUrl?.replace(/\/$/, ""), // removes trailing slash safety
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: ${origin}`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

// --------------------
// Health Check
// --------------------
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
  });
});

// --------------------
// Routes
// --------------------
app.use("/", uploadRoutes);

// --------------------
// Global Error Handler
// --------------------
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error("🔥 Backend Error:", err);

  res.status(500).json({
    error: "Internal Server Error",
    message: err.message || "Unknown error",
  });
});

// --------------------
// Start Server
// --------------------
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});