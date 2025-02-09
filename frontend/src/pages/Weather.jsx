import { useState } from "react";
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

const Weather = () => {
  const { t, i18n } = useTranslation();
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    if (!city) return;
    setLoading(true);

    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error("Error fetching weather:", error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (main) => {
    switch (main) {
      case "Clear":
        return <WiDaySunny size={100} className="text-yellow-400" />;
      case "Clouds":
        return <WiCloud size={100} className="text-gray-400" />;
      case "Rain":
        return <WiRain size={100} className="text-blue-500" />;
      case "Snow":
        return <WiSnow size={100} className="text-blue-300" />;
      case "Thunderstorm":
        return <WiThunderstorm size={100} className="text-purple-500" />;
      case "Fog":
        return <WiFog size={100} className="text-gray-500" />;
      default:
        return <WiCloud size={100} className="text-gray-400" />;
    }
  };

  return (
    <div className="h-screen w-screen flex">
      {/* Left Section - Weather Info */}
      <div className="w-1/2 flex items-center justify-center bg-green-50">
        <div className="bg-green-100 text-green-900 shadow-lg rounded-lg p-8 w-full max-w-lg">
          <h2 className="text-3xl font-bold text-green-700 text-center mb-4">
            🌿 {t("weather")}
          </h2>

          {/* Language Selector */}
          <select
            className="mb-4 p-2 border border-green-500 rounded bg-green-200 text-green-900 cursor-pointer"
            onChange={(e) => i18n.changeLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="bn">বাংলা</option>
          </select>

          {/* City Input */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <input
              type="text"
              placeholder={t("Enter Your City")}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="border p-2 rounded w-full max-w-xs bg-white text-green-900 placeholder-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={fetchWeather}
              className={`bg-green-600 text-white px-5 py-2 rounded-md shadow-md transition-all duration-300 ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
              }`}
              disabled={loading}
            >
              {loading ? t("Loading...") : t("getWeather")}
            </button>
          </div>

          {/* Weather Display */}
          {weather && weather.main ? (
            <div className="mt-6 text-center">
              <h3 className="text-2xl font-semibold">{weather.name}</h3>
              <div className="flex justify-center items-center gap-4 mt-3">
                {getWeatherIcon(weather.weather[0].main)}
                <p className="text-lg">{weather.weather[0].description}</p>
              </div>
              <p className="text-5xl font-bold mt-2">{weather.main.temp}°C</p>

              {/* Additional Weather Info */}
              <div className="mt-4 grid grid-cols-3 gap-4 text-lg">
                <div className="flex flex-col items-center">
                  <WiThermometer size={40} className="text-green-700" />
                  <p>{t("Feels Like")}: {weather.main.feels_like}°C</p>
                </div>
                <div className="flex flex-col items-center">
                  <WiHumidity size={40} className="text-green-700" />
                  <p>{t("Humidity")}: {weather.main.humidity}%</p>
                </div>
                <div className="flex flex-col items-center">
                  <WiBarometer size={40} className="text-green-700" />
                  <p>{t("Pressure")}: {weather.main.pressure} hPa</p>
                </div>
              </div>
            </div>
          ) : weather && weather.message ? (
            <p className="text-red-500 mt-4 text-lg">{t("City Not Found!")}</p>
          ) : null}
        </div>
      </div>

      {/* Right Section - Full Height Image */}
      <div className="w-1/2 h-screen">
        <img
          src="/weather.jpg" // Replace with a relevant image
          alt="Weather and Agriculture"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Weather;
