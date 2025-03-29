import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";   
import multer from "multer";  
import * as tf from "@tensorflow/tfjs-node";
import cropRoutes from "./routes/cropRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";
import forumRoutes from "./routes/forum.js";
import diseaseRoutes from "./routes/disease.js";
import schemeRoutes from "./routes/schemeRoutes.js";
import { preprocessImage } from "./utils/preprocess.js"; // Ensure this function exists

// Load environment variables
dotenv.config();

// Get the directory name in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("📁 Current __dirname:", __dirname);

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json()); 

// Serve TensorFlow.js model files (if needed for frontend access)
app.use('/model', express.static(path.join(__dirname, 'model')));
app.use(express.static("public"));

// Multer setup for handling image uploads
const upload = multer({ storage: multer.memoryStorage() });

// ✅ API Routes (No model loading here)
app.use("/api/crop-recommendation", cropRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/disease", diseaseRoutes); // Model loading happens inside disease.js
app.use("/api/schemes", schemeRoutes);

// ✅ Root Route
app.get("/", (req, res) => res.send("✅ Server is running!"));

// ✅ Start Server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
