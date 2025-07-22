import { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function GovernmentSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cache, setCache] = useState({});
  const debounceRef = useRef(null);

  // Language change with debounce
  const handleLanguageChange = (lang) => {
    if (lang === selectedLanguage) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSelectedLanguage(lang);
    }, 200);
  };

  useEffect(() => {
    fetchSchemes();

    // Preload other languages
    ["en", "hi", "bn"].forEach((lang) => {
      if (lang !== selectedLanguage && !cache[lang]) {
        axios
          .get(`https://agritech-hub-b8if.onrender.com/api/schemes?language=${lang}`)
          .then((res) => {
            setCache((prev) => ({ ...prev, [lang]: res.data }));
          })
          .catch(() => {});
      }
    });
  }, [selectedLanguage]);

  const fetchSchemes = async () => {
    if (cache[selectedLanguage]) {
      setSchemes(cache[selectedLanguage]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`https://agritech-hub-b8if.onrender.com/api/schemes?language=${selectedLanguage}`);
      setSchemes(response.data);
      setCache((prev) => ({ ...prev, [selectedLanguage]: response.data }));
    } catch (error) {
      setError("Failed to fetch government schemes. Please try again.");
      console.error("Error fetching schemes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-200 p-8 flex justify-center items-center">
      <div className="max-w-5xl w-full bg-white shadow-2xl rounded-3xl p-10 border border-green-300">
        <h1 className="text-4xl font-extrabold text-green-700 text-center mb-8">📜 Government Schemes</h1>

        {/* Language Selector */}
        <div className="flex justify-center space-x-4 mb-8">
          {["en", "hi", "bn"].map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`px-5 py-2 text-lg font-semibold rounded-full transition-all duration-300 ${
                selectedLanguage === lang
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {lang === "en" ? "English" : lang === "hi" ? "हिन्दी" : "বাংলা"}
            </button>
          ))}
        </div>

        {/* Loading, Error, or Schemes */}
        {error && (
          <p className="text-center text-red-500 font-semibold mb-4">{error}</p>
        )}

        {/* Skeleton Loader */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="p-6 border border-green-200 rounded-2xl shadow bg-gray-100 animate-pulse h-48"
              >
                <div className="h-4 bg-green-200 rounded w-2/3 mb-4" />
                <div className="h-3 bg-gray-300 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 rounded w-5/6 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {schemes.map((scheme, index) => (
                <a
                  key={index}
                  href={scheme.apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-6 border border-green-300 rounded-2xl shadow-lg bg-white hover:shadow-2xl transition-transform duration-300 hover:scale-105 flex flex-col cursor-pointer"
                >
                  <h2 className="text-2xl font-bold text-green-800 mb-2">{scheme.name}</h2>
                  <p className="text-gray-600 text-sm flex-grow">{scheme.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                      🎯 Eligibility: {scheme.eligibility}
                    </span>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                      💰 Benefits: {scheme.benefits}
                    </span>
                  </div>
                </a>
              ))}
            </div>
            {schemes.length === 0 && (
              <p className="text-center text-gray-600 mt-6">
                No schemes available for the selected language.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
