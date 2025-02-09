import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Only log detailed errors in development.
const isDev = process.env.NODE_ENV !== 'production';

const WEATHER_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const OPEN_FARM_API_URL = "https://openfarm.cc/api/v1/crops/";

 
const calculateSoilData = (lat, lon) => {
  if (isDev) {
    console.info(`Calculating soil data for lat: ${lat}, lon: ${lon}`);
  }
  
  // Determine climate zone based on absolute latitude.
  let climateZone;
  if (Math.abs(lat) <= 23.5) {
    climateZone = "tropical";
  } else if (Math.abs(lat) > 60) {
    climateZone = "boreal";
  } else {
    climateZone = "temperate";
  }

  let ph, organicCarbon, nitrogen;
  // Use longitude as a minor modulator (to simulate regional variation).
  const lonMod = Math.sin(lon * Math.PI / 180);

  switch (climateZone) {
    case "tropical":
      ph = 5.5 + 0.2 * lonMod; 
      organicCarbon = 1.2 + 0.2 * Math.cos(lon * Math.PI / 180);
      nitrogen = 0.10 + 0.01 * lonMod;
      break;
    case "temperate":
      ph = 6.5 + 0.15 * lonMod;  
      organicCarbon = 2.0 + 0.3 * Math.cos(lon * Math.PI / 180);
      nitrogen = 0.15 + 0.02 * lonMod;
      break;
    case "boreal":
      ph = 5.8 + 0.1 * lonMod; 
      organicCarbon = 1.8 + 0.2 * Math.cos(lon * Math.PI / 180);
      nitrogen = 0.13 + 0.015 * lonMod;
      break;
    default:
      ph = 6.5;
      organicCarbon = 2.0;
      nitrogen = 0.15;
  }

  return {
    phh2o: { mean: parseFloat(ph.toFixed(2)) },
    ocd: { mean: parseFloat(organicCarbon.toFixed(2)) },
    nitrogen: { mean: parseFloat(nitrogen.toFixed(2)) }
  };
};

 
const getFallbackCropData = (cropName) => ({
  best_time: "Data not available",
  sowing_method: "Data not available",
  main_image_path: "/images/default.jpg"
});

// 🌦 Fetch Weather Data from OpenWeather API.
const fetchWeatherData = async (location) => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${WEATHER_API_KEY}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch weather data");
    const data = await response.json();
    return { weather: data, lat: data.coord.lat, lon: data.coord.lon };
  } catch (error) {
    if (isDev) console.error("Error fetching weather data:", error);
    return null;
  }
};

// 🌾 Fetch Crop Data from Open Farm API.
const fetchCropData = async (cropName) => {
  try {
    const response = await fetch(`${OPEN_FARM_API_URL}${cropName.toLowerCase()}`);
    if (!response.ok) throw new Error(`Failed to fetch crop data for ${cropName}`);
    const data = await response.json();
    return data?.data?.attributes || getFallbackCropData(cropName);
  } catch (error) {
    if (isDev) console.warn(`Error fetching crop data for ${cropName}. Using fallback data.`, error);
    return getFallbackCropData(cropName);
  }
};

/**
 * Crop profiles define optimal ranges for various parameters.
 * All values here are heuristic and represent approximate ideal conditions.
 *
 * Parameters:
 * - temp: [min, max] in °C
 * - humidity: [min, max] in %
 * - rainfall: [min, max] in mm (assumed per measurement period)
 * - pH: [min, max]
 * - organicCarbon: [min, max] (arbitrary units, based on our calculation)
 * - nitrogen: [min, max] (arbitrary units, based on our calculation)
 */
