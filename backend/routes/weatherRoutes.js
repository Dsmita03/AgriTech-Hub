import { db } from "../config/firebase.js";
import { doc, setDoc, getDoc } from "firebase/firestore";  
import express from "express";

const router = express.Router();

// ✅ API Route - Check if Weather API is Working
router.get("/", (req, res) => {
  res.send("Weather API is working!");
});

// ✅ Function to Save Last Searched City in Firebase
const saveLastCity = async (cityName) => {
  try {
    await setDoc(doc(db, "users", "lastCity"), { city: cityName });
    console.log(`Last searched city saved: ${cityName}`);
  } catch (error) {
    console.error("Error saving city:", error);
  }
};

// ✅ Function to Retrieve Last Searched City from Firebase
const getLastCity = async (req, res) => {
  try {
    const docSnap = await getDoc(doc(db, "users", "lastCity"));
    if (docSnap.exists()) {
      res.json({ lastCity: docSnap.data().city });
    } else {
      res.status(404).json({ message: "No last searched city found" });
    }
  } catch (error) {
    console.error("Error fetching last city:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Route to Get Last Searched City
router.get("/last-city", getLastCity);

// ✅ Route to Save Last Searched City
router.post("/save-city", async (req, res) => {
  const { city } = req.body;
  if (!city) {
    return res.status(400).json({ error: "City name is required" });
  }
  
  await saveLastCity(city);
  res.json({ message: "City saved successfully" });
});

// ✅ Export the Router
export default router;
