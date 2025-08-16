import express from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Only log detailed errors in development
const isDev = process.env.NODE_ENV !== "production";

// Read API key once and validate
const WEATHER_API_KEY = process.env.OPENWEATHERMAP_API_KEY || "";
if (!WEATHER_API_KEY && isDev) {
  console.warn("OPENWEATHERMAP_API_KEY is not set; weather calls will fail.");
}

const OPEN_FARM_API_URL = "https://openfarm.cc/api/v1/crops/";

// Small helper to add a timeout to fetch calls
async function fetchWithTimeout(url, ms = 10_000) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(to);
  }
}

const calculateSoilData = (lat, lon) => {
  if (isDev) console.info(`Calculating soil data for lat: ${lat}, lon: ${lon}`);
  const absLat = Math.abs(lat);
  const climateZone = absLat <= 23.5 ? "tropical" : absLat > 60 ? "boreal" : "temperate";
  const lonRad = (lon * Math.PI) / 180;
  const lonMod = Math.sin(lonRad);
  const cosLon = Math.cos(lonRad);
  let ph, organicCarbon, nitrogen;
  
  switch (climateZone) {
    case "tropical":
      ph = 5.5 + 0.2 * lonMod;
      organicCarbon = 1.2 + 0.2 * cosLon;
      nitrogen = 0.10 + 0.01 * lonMod;
      break;
    case "temperate":
      ph = 6.5 + 0.15 * lonMod;
      organicCarbon = 2.0 + 0.3 * cosLon;
      nitrogen = 0.15 + 0.02 * lonMod;
      break;
    case "boreal":
      ph = 5.8 + 0.1 * lonMod;
      organicCarbon = 1.8 + 0.2 * cosLon;
      nitrogen = 0.13 + 0.015 * lonMod;
      break;
    default:
      ph = 6.5;
      organicCarbon = 2.0;
      nitrogen = 0.15;
  }
  
  return {
    phh2o: { mean: Number(ph.toFixed(2)) },
    ocd: { mean: Number(organicCarbon.toFixed(2)) },
    nitrogen: { mean: Number(nitrogen.toFixed(2)) },
  };
};

const getFallbackCropData = (cropName) => ({
  best_time: "Data not available",
  sowing_method: "Data not available",
  main_image_path: "/images/default.jpg",
});

