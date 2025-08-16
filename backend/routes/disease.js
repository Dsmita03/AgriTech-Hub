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

// // Configure TensorFlow.js for better performance
// tf.ENV.set('WEBGL_PACK', false);
// tf.ENV.set('WEBGL_FORCE_F16_TEXTURES', false);

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
    
    // Verify model file exists
    try {
      const fs = await import('fs/promises');
      const modelFilePath = path.join(__dirname, "..", "model", "tfjs_model", "model.json");
      await fs.access(modelFilePath);
      console.log("✓ Model file found at:", modelFilePath);
    } catch (fileError) {
      console.error("❌ Model file not found:", fileError);
      throw new Error("Model file not accessible");
    }
    
    modelLoadPromise = tf.loadLayersModel(modelPath)
      .then(m => {
        model = m;
        console.log("✓ Model successfully loaded");
        console.log("✓ Model expects input shape:", m.inputs[0].shape);
        return model;
      })
      .catch(err => {
        console.error("❌ Model load failed:", err);
        modelLoadPromise = null;
        throw err;
      });
  }
  
  return modelLoadPromise;
}

// Memory monitoring
setInterval(() => {
  const memory = tf.memory();
  if (memory.numTensors > 10) {
    console.warn("⚠️ Memory check - Tensors:", memory.numTensors, "Memory:", memory.numBytes);
  }
}, 30000);

// Health check
router.get("/healthz", async (req, res) => {
  try {
    await loadModel();
    const memory = tf.memory();
    res.status(200).json({ 
      status: "ok", 
      model: "loaded",
      memory: {
        tensors: memory.numTensors,
        bytes: memory.numBytes
      }
    });
  } catch (error) {
    console.error("❌ Health check failed:", error);
    res.status(500).json({ status: "error", message: "Model loading failed." });
  }
});

// Predict endpoint
router.post("/predict", upload.single("file"), async (req, res, next) => {
  let processedImage;
  
  try {
    console.log("=== Starting prediction ===");
    
    const mdl = await loadModel();
    console.log("✓ Model loaded");
    
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded. Please include a file." });
    }
    
    console.log("✓ File received:", {
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.buffer.length
    });

    // Preprocess image with error handling
    try {
      processedImage = await preprocessImage(req.file.buffer);
      console.log("✓ Image preprocessed, shape:", processedImage.shape);
    } catch (preprocessError) {
      console.error("❌ Preprocessing failed:", preprocessError);
      throw new Error(`Image preprocessing failed: ${preprocessError.message}`);
    }
    
    // Shape validation with proper array comparison
    const shape = processedImage.shape;
    const expectedShape = [1, 224, 224, 3];
    const isValidShape = shape.length === expectedShape.length && 
                         shape.every((dim, index) => dim === expectedShape[index]);
    
    if (!isValidShape) {
      throw new Error(`Invalid tensor shape: got ${JSON.stringify(shape)}, expected ${JSON.stringify(expectedShape)}`);
    }

    // Model prediction with error handling
    let probabilities;
    try {
      probabilities = tf.tidy(() => {
        const logits = mdl.predict(processedImage);
        const probs = tf.softmax(logits);
        return probs.arraySync()[0]; // Get first batch element
      });
      console.log("✓ Prediction completed");
    } catch (predictionError) {
      console.error("❌ Prediction failed:", predictionError);
      throw new Error(`Model prediction failed: ${predictionError.message}`);
    }

    const maxProb = Math.max(...probabilities);
    const predictedIndex = probabilities.indexOf(maxProb);
    
    // Validate prediction index
    if (predictedIndex < 0 || predictedIndex >= CLASS_NAMES.length) {
      throw new Error(`Invalid prediction index: ${predictedIndex}`);
    }
    
    const result = {
      disease: CLASS_NAMES[predictedIndex],
      confidence: parseFloat((maxProb * 100).toFixed(2)),
    };
    
    console.log("✓ Result:", result);
    res.json(result);

  } catch (error) {
    console.error("❌ Prediction error:", error.message);
    console.error("Stack:", error.stack);
    next(error);
  } finally {
    // Clean up processed image tensor
    if (processedImage && typeof processedImage.dispose === "function") {
      processedImage.dispose();
      console.log("✓ Tensor disposed");
    }
    console.log("=== Prediction complete ===");
  }
});

// Enhanced error handler
router.use((err, req, res, next) => {
  console.error("=== ERROR DETAILS ===");
  console.error("Error message:", err.message);
  console.error("Error stack:", err.stack);
  console.error("Request path:", req.path);
  console.error("Request method:", req.method);
  console.error("File info:", req.file);
  console.error("=====================");
  
  const message = err.message || "An unexpected error occurred.";
  const code = err.status || 500;
  res.status(code).json({ error: message });
});

export default router;
