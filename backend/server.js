import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import cropRoutes from "./routes/cropRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";
import forumRoutes from "./routes/forum.js";
import diseaseRoutes from "./routes/disease.js";
import schemeRoutes from "./routes/schemeRoutes.js";
import voiceRoutes from "./routes/voice.js";
// Initialize environment variables
dotenv.config();

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express App
const app = express();

// Simple CORS configuration
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, "dist")));
app.use("/model", express.static(path.join(__dirname, "model")));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/crop-recommendation", cropRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/disease", diseaseRoutes);
app.use("/api/schemes", schemeRoutes);
app.use("/api/voice", voiceRoutes);
// Root route
app.get("/", (req, res) => {
  res.send("✅ Server is running!");
});

// SPA support - serve index.html for non-API routes
app.get("*", (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  } else {
    res.status(404).json({ error: "API endpoint not found" });
  }
});

// Enhanced error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(err.status || 500).json({ 
    error: err.message || "Internal Server Error" 
  });
});

// Start Server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