// Weather fetch
const fetchWeatherData = async (location) => {
  try {
    const q = encodeURIComponent(location);
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${q}&appid=${WEATHER_API_KEY}&units=metric`;
    const response = await fetchWithTimeout(url, 10_000);
    if (!response.ok) throw new Error(`Weather HTTP ${response.status}`);
    const data = await response.json();
    return { weather: data, lat: data.coord.lat, lon: data.coord.lon };
  } catch (error) {
    if (isDev) console.error("Error fetching weather data:", error);
    return null;
  }
};

// OpenFarm fetch
const fetchCropData = async (cropName) => {
  try {
    const slug = cropName.toLowerCase().replace(/\s+/g, "-");
    const response = await fetchWithTimeout(`${OPEN_FARM_API_URL}${slug}`, 8_000);
    if (!response.ok) throw new Error(`OpenFarm HTTP ${response.status}`);
    const data = await response.json();
    return data?.data?.attributes || getFallbackCropData(cropName);
  } catch (error) {
    if (isDev) console.warn(`Error fetching crop data for ${cropName}. Using fallback data.`, error);
    return getFallbackCropData(cropName);
  }
};

/**
 * Crop profiles (heuristics)
 * Based on temperature, latitude, longitude, and place
 */
const cropProfiles = {
  Tomatoes: { temp: [20, 28], humidity: [50, 70], pH: [6.0, 6.8], organicCarbon: [1.5, 2.5], nitrogen: [0.12, 0.20] },
  Corn: { temp: [18, 30], humidity: [40, 80], pH: [6.0, 7.0], organicCarbon: [1.8, 2.8], nitrogen: [0.15, 0.25] },
  Peppers: { temp: [20, 30], humidity: [50, 80], pH: [6.0, 6.8], organicCarbon: [1.5, 2.5], nitrogen: [0.12, 0.20] },
  Eggplant: { temp: [22, 30], humidity: [50, 80], pH: [5.8, 6.5], organicCarbon: [1.5, 2.5], nitrogen: [0.12, 0.20] },
  Watermelon: { temp: [24, 32], humidity: [40, 80], pH: [6.0, 6.8], organicCarbon: [1.5, 2.5], nitrogen: [0.10, 0.18] },
  Carrots: { temp: [16, 24], humidity: [40, 80], pH: [6.0, 6.8], organicCarbon: [1.5, 2.5], nitrogen: [0.10, 0.18] },
  Cabbage: { temp: [15, 20], humidity: [60, 90], pH: [6.0, 7.0], organicCarbon: [1.8, 2.8], nitrogen: [0.14, 0.22] },
  Lettuce: { temp: [10, 20], humidity: [50, 80], pH: [6.0, 7.0], organicCarbon: [1.5, 2.5], nitrogen: [0.10, 0.18] },
  Spinach: { temp: [15, 25], humidity: [60, 90], pH: [6.0, 7.0], organicCarbon: [1.5, 2.5], nitrogen: [0.12, 0.20] },
  Broccoli: { temp: [16, 24], humidity: [60, 90], pH: [6.0, 7.0], organicCarbon: [1.5, 2.5], nitrogen: [0.12, 0.20] },
  Garlic: { temp: [10, 20], humidity: [50, 80], pH: [6.5, 7.5], organicCarbon: [1.5, 2.5], nitrogen: [0.10, 0.18] },
  Peas: { temp: [10, 20], humidity: [50, 80], pH: [6.0, 7.5], organicCarbon: [1.5, 2.5], nitrogen: [0.10, 0.18] },
  Rice: { temp: [20, 30], humidity: [70, 95], pH: [5.5, 6.5], organicCarbon: [1.5, 2.5], nitrogen: [0.15, 0.25] },
  Soybeans: { temp: [20, 30], humidity: [60, 90], pH: [5.5, 6.5], organicCarbon: [1.2, 2.0], nitrogen: [0.10, 0.18] },
  Onions: { temp: [10, 20], humidity: [50, 80], pH: [6.0, 7.0], organicCarbon: [1.5, 2.5], nitrogen: [0.10, 0.18] },
  Potatoes: { temp: [15, 25], humidity: [50, 80], pH: [5.5, 6.5], organicCarbon: [1.5, 2.5], nitrogen: [0.12, 0.20] },
  Wheat: { temp: [10, 25], humidity: [30, 80], pH: [6.0, 7.0], organicCarbon: [1.2, 2.5], nitrogen: [0.12, 0.25] },
  Barley: { temp: [10, 24], humidity: [30, 80], pH: [6.0, 7.5], organicCarbon: [1.2, 2.4], nitrogen: [0.12, 0.22] },
  Lentils: { temp: [10, 25], humidity: [40, 80], pH: [6.0, 7.5], organicCarbon: [1.5, 2.5], nitrogen: [0.12, 0.20] },
  Mustard: { temp: [10, 25], humidity: [30, 80], pH: [6.0, 7.0], organicCarbon: [1.2, 2.5], nitrogen: [0.12, 0.25] },
  Groundnut: { temp: [20, 30], humidity: [40, 80], pH: [5.5, 6.5], organicCarbon: [1.2, 2.0], nitrogen: [0.10, 0.18] },
  Sugarcane: { temp: [20, 35], humidity: [60, 90], pH: [5.5, 6.5], organicCarbon: [1.5, 2.5], nitrogen: [0.15, 0.25] },
  Banana: { temp: [20, 35], humidity: [60, 95], pH: [5.5, 7.0], organicCarbon: [1.5, 2.5], nitrogen: [0.15, 0.25] },
  Mango: { temp: [20, 35], humidity: [50, 80], pH: [5.5, 7.0], organicCarbon: [1.5, 2.5], nitrogen: [0.15, 0.25] },
  Coconut: { temp: [20, 35], humidity: [60, 95], pH: [5.5, 7.5], organicCarbon: [1.5, 2.5], nitrogen: [0.15, 0.25] },
  Pineapple: { temp: [22, 32], humidity: [60, 90], pH: [5.0, 6.5], organicCarbon: [1.5, 2.5], nitrogen: [0.12, 0.20] },
};

// FIXED: Removed rainfall criteria as requested
const getCropSuitabilityScore = (profile, conditions) => {
  let score = 0;

  // Temperature check
  if (conditions.temperature >= profile.temp[0] && conditions.temperature <= profile.temp[1]) {
    score++;
  }

  // Humidity check
  if (conditions.humidity >= profile.humidity[0] && conditions.humidity <= profile.humidity[1]) {
    score++;
  }

  // pH check
  if (conditions.pH >= profile.pH[0] && conditions.pH <= profile.pH[1]) {
    score++;
  }

  // Organic Carbon check
  if (conditions.organicCarbon >= profile.organicCarbon[0] && conditions.organicCarbon <= profile.organicCarbon[1]) {
    score++;
  }

  // Nitrogen check
  if (conditions.nitrogen >= profile.nitrogen[0] && conditions.nitrogen <= profile.nitrogen[1]) {
    score++;
  }

  return score; // Max = 5
};


// FIXED: Adjusted for new scoring system (max 5 instead of 6)
const getCropRecommendations = (conditions) => {
  const recommendations = Object.entries(cropProfiles).map(([crop, profile]) => ({
    crop,
    score: getCropSuitabilityScore(profile, conditions),
  }));
  
  // Sort by score (highest first)
  recommendations.sort((a, b) => b.score - a.score);
  
  // FIXED: Adjusted threshold for 5-point scale
  const filtered = recommendations.filter((rec) => rec.score >= 2);
  
  // If still no crops meet criteria, return top 8 anyway
  return filtered.length > 0 ? filtered : recommendations.slice(0, 8);
};

// Main endpoint
router.post("/", async (req, res) => {
  const location = (req.body?.location ?? "").toString().trim();
  if (!location) return res.status(400).json({ error: "Location is required" });
  
  try {
    const weatherResponse = await fetchWeatherData(location);
    if (!weatherResponse) return res.status(502).json({ error: "Failed to fetch weather data" });
    
    const { weather, lat, lon } = weatherResponse;
    const temp = weather?.main?.temp ?? null;
    const humidity = weather?.main?.humidity ?? null;
    
    if (temp == null || humidity == null) {
      return res.status(500).json({ error: "Incomplete weather data" });
    }
    
    const soilData = calculateSoilData(lat, lon);
    const soilPH = soilData.phh2o?.mean ?? 6.5;
    const organicCarbon = soilData.ocd?.mean ?? 2.0;
    const nitrogen = soilData.nitrogen?.mean ?? 0.15;
    
    const conditions = {
      temperature: temp,
      humidity,
      pH: soilPH,
      organicCarbon,
      nitrogen,
    };
    
    // Debug logging in development
    if (isDev) {
      console.log("Conditions:", conditions);
    }
    
    const recommendedCrops = getCropRecommendations(conditions);
    
    if (isDev) {
      console.log("Recommended crops count:", recommendedCrops.length);
      console.log("Top 3 crops:", recommendedCrops.slice(0, 3));
    }
    
    const detailedRecommendations = await Promise.all(
      recommendedCrops.map(async ({ crop, score }) => {
        const cropData = await fetchCropData(crop);
        return {
          crop,
          suitabilityScore: score,
          bestTime: cropData.best_time || "Unknown",
          method: cropData.sowing_method || "No specific method available",
          image: cropData.main_image_path || "/images/default.jpg",
        };
      })
    );
    
    res.json({
      location,
      latitude: lat,
      longitude: lon,
      temperature: `${temp}°C`,
      humidity: `${humidity}%`,
      soil: { ph: soilPH, organicCarbon, nitrogen },
      recommendations: detailedRecommendations,
    });
    
  } catch (error) {
    if (isDev) console.error("Error generating crop recommendations:", error);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

export default router;
