import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  WiDaySunny,
  WiCloud,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiFog,
  WiBarometer,
  WiHumidity,
  WiThermometer,
} from "react-icons/wi";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import PropTypes from "prop-types";
import "leaflet/dist/leaflet.css";

// Fix default Leaflet marker icons when bundling
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Smoothly recenter the map when the coordinates change
const RecenterMap = ({ center, zoom = 11 }) => {
  const map = useMap();
  useEffect(() => {
    if (
      center &&
      Array.isArray(center) &&
      center.length === 2 &&
      center.every((n) => Number.isFinite(n))
    ) {
      map.flyTo(center, zoom, { duration: 1.2, easeLinearity: 0.25 });
    }
  }, [center, zoom, map]);
  return null;
};
RecenterMap.propTypes = {
  center: PropTypes.arrayOf(PropTypes.number).isRequired,
  zoom: PropTypes.number,
};

const Weather = () => {
  const { t, i18n } = useTranslation();
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [coords, setCoords] = useState(null); // [lat, lon]
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const apiKey = import.meta.env.VITE_WEATHER_API_KEY; // ensure set in .env

  const fetchWeather = async () => {
    const q = city.trim();
    if (!q) return;
    if (!apiKey) {
      setErr(t("API key missing."));
      return;
    }
    setLoading(true);
    setErr("");
    setWeather(null);

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      q
    )}&appid=${apiKey}&units=metric`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.message || t("Failed to fetch weather"));
        setWeather(null);
        setCoords(null);
      } else {
        setWeather(data);
        // Ensure numeric coords
        setCoords([Number(data.coord.lat), Number(data.coord.lon)]);
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
      setErr(t("Network error. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (main) => {
    switch (main) {
      case "Clear":
        return <WiDaySunny size={84} className="text-amber-400" />;
      case "Clouds":
        return <WiCloud size={84} className="text-slate-400" />;
      case "Rain":
        return <WiRain size={84} className="text-sky-500" />;
      case "Snow":
        return <WiSnow size={84} className="text-sky-300" />;
      case "Thunderstorm":
        return <WiThunderstorm size={84} className="text-purple-500" />;
      case "Fog":
      case "Mist":
      case "Haze":
        return <WiFog size={84} className="text-slate-500" />;
      default:
        return <WiCloud size={84} className="text-slate-400" />;
    }
  };

  const hasData = weather && weather.main && Array.isArray(weather.weather);

  // Default center (India centroid; adjust to your region)
  const initialCenter = useMemo(() => [20.5937, 78.9629], []);
  const mapCenter = coords || initialCenter;
  const mapKeyRef = useRef(0);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-b from-emerald-50 via-white to-emerald-50/60">
      {/* Left: Weather Panel */}
      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg rounded-2xl border border-emerald-200 bg-white/95 shadow-lg p-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-emerald-700">
              🌿 {t("weather")}
            </h2>
            <p className="mt-1 text-slate-600">
              {t("Check current conditions for your city")}
            </p>
          </div>

          {/* Language + Input */}
          <div className="mt-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="lang" className="text-sm font-medium text-slate-700">
                {t("Language")}
              </label>
              <select
                id="lang"
                className="ml-auto rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                defaultValue={i18n.language || "en"}
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="bn">বাংলা</option>
              </select>
            </div>

            <div className="flex items-stretch gap-2">
              <input
                type="text"
                placeholder={t("Enter Your City")}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="flex-1 rounded-md border border-emerald-300 bg-white px-3 py-2 text-slate-900 placeholder-emerald-700/70 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label={t("Enter Your City")}
              />
              <button
                onClick={fetchWeather}
                disabled={loading}
                className={`rounded-md bg-emerald-600 px-4 py-2 font-medium text-white shadow transition ${
                  loading ? "opacity-60 cursor-not-allowed" : "hover:bg-emerald-700"
                }`}
              >
                {loading ? t("Loading...") : t("getWeather")}
              </button>
            </div>

            {/* Subtle helper text */}
            {!hasData && !err && (
              <p className="text-xs text-slate-500">
                {t("Try city names like Delhi, Mumbai, Bengaluru.")}
              </p>
            )}
          </div>

          {/* Error */}
          {err && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-center">
              {err}
            </div>
          )}

          {/* Weather Card */}
          {hasData && (
            <div className="mt-6 text-center">
              <h3 className="text-2xl font-semibold text-slate-900">
                {weather.name}
              </h3>
              <div className="mt-3 flex flex-col items-center gap-2">
                <div className="flex items-center justify-center gap-3">
                  {getWeatherIcon(weather.weather[0].main)}
                  <div className="text-left">
                    <p className="text-lg capitalize text-slate-700">
                      {weather.weather.description}
                    </p>
                    <p className="text-5xl font-bold text-slate-900">
                      {Math.round(weather.main.temp)}°C
                    </p>
                  </div>
                </div>
              </div>

              {/* Info chips */}
              <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex flex-col items-center">
                  <WiThermometer size={36} className="text-emerald-700" />
                  <p className="mt-1 font-medium text-slate-800">
                    {t("Feels Like")}
                  </p>
                  <p className="text-slate-700">
                    {Math.round(weather.main.feels_like)}°C
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex flex-col items-center">
                  <WiHumidity size={36} className="text-emerald-700" />
                  <p className="mt-1 font-medium text-slate-800">{t("Humidity")}</p>
                  <p className="text-slate-700">{weather.main.humidity}%</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex flex-col items-center">
                  <WiBarometer size={36} className="text-emerald-700" />
                  <p className="mt-1 font-medium text-slate-800">{t("Pressure")}</p>
                  <p className="text-slate-700">{weather.main.pressure} hPa</p>
                </div>
              </div>
            </div>
          )}

          {/* City not found (404) */}
          {!hasData && weather && weather.message && !err && (
            <p className="mt-4 text-center text-rose-600">
              {t("City Not Found!")}
            </p>
          )}
        </div>
      </div>

      {/* Right: Interactive Leaflet Map with brand overlay */}
      <div className="hidden lg:block relative h-screen">
        {/* Brand overlay layers */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/10 to-emerald-900/20 pointer-events-none" />
        <div className="pointer-events-none absolute inset-0 opacity-15 [background-image:repeating-linear-gradient(45deg,theme(colors.emerald.500)/10_0_14px,transparent_14px_28px)]" />

        <MapContainer
          key={mapKeyRef.current}
          center={mapCenter}
          zoom={coords ? 11 : 4}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap &amp; Carto"
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          <RecenterMap center={mapCenter} zoom={coords ? 11 : 4} />

          {coords &&
            hasData &&
            Array.isArray(coords) &&
            coords.length === 2 &&
            coords.every((n) => Number.isFinite(n)) && (
              <Marker position={coords}>
                <Popup>
                  <div className="space-y-1">
                    <div className="font-semibold">{weather.name}</div>
                    <div className="text-sm capitalize">
                      {weather.weather[0].description}
                    </div>
                    <div className="text-sm">
                      Temp: {Math.round(weather.main.temp)}°C
                    </div>
                    <div className="text-xs text-slate-600">
                      Lat: {Number(coords).toFixed(3)}, Lon: {Number(coords).toFixed(3)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
        </MapContainer>
      </div>
    </div>
  );
};

export default Weather;
