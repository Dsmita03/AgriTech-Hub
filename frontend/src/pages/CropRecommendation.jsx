import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { FaTemperatureHigh, FaCloudRain, FaSun, FaLeaf } from "react-icons/fa";

const CropRecommendation = () => {
  const [location, setLocation] = useState("");
  const [data, setData] = useState(null); // API response
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cacheRef = useRef({}); // in-memory cache by normalized location

  const safeVal = (v) => (v !== undefined && v !== null ? v : "N/A");

  const onImageError = (e) => {
    e.currentTarget.src = "/images/default-crop.png"; // ensure this exists
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = location.trim().toLowerCase();
    if (!trimmed) {
      setError("⚠️ Please enter a valid location.");
      return;
    }

    // Use cached result
    if (cacheRef.current[trimmed]) {
      setError("");
      setData(cacheRef.current[trimmed]);
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort("timeout"), 12_000);
      const response = await fetch(
        "https://agritech-hub-b8if.onrender.com/api/crop-recommendation",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ location: trimmed }),
          signal: controller.signal,
        }
      );
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
      if (err?.name === "AbortError") {
        setError("⏱️ Request timed out. Please try again later.");
      } else {
        setError("❌ Something went wrong while fetching the data.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isEmptyState = !loading && !data && !error;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50/60">
      {/* Hero Header */}
      <section className="container mx-auto px-4 pt-10 pb-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-700 tracking-tight">
          🌱 Smart Crop Recommendation
        </h1>
        <p className="mt-3 text-slate-700 max-w-2xl mx-auto">
          Get personalized crop suggestions based on live weather and heuristic soil data for your location.
        </p>

        {/* Creative empty-state only: soft illustration panel */}
        {isEmptyState && (
          <div className="mt-6 mx-auto max-w-3xl">
            <div className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100 p-6">
              {/* Decorative “fields” stripes */}
              <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:repeating-linear-gradient(45deg,theme(colors.emerald.600)/10_0_10px,transparent_10px_20px)]" />
              <div className="relative z-10">
                <h3 className="text-xl font-semibold text-emerald-800">
                  Start by entering a location
                </h3>
                <p className="mt-1 text-slate-700">
                  Example: Delhi, Bengaluru, Mumbai, Chennai.
                </p>
                <p className="mt-2 text-sm text-emerald-900/80">
                  Tip: Accurate city names improve weather matching and better crop suggestions.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Input Panel */}
      <section className="container mx-auto px-4 mb-8">
        <Card className="max-w-3xl mx-auto rounded-3xl border border-emerald-200 bg-white/95 shadow-lg">
          <CardContent className="p-5 md:p-7">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 md:gap-4">
              <Input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="🌍 Enter your location (e.g., Delhi, Bengaluru)"
                required
                aria-label="Enter location for crop recommendation"
                className="flex-1 py-3 md:py-4 bg-emerald-50 border border-emerald-300 focus:ring-emerald-500 rounded-xl"
              />
              <Button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 md:px-6 py-3 md:py-4 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "🌾 Get Recommendation"}
              </Button>
            </form>

            {/* Tiny tip only in empty state */}
            {isEmptyState && (
              <div className="mt-3 text-center text-sm text-slate-600">
                Or try nearby cities if spelling variations occur.
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-center">
                {error}
              </div>
            )}

            {/* Loading Skeleton */}
            {loading && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-emerald-100" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Results */}
      {data && !loading && (
        <section className="container mx-auto px-4 pb-12">
          {/* Overview */}
          <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
            <Card className="rounded-2xl border border-emerald-200 bg-white/95 shadow">
              <CardContent className="p-5">
                <h2 className="text-lg font-semibold text-emerald-800">Overview</h2>
                <div className="mt-3 space-y-1 text-slate-700">
                  <p>
                    <span className="font-medium text-slate-900">Location:</span> {data.location || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Coordinates:</span>{" "}
                    {safeVal(data.latitude)}°, {safeVal(data.longitude)}°
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-emerald-200 bg-white/95 shadow md:col-span-2">
              <CardContent className="p-5">
                <h2 className="text-lg font-semibold text-emerald-800">Weather & Soil Snapshot</h2>
                <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { icon: <FaTemperatureHigh className="text-emerald-600" />, label: "Temperature", value: safeVal(data.temperature) },
                    { icon: <FaLeaf className="text-emerald-600" />, label: "Humidity", value: safeVal(data.humidity) },
                    { icon: <FaCloudRain className="text-blue-500" />, label: "Rainfall", value: safeVal(data.rainfall) },
                    { icon: <FaLeaf className="text-emerald-700" />, label: "pH", value: safeVal(data.soil?.ph) },
                    { icon: <FaLeaf className="text-emerald-700" />, label: "Organic C", value: safeVal(data.soil?.organicCarbon) },
                    { icon: <FaLeaf className="text-emerald-700" />, label: "Nitrogen", value: safeVal(data.soil?.nitrogen) },
                    { icon: <FaSun className="text-amber-500" />, label: "Latitude", value: `${safeVal(data.latitude)}°` },
                    { icon: <FaSun className="text-amber-500" />, label: "Longitude", value: `${safeVal(data.longitude)}°` },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-white p-3">
                      {item.icon}
                      <div className="text-sm">
                        <div className="font-semibold text-slate-900">{item.label}</div>
                        <div className="text-slate-700">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Crops */}
          <div className="max-w-6xl mx-auto mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-emerald-700">🌾 Recommended Crops</h2>
            </div>

            {data.recommendations?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {data.recommendations.map((crop, idx) => {
                  const src = `/crops/${crop.crop}.png`;
                  return (
                    <Card
                      key={`${crop.crop}-${idx}`}
                      className="rounded-2xl border border-emerald-200 bg-white/95 shadow hover:shadow-md transition"
                    >
                      <CardContent className="p-5">
                        <div className="flex flex-col items-center text-center">
                          <img
                            src={src}
                            alt={crop.crop}
                            onError={onImageError}
                            className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border border-emerald-200 shadow"
                          />
                          <h3 className="mt-3 text-lg font-bold text-emerald-800">{crop.crop}</h3>
                          {typeof crop.suitabilityScore === "number" && (
                            <span className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Suitability: {crop.suitabilityScore}/6
                            </span>
                          )}
                          <p className="mt-3 text-sm text-slate-600 line-clamp-3">
                            <strong>📖 Method:</strong> {crop.method || "N/A"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-600">
                No crop recommendations available.
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default CropRecommendation;