const cropProfiles = {
 "Tomatoes": { temp: [20, 28], humidity: [50, 70], rainfall: [10, 30], pH: [6.0, 6.8], organicCarbon: [1.5, 2.5], nitrogen: [0.12, 0.20] },
  "Corn": { temp: [18, 30], humidity: [40, 70], rainfall: [10, 40], pH: [6.0, 7.0], organicCarbon: [1.8, 2.8], nitrogen: [0.15, 0.25] },
  "Peppers": { temp: [20, 30], humidity: [50, 70], rainfall: [10, 30], pH: [6.0, 6.8], organicCarbon: [1.5, 2.5], nitrogen: [0.12, 0.20] },
  "Eggplant": { temp: [22, 30], humidity: [50, 70], rainfall: [10, 30], pH: [5.8, 6.5], organicCarbon: [1.5, 2.5], nitrogen: [0.12, 0.20] },
  "Watermelon": { temp: [24, 32], humidity: [40, 60], rainfall: [10, 30], pH: [6.0, 6.8], organicCarbon: [1.5, 2.5], nitrogen: [0.10, 0.18] },
  "Carrots": { temp: [16, 24], humidity: [40, 70], rainfall: [10, 30], pH: [6.0, 6.8], organicCarbon: [1.5, 2.5], nitrogen: [0.10, 0.18] },
  "Cabbage": { temp: [15, 20], humidity: [60, 80], rainfall: [10, 30], pH: [6.0, 7.0], organicCarbon: [1.8, 2.8], nitrogen: [0.14, 0.22] },
  "Lettuce": { temp: [10, 20], humidity: [50, 70], rainfall: [10, 30], pH: [6.0, 7.0], organicCarbon: [1.5, 2.5], nitrogen: [0.10, 0.18] },
  "Spinach": { temp: [15, 25], humidity: [60, 80], rainfall: [10, 30], pH: [6.0, 7.0], organicCarbon: [1.5, 2.5], nitrogen: [0.12, 0.20] },
  "Broccoli": { temp: [16, 24], humidity: [60, 80], rainfall: [10, 30], pH: [6.0, 7.0], organicCarbon: [1.5, 2.5], nitrogen: [0.12, 0.20] },
  "Garlic": { temp: [10, 20], humidity: [50, 70], rainfall: [10, 30], pH: [6.5, 7.5], organicCarbon: [1.5, 2.5], nitrogen: [0.10, 0.18] },
  "Peas": { temp: [10, 20], humidity: [50, 70], rainfall: [10, 30], pH: [6.0, 7.5], organicCarbon: [1.5, 2.5], nitrogen: [0.10, 0.18] },
  "Rice": { temp: [20, 30], humidity: [70, 90], rainfall: [20, 50], pH: [5.5, 6.5], organicCarbon: [1.5, 2.5], nitrogen: [0.15, 0.25] },
  "Soybeans": { temp: [20, 30], humidity: [60, 80], rainfall: [10, 30], pH: [5.5, 6.5], organicCarbon: [1.2, 2.0], nitrogen: [0.10, 0.18] },
  "Onions": { temp: [10, 20], humidity: [50, 70], rainfall: [10, 30], pH: [6.0, 7.0], organicCarbon: [1.5, 2.5], nitrogen: [0.10, 0.18] },
  "Potatoes": { temp: [15, 25], humidity: [50, 70], rainfall: [10, 30], pH: [5.5, 6.5], organicCarbon: [1.5, 2.5], nitrogen: [0.12, 0.20] },
  "Wheat": { temp: [10, 25], humidity: [30, 60], rainfall: [10, 40], pH: [6.0, 7.0], organicCarbon: [1.2, 2.5], nitrogen: [0.12, 0.25] },
  "Barley": { temp: [10, 24], humidity: [30, 60], rainfall: [10, 35], pH: [6.0, 7.5], organicCarbon: [1.2, 2.4], nitrogen: [0.12, 0.22] },
  "Lentils": { temp: [10, 25], humidity: [40, 70], rainfall: [10, 30], pH: [6.0, 7.5], organicCarbon: [1.5, 2.5], nitrogen: [0.12, 0.20] },
  "Mustard": { temp: [10, 25], humidity: [30, 60], rainfall: [10, 40], pH: [6.0, 7.0], organicCarbon: [1.2, 2.5], nitrogen: [0.12, 0.25] },
  "Groundnut": { temp: [20, 30], humidity: [40, 70], rainfall: [10, 30], pH: [5.5, 6.5], organicCarbon: [1.2, 2.0], nitrogen: [0.10, 0.18] },
  "Sugarcane": { temp: [20, 35], humidity: [60, 80], rainfall: [50, 150], pH: [5.5, 6.5], organicCarbon: [1.5, 2.5], nitrogen: [0.15, 0.25] },
  "Banana": { temp: [20, 35], humidity: [60, 90], rainfall: [50, 150], pH: [5.5, 7.0], organicCarbon: [1.5, 2.5], nitrogen: [0.15, 0.25] },
  "Mango": { temp: [20, 35], humidity: [50, 70], rainfall: [30, 100], pH: [5.5, 7.0], organicCarbon: [1.5, 2.5], nitrogen: [0.15, 0.25] },
  "Coconut": { temp: [20, 35], humidity: [60, 90], rainfall: [50, 150], pH: [5.5, 7.5], organicCarbon: [1.5, 2.5], nitrogen: [0.15, 0.25] },
  "Pineapple": { temp: [22, 32], humidity: [60, 80], rainfall: [50, 150], pH: [5.0, 6.5], organicCarbon: [1.5, 2.5], nitrogen: [0.12, 0.20] }
};

