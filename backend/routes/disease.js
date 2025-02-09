import express from "express";
import multer from "multer";
import * as tf from "@tensorflow/tfjs-node";
import path from "path";
import { fileURLToPath } from "url";
import { preprocessImage } from "../utils/preprocess.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Multer setup for handling image uploads (stores files in memory)
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Declare `model` and loading state globally
let model = null;
let isModelLoaded = false;

// ✅ CLASS_NAMES for plant diseases
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

// ✅ Load the Model (Ensures Model is Ready Before Handling Requests)
const loadModel = async () => {
  try {
    const modelPath = `file://${path.join(__dirname, "..", "model", "tfjs_model", "model.json")}`;
    console.log(`🔍 Loading model from: ${modelPath}`);

    model = await tf.loadLayersModel(modelPath);
    isModelLoaded = true; // ✅ Mark model as loaded

    console.log("✅ Model successfully loaded and initialized!");
  } catch (error) {
    console.error("❌ Error loading model:", error);
  }
};

// ✅ Call `loadModel()` on startup
loadModel();

// ✅ Prediction Route (Supports Multiple Requests)
router.post("/predict", upload.single("file"), async (req, res) => {
  if (!isModelLoaded) {
    return res.status(503).json({ error: "❌ Model is still loading. Please try again later." });
  }

  if (!req.file) {
    return res.status(400).json({ error: "❌ No image uploaded. Please upload a valid image file." });
  }

  console.log("✅ Image received for prediction.");

  let processedImage = null;

  try {
    // ✅ Preprocess Image
    processedImage = await preprocessImage(req.file.buffer);
    processedImage = processedImage.reshape([1, 224, 224, 3]); // Ensure correct input shape
    console.log("✅ Image preprocessed:", processedImage.shape);

    // ✅ Make Prediction using `tf.tidy()` (Ensures Cleanup)
    const predictionArray = tf.tidy(() => {
      const predictions = model.predict(processedImage).softmax(); // ✅ Apply softmax
      return predictions.arraySync(); // ✅ Convert tensor to array BEFORE disposal
    });

    // ✅ Get the Most Probable Class
    const predictedClassIndex = predictionArray[0].indexOf(Math.max(...predictionArray[0]));
    const confidence = (Math.max(...predictionArray[0]) * 100).toFixed(2);

    console.log(`🧪 Predicted Disease: ${CLASS_NAMES[predictedClassIndex]} | Confidence: ${confidence}`);

    return res.json({
      disease: CLASS_NAMES[predictedClassIndex],
      confidence: `${confidence}`
    });

  } catch (error) {
    console.error("❌ Error during prediction:", error);
    return res.status(500).json({ error: "❌ Prediction failed. Please try again." });

  } finally {
    // ✅ Dispose of processedImage ONLY if it's defined
    if (processedImage) {
      processedImage.dispose();
    }
  }
});

export default router;
