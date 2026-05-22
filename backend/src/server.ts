import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Import routes
import authRoutes from "./routes/auth";
import expenseRoutes from "./routes/expenses";
import categoryRoutes from "./routes/categories";
import analyticsRoutes from "./routes/analytics";

// Import middleware
import { errorHandler, notFound } from "./middleware/errorHandler";

// Create Express app
const app = express();

const FRONTEND_URL = process.env["FRONTEND_URL"];

if (!FRONTEND_URL) {
  console.error("FATAL: FRONTEND_URL environment variable is not set");
  process.exit(1);
}

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// CORS configuration
app.use(
  cors({
    origin: process.env["FRONTEND_URL"] || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests from this IP, please try again later",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use("/api", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/expenses", expenseRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env["NODE_ENV"] || "development",
  });
});

// API info endpoint
app.get("/api", (_req, res) => {
  res.json({
    name: "IU Expense Tracker API",
    version: "1.0.0",
    description: "Backend API for IU Expense Tracker application",
    endpoints: {
      auth: "/api/v1/auth",
      expenses: "/api/v1/expenses",
      categories: "/api/v1/categories",
      analytics: "/api/v1/analytics",
    },
    documentation: "/api/docs",
    health: "/health",
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env["PORT"] || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API info: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env["NODE_ENV"] || "development"}\n`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

export { app };
