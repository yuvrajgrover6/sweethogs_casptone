import express from "express";
import mongoose from "mongoose";
import { errorHandler } from "./src/middleware/errorHandler";
import { notFoundHandler } from "./src/middleware/notFoundHandler";
import { routesConfig } from "./src/routes/routes";
import { config, validateConfig } from "./src/config/config";
import cors from "cors";

// Validate configuration
validateConfig();

const app = express();
const PORT = config.server.port;
const MONGO_URI = config.database.uri;

// MongoDB connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    credentials: false,
  })
);

// Register routes from configuration
routesConfig.forEach((routeConfig) => {
  const router = express.Router();

  routeConfig.paths.forEach((pathConfig) => {
    const method = pathConfig.method.toLowerCase() as
      | "get"
      | "post"
      | "put"
      | "delete"
      | "patch";

    // Handle middleware and handlers
    if (
      "middleware" in pathConfig &&
      pathConfig.middleware &&
      pathConfig.middleware.length > 0
    ) {
      // Register route with middleware followed by handler
      router[method](
        pathConfig.path,
        ...pathConfig.middleware,
        pathConfig.handler
      );
    } else {
      // Register route with just the handler
      router[method](pathConfig.path, pathConfig.handler);
    }
  });

  app.use(routeConfig.base, router);
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Node.js Backend with TypeScript, Bun, Express & MongoDB",
    version: "1.0.0",
    environment: config.server.env,
  });
});

// Health check endpoint for Railway
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.server.env,
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