/**
 * Compute a suitability score for a crop based on current conditions.
 * For each parameter, if the actual value falls within the crop’s recommended range,
 * the crop earns 1 point (maximum score = 6).
 */
const getCropSuitabilityScore = (profile, conditions) => {
  let score = 0;
  if (conditions.temperature >= profile.temp[0] && conditions.temperature <= profile.temp[1])
    score++;
  if (conditions.humidity >= profile.humidity[0] && conditions.humidity <= profile.humidity[1])
    score++;
  if (conditions.rainfall >= profile.rainfall[0] && conditions.rainfall <= profile.rainfall[1])
    score++;
  if (conditions.pH >= profile.pH[0] && conditions.pH <= profile.pH[1])
    score++;
  if (conditions.organicCarbon >= profile.organicCarbon[0] && conditions.organicCarbon <= profile.organicCarbon[1])
    score++;
  if (conditions.nitrogen >= profile.nitrogen[0] && conditions.nitrogen <= profile.nitrogen[1])
    score++;
  return score;
};

/**
 * Determine crop recommendations by scoring each crop profile against the current conditions.
 * Returns an array of objects { crop, score } sorted by descending score.
 */
const getCropRecommendations = (conditions) => {
  const recommendations = [];
  for (const crop in cropProfiles) {
    const profile = cropProfiles[crop];
    const score = getCropSuitabilityScore(profile, conditions);
    recommendations.push({ crop, score });
  }
  // Sort by highest score first
  recommendations.sort((a, b) => b.score - a.score);
  // Filter out crops with very low scores (less than 3)
  return recommendations.filter(rec => rec.score >= 3);
};

// 🏡 Crop Recommendation Endpoint Based on Weather & Dynamically Calculated Soil
router.post('/', async (req, res) => {
  const { location } = req.body;
  if (!location) {
    return res.status(400).json({ error: "Location is required" });
  }

  try {
    // Fetch weather data.
    const weatherResponse = await fetchWeatherData(location);
    if (!weatherResponse)
      return res.status(500).json({ error: "Failed to fetch weather data" });

    const { weather, lat, lon } = weatherResponse;
    const temp = weather.main.temp;      // in °C
    const humidity = weather.main.humidity; // in %
    const rainfall = weather.rain ? weather.rain['1h'] || 0 : 0; // in mm

    // Calculate soil data dynamically using latitude and longitude.
    const soilData = calculateSoilData(lat, lon);
    const soilPH = soilData.phh2o?.mean || 6.5;
    const organicCarbon = soilData.ocd?.mean || 2.0;
    const nitrogen = soilData.nitrogen?.mean || 0.15;

    // Create a conditions object for recommendation scoring.
    const conditions = {
      temperature: temp,
      humidity,
      rainfall,
      pH: soilPH,
      organicCarbon,
      nitrogen
    };

    // Compute crop recommendations based on the current conditions.
    const recommendedCrops = getCropRecommendations(conditions);

    // Fetch detailed crop info for each recommendation.
    const detailedRecommendations = await Promise.all(
      recommendedCrops.map(async ({ crop, score }) => {
        const cropData = await fetchCropData(crop);
        return {
          crop,
          suitabilityScore: score,
          bestTime: cropData.best_time || "Unknown",
          method: cropData.sowing_method || "No specific method available",
          image: cropData.main_image_path || "/images/default.jpg"
        };
      })
    );

    // Return final recommendations.
    res.json({
      location,
      latitude: lat,
      longitude: lon,
      temperature: `${temp}°C`,
      humidity: `${humidity}%`,
      rainfall: `${rainfall}mm`,
      soil: { ph: soilPH, organicCarbon, nitrogen },
      recommendations: detailedRecommendations
    });
  } catch (error) {
    if (isDev) console.error("Error generating crop recommendations:", error);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

export default router;