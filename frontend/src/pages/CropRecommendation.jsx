import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { FaTemperatureHigh, FaCloudRain, FaSun, FaLeaf } from "react-icons/fa";
import FarmingImage from "@/assets/Forum.png";

const CropRecommendation = () => {
  const [location, setLocation] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cacheRef = useRef({}); // Store responses by location

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = location.trim().toLowerCase();

    if (!trimmed) return setError("⚠️ Please enter a valid location.");

    // ⚡ Use cached data if available
    if (cacheRef.current[trimmed]) {
      setData(cacheRef.current[trimmed]);
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      // ⏳ Abort if response takes too long
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch("https://agritech-hub-b8if.onrender.com/api/crop-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: trimmed }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const result = await response.json();

      if (response.ok) {
        setData(result);
        cacheRef.current[trimmed] = result;
      } else {
        setError(result.error || "❌ Failed to fetch recommendations.");
      }
    } catch (err) {
      console.error("API error:", err);
      setError("⏱️ Request timed out or server is unreachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex lg:flex-row flex-col items-center justify-center p-0">
      {/* Left: Image Section */}
      <div
        className="hidden lg:flex w-1/2 h-screen bg-cover bg-center fixed left-0 top-0"
        style={{
          backgroundImage: `url(${FarmingImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>

      {/* Right: Input & Data */}
      <div className="lg:w-1/2 w-full flex flex-col justify-center items-center min-h-screen ml-auto p-10">
        <h1 className="text-5xl font-extrabold text-green-700 text-center mb-6 animate-fade-in">
          🌱 Smart Crop Recommendation
        </h1>

        <Card className="w-full max-w-2xl shadow-xl border border-green-400 bg-white rounded-3xl transition-all duration-500 p-8">
          <CardContent className="p-8 space-y-8">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="text"
                placeholder="🌍 Enter your location (e.g., Delhi, Bengaluru)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="border border-green-500 focus:ring-green-500 py-4 px-5 w-full text-lg rounded-2xl shadow-md bg-green-50"
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 text-white transition-all duration-300 py-3 text-lg rounded-xl shadow-lg flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "🌾 Get Crop Recommendation"}
              </Button>
            </form>

            {/* Error */}
            {error && (
              <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-2xl shadow-md text-center">
                <p>{error}</p>
              </div>
            )}

            {/* Skeleton Loader */}
            {loading && (
              <div className="mt-10 grid grid-cols-2 gap-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-green-100 h-20 rounded-2xl shadow-inner" />
                ))}
              </div>
            )}

            {/* Data Rendered */}
            {data && !loading && (
              <div className="mt-10 p-6 bg-green-50 rounded-2xl shadow-md">
                <h2 className="text-3xl font-extrabold text-green-700 text-center mb-6">🌦️ Weather & Soil Data</h2>

                {/* Weather + Soil Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
                  {[
                    { icon: <FaTemperatureHigh className="text-green-500" />, label: "Temperature", value: data.temperature },
                    { icon: <FaSun className="text-yellow-500" />, label: "Latitude", value: `${data.latitude}°` },
                    { icon: <FaSun className="text-yellow-500" />, label: "Longitude", value: `${data.longitude}°` },
                    { icon: <FaCloudRain className="text-blue-500" />, label: "Rainfall", value: data.rainfall },
                    { icon: <FaLeaf className="text-green-600" />, label: "Humidity", value: data.humidity },
                    { icon: <FaLeaf className="text-green-600" />, label: "pH Level", value: data.soil?.ph },
                    { icon: <FaLeaf className="text-green-600" />, label: "Organic Carbon", value: data.soil?.organicCarbon },
                    { icon: <FaLeaf className="text-green-600" />, label: "Nitrogen", value: data.soil?.nitrogen },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 bg-green-100 p-4 rounded-xl shadow-sm border border-green-300">
                      {item.icon}
                      <p className="text-lg font-medium">
                        <strong>{item.label}:</strong>{" "}
                        {item.value !== undefined && item.value !== null ? item.value : "N/A"}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Crop Recommendations */}
                <h3 className="text-3xl font-bold text-green-700 mt-10 text-center">🌾 Recommended Crops</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {data.recommendations?.length > 0 ? (
                    data.recommendations.map((crop, index) => (
                      console.log(crop),
                      <div
                        key={index}
                        className="bg-white rounded-xl shadow-lg p-5 flex flex-col items-center text-center hover:shadow-2xl transition-transform duration-300 hover:scale-105"
                      >
                        <img
                          src={`/crops/${crop.crop}.png`}
                          alt={crop.crop}
                          className="w-24 h-24 object-cover rounded-full shadow-md border border-green-300"
                        />
                        <h4 className="font-bold text-green-800 mt-3 text-lg">{crop.crop}</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>📖 Method: </strong>{crop.method}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 col-span-full text-center">No crop recommendations available.</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CropRecommendation;
