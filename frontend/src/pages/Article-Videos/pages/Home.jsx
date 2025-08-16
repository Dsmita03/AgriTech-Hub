import TopicList from "../components/TopicList";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50/60">
      {/* Hero */}
      <section className="px-4 pt-12 pb-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-700 tracking-tight">
            🌿 Agriculture Knowledge Hub
          </h1>
          <p className="mt-3 text-lg md:text-xl text-slate-700">
            Explore modern techniques, sustainability tips, and expert insights to
            grow smarter and greener.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-emerald-200 bg-white/95 shadow-sm p-4 md:p-6">
            {/* Optional header strip for the list */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-xl md:text-2xl font-semibold text-emerald-800">
                Browse Topics
              </h2>
              <span className="text-xs md:text-sm text-slate-500">
                Curated for modern farming
              </span>
            </div>

            <TopicList />
          </div>

          {/* Optional tip card to guide users */}
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-emerald-900 text-sm">
            💡 Tip: Use the topics to discover step-by-step guides, videos, and
            best practices tailored to your interests.
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
