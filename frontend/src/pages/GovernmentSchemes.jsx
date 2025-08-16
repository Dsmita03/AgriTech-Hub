import { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import { Globe2, Search, ExternalLink, AlertTriangle, RefreshCw } from "lucide-react";

const LANGS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "bn", label: "বাংলা" },
];

export default function GovernmentSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cache, setCache] = useState({});
  const debounceRef = useRef(null);

  const handleLanguageChange = (lang) => {
    if (lang === selectedLanguage) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSelectedLanguage(lang), 180);
  };

  const handleRetry = () => {
    setCache((prev) => {
      const next = { ...prev };
      delete next[selectedLanguage];
      return next;
    });
  };

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const fetchSchemes = async () => {
      if (cache[selectedLanguage]) {
        setSchemes(cache[selectedLanguage]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `https://agritech-hub-b8if.onrender.com/api/schemes?language=${selectedLanguage}`,
          { signal: controller.signal }
        );
        if (cancelled) return;
        const items = res.data || [];
        setSchemes(items);
        setCache((prev) => ({ ...prev, [selectedLanguage]: items }));
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        if (cancelled) return;
        setError("Failed to fetch government schemes. Please try again.");
        // console.error("Error fetching schemes:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // Fetch current language
    fetchSchemes();

    // Preload others silently
    LANGS.forEach(({ code }) => {
      if (code !== selectedLanguage && !cache[code]) {
        axios
          .get(`https://agritech-hub-b8if.onrender.com/api/schemes?language=${code}`)
          .then((res) => {
            if (!cancelled) {
              setCache((prev) => ({ ...prev, [code]: res.data || [] }));
            }
          })
          .catch(() => {});
      }
    });

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(debounceRef.current);
    };
  }, [selectedLanguage, cache]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return schemes;
    return schemes.filter((s) => {
      const text = `${s.name} ${s.description} ${s.eligibility} ${s.benefits}`.toLowerCase();
      return text.includes(q);
    });
  }, [schemes, query]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50/60 py-10 px-4">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-emerald-700">
            Government Schemes
          </h1>
          <p className="text-slate-600 mt-2">
            Discover relevant programs and benefits tailored for farmers.
          </p>
        </div>

        {/* Controls bar */}
        <div className="sticky top-2 z-10 bg-white/80 backdrop-blur border border-emerald-200 rounded-2xl p-3 md:p-4 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
            {/* Language pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-2 text-slate-700 text-sm font-medium px-2">
                <Globe2 size={16} className="text-emerald-600" />
                Language
              </span>
              <div className="flex gap-2">
                {LANGS.map(({ code, label }) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleLanguageChange(code)}
                    aria-pressed={selectedLanguage === code}
                    aria-label={`Change language to ${label}`}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                      selectedLanguage === code
                        ? "bg-emerald-600 text-white shadow"
                        : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="md:ml-auto w-full md:w-72">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  placeholder="Search schemes..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
            <AlertTriangle size={18} className="mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">We couldn’t load the schemes.</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-1 rounded-md border border-rose-300 px-2.5 py-1.5 text-sm hover:bg-rose-100 transition"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm animate-pulse"
                aria-hidden="true"
              >
                <div className="h-5 w-2/3 rounded bg-emerald-100 mb-3" />
                <div className="h-3 w-full rounded bg-slate-100 mb-2" />
                <div className="h-3 w-5/6 rounded bg-slate-100 mb-2" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
                <div className="mt-4 flex gap-2">
                  <div className="h-6 w-28 rounded-full bg-emerald-100" />
                  <div className="h-6 w-28 rounded-full bg-blue-100" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Empty state for search */}
            {!error && filtered.length === 0 && schemes.length > 0 && (
              <div className="text-center text-slate-600 mb-6">
                No schemes match “{query}”. Try a different search.
              </div>
            )}

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((scheme, index) => (
                <a
                  key={`${scheme.name}-${index}`}
                  href={scheme.apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm hover:shadow-md transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <h2 className="text-[1.1rem] font-bold text-emerald-800 leading-snug">
                    {scheme.name}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                    {scheme.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-block rounded-full bg-emerald-50 text-emerald-800 text-[0.72rem] font-semibold px-3 py-1 border border-emerald-200">
                      🎯 Eligibility: {scheme.eligibility}
                    </span>
                    <span className="inline-block rounded-full bg-blue-50 text-blue-800 text-[0.72rem] font-semibold px-3 py-1 border border-blue-200">
                      💰 Benefits: {scheme.benefits}
                    </span>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1 text-emerald-700 text-sm group-hover:gap-1.5 transition-all">
                    Apply
                    <ExternalLink size={14} />
                  </div>
                </a>
              ))}
            </div>

            {/* Empty state when API returns nothing */}
            {!error && schemes.length === 0 && (
              <p className="text-center text-slate-600 mt-8">
                No schemes available for the selected language.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
