import express from "express";
import admin from "firebase-admin";
import { db } from "../config/firebase.js"; // should export admin.firestore()

const router = express.Router();

// router.use(express.json());

router.get("/", (req, res) => {
  res.send("Weather API is working!");
});

const DOC_REF = db.collection("users").doc("lastCity");
const MAX_CITY_LEN = 120;

const normalizeCity = (v) => (typeof v === "string" ? v.trim() : "");
const isValidCity = (v) => v && v.length <= MAX_CITY_LEN;

// Save last city
async function saveLastCity(city) {
  await DOC_REF.set(
    {
      city,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  console.log(`Last searched city saved: ${city}`);
}

// Get last city
async function getLastCity(req, res) {
  try {
    const snap = await DOC_REF.get();
    if (!snap.exists) {
      return res.status(404).json({ message: "No last searched city found" });
    }
    const data = snap.data() || {};
    return res.json({
      lastCity: data.city ?? null,
      updatedAt: data.updatedAt?.toDate?.() ?? null,
    });
  } catch (error) {
    console.error("Error fetching last city:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

router.get("/last-city", getLastCity);

router.post("/save-city", async (req, res) => {
  try {
    const city = normalizeCity(req.body?.city);
    if (!isValidCity(city)) {
      return res.status(400).json({ error: `City name is required and must be <= ${MAX_CITY_LEN} chars` });
    }
    await saveLastCity(city);
    return res.json({ message: "City saved successfully" });
  } catch (error) {
    console.error("Error saving city:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
