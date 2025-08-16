import express from "express";
import multer from "multer";
import * as tf from "@tensorflow/tfjs-node";
import path from "path";
import { fileURLToPath } from "url";
import { preprocessImage } from "../utils/preprocess.js";

// ES modules path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Multer: memory storage, images only, 5MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

const CLASS_NAMES = [
  "Apple___Apple_scab","Apple___Black_rot","Apple___Cedar_apple_rust","Apple___healthy",
  "Blueberry___healthy","Cherry_(including_sour)___Powdery_mildew","Cherry_(including_sour)___healthy",
  "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot","Corn_(maize)___Common_rust_",
  "Corn_(maize)___Northern_Leaf_Blight","Corn_(maize)___healthy","Grape___Black_rot",
  "Grape___Esca_(Black_Measles)","Grape___Leaf_blight_(Isariopsis_Leaf_Spot)","Grape___healthy",
  "Orange___Haunglongbing_(Citrus_greening)","Peach___Bacterial_spot","Peach___healthy",
  "Pepper,_bell___Bacterial_spot","Pepper,_bell___healthy","Potato___Early_blight",
  "Potato___Late_blight","Potato___healthy","Raspberry___healthy","Soybean___healthy",
  "Squash___Powdery_mildew","Strawberry___Leaf_scorch","Strawberry___healthy",
  "Tomato___Bacterial_spot","Tomato___Early_blight","Tomato___Late_blight",
  "Tomato___Leaf_Mold","Tomato___Septoria_leaf_spot",
  "Tomato___Spider_mites Two-spotted_spider_mite","Tomato___Target_Spot",
  "Tomato___Tomato_Yellow_Leaf_Curl_Virus","Tomato___Tomato_mosaic_virus","Tomato___healthy"
];

// Singleton model loader with caching
let model = null;
let modelLoadPromise = null;

const getModelPath = () =>
  `file://${path.join(__dirname, "..", "model", "tfjs_model", "model.json")}`;

async function loadModel() {
  if (model) return model;
  if (!modelLoadPromise) {
    const modelPath = getModelPath();
    console.log(`Loading model from: ${modelPath}`);
    modelLoadPromise = tf.loadLayersModel(modelPath)
      .then(m => {
        model = m;
        console.log("Model successfully loaded.");
        return model;
      })
      .catch(err => {
        console.error("Model load failed:", err);
        modelLoadPromise = null;
        throw err;
      });
  }
  return modelLoadPromise;
}

// Health check
router.get("/healthz", async (req, res) => {
  try {
    await loadModel();
    res.status(200).json({ status: "ok", model: "loaded" });
  } catch {
    res.status(500).json({ status: "error", message: "Model loading failed." });
  }
});

// Predict
router.post("/predict", upload.single("file"), async (req, res, next) => {
  let processedImage;
  try {
    const mdl = await loadModel();

    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded. Please include a file." });
    }

    // Preprocess should return a rank-4 tensor: [1, 224, 224, 3]
    processedImage = await preprocessImage(req.file.buffer);

    // Defensive shape check
    const shape = processedImage.shape;
    if (!(Array.isArray(shape) && shape.length === 4 && shape[0] === 1 && shape[11] === 224 && shape[12] === 224 && shape[13] === 3)) {
      throw new Error(`Unexpected input shape: ${JSON.stringify(shape)}; expected [1,224,224,3].`);
    }

    // Synchronous prediction inside tidy; returns plain JS array
    const probabilities = tf.tidy(() => {
      const logits = mdl.predict(processedImage);
      const probs = tf.softmax(logits);
      return probs.arraySync();
    });

    const maxProb = Math.max(...probabilities);
    const predictedIndex = probabilities.indexOf(maxProb);

    res.json({
      disease: CLASS_NAMES[predictedIndex],
      confidence: parseFloat((maxProb * 100).toFixed(2)),
    });
  } catch (error) {
    console.error("Prediction error:", error);
    next(error);
  } finally {
    // Dispose input tensor created by preprocessImage
    if (processedImage && typeof processedImage.dispose === "function") {
      processedImage.dispose();
    }
  }
});

// Central error handler
router.use((err, req, res, next) => {
  const message = err.message || "An unexpected error occurred.";
  const code = err.status || 500;
  res.status(code).json({ error: message });
});

export default router;
