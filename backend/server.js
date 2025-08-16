// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import multer from "multer";  
import { fileURLToPath } from "url";

// If you actually use TensorFlow in routes, keep this import.
// If not, consider lazy-importing inside the disease route to reduce startup cost.
import * as tf from "@tensorflow/tfjs-node";

// Routes
import cropRoutes from "./routes/cropRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";
import forumRoutes from "./routes/forum.js";
import diseaseRoutes from "./routes/disease.js";
import schemeRoutes from "./routes/schemeRoutes.js";

// Initialize environment variables
dotenv.config();

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express App
const app = express();

app.use(cors());
app.use(express.json());

// Serve frontend build (adjust "dist" if your build folder is different)
app.use(express.static(path.join(__dirname, "dist")));

// Serve model files if the frontend needs to fetch them
app.use("/model", express.static(path.join(__dirname, "model")));

// Multer setup (memory storage) — only keep if you need in-memory uploads
const upload = multer({ storage: multer.memoryStorage() });

// = API ROUTES =
// If any route needs `upload`, pass it to that router or use per-endpoint, e.g.:
// app.post("/api/disease/predict", upload.single("image"), diseasePredictHandler);

app.use("/api/crop-recommendation", cropRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/disease", diseaseRoutes);   // TensorFlow image model used here
app.use("/api/schemes", schemeRoutes);    // Government scheme list from your DB or static JSON

// Root route
app.get("/", (req, res) => {
  res.send("✅ Server is running!");
});

// Basic error handler (put after routes)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start Server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
