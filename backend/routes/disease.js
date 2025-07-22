import express from "express";
import multer from "multer";
import * as tf from "@tensorflow/tfjs-node";
import path from "path";
import { fileURLToPath } from "url";
import { preprocessImage } from "../utils/preprocess.js";

// Setup for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Multer middleware: store in memory, accept only images, 5MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

// Plant disease class labels
const CLASS_NAMES = [
  "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
  "Blueberry___healthy", "Cherry_(including_sour)___Powdery_mildew", "Cherry_(including_sour)___healthy",
  "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", "Corn_(maize)___Common_rust_",
  "Corn_(maize)___Northern_Leaf_Blight", "Corn_(maize)___healthy", "Grape___Black_rot",
  "Grape___Esca_(Black_Measles)", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy",
  "Orange___Haunglongbing_(Citrus_greening)", "Peach___Bacterial_spot", "Peach___healthy",
  "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy", "Potato___Early_blight",
  "Potato___Late_blight", "Potato___healthy", "Raspberry___healthy", "Soybean___healthy",
  "Squash___Powdery_mildew", "Strawberry___Leaf_scorch", "Strawberry___healthy",
  "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight",
  "Tomato___Leaf_Mold", "Tomato___Septoria_leaf_spot",
  "Tomato___Spider_mites Two-spotted_spider_mite", "Tomato___Target_Spot",
  "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus", "Tomato___healthy"
];

// Efficient, atomic model loading and caching
let model = null;
let modelLoadPromise = null;

const loadModel = async () => {
  if (!modelLoadPromise) {
    const modelPath = `file://${path.join(__dirname, "..", "model", "tfjs_model", "model.json")}`;
    console.log(`Loading model from: ${modelPath}`);
    modelLoadPromise = tf.loadLayersModel(modelPath)
      .then(loaded => {
        model = loaded;
        console.log("Model successfully loaded.");
      })
      .catch(error => {
        modelLoadPromise = null;
        console.error("Model load failed:", error);
        throw error;
      });
  }
  return modelLoadPromise;
};

// Health check endpoint
router.get("/healthz", async (req, res) => {
  try {
    await loadModel();
    res.status(200).json({ status: "ok", model: "loaded" });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Model loading failed." });
  }
});

// Prediction endpoint
router.post("/predict", upload.single("file"), async (req, res, next) => {
  try {
    await loadModel();

    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded. Please include a file." });
    }

    console.log("Image received. Preprocessing...");
    const processedImage = await preprocessImage(req.file.buffer);

    // Shape is [1, 224, 224, 3], safe for prediction
    const predictionArray = tf.tidy(() => {
      const predictions = model.predict(processedImage);
      const softmaxed = tf.softmax(predictions);
      return softmaxed.arraySync();
    });

    const probabilities = predictionArray[0];
    const maxProb = Math.max(...probabilities);
    const predictedIndex = probabilities.indexOf(maxProb);

    const response = {
      disease: CLASS_NAMES[predictedIndex],
      confidence: parseFloat((maxProb * 100).toFixed(2)),
    };

    console.log(`Prediction: ${response.disease} (${response.confidence}%)`);
    res.json(response);

    processedImage.dispose();

  } catch (error) {
    console.error("Prediction error:", error);
    next(error);
  }
});

// Central error handler
router.use((err, req, res, next) => {
  const message = err.message || "An unexpected error occurred.";
  const code = err.status || 500;
  res.status(code).json({ error: message });
});

export default router;
