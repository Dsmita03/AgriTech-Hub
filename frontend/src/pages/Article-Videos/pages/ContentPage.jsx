import { useParams } from "react-router-dom";  
import { articles } from "../data/articles";

const ContentPage = () => {
  const { contentId } = useParams();

  // Support both array and object lookups
  const selectedContent =
    Array.isArray(articles)
      ? articles[Number(contentId)]
      : articles?.[contentId];

  if (!selectedContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <div className="rounded-xl border border-rose-200 bg-white px-6 py-4 text-rose-700 text-lg font-semibold shadow-sm">
          ❌ Content Not Found
        </div>
      </div>
    );
  }

  const isVideo = selectedContent.type === "video";
  const title = selectedContent.title || "Content";

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50/60 py-8 px-4">
      <div className="mx-auto w-full max-w-5xl bg-white/95 border border-emerald-200 rounded-2xl shadow-sm p-6 md:p-8">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-700 tracking-tight">
          {title}
        </h1>

        {/* Metadata (optional) */}
        {selectedContent.author || selectedContent.date ? (
          <div className="mt-2 text-sm text-slate-600">
            {selectedContent.author && <span>{selectedContent.author}</span>}
            {selectedContent.author && selectedContent.date && <span> • </span>}
            {selectedContent.date && (
              <span>{new Date(selectedContent.date).toLocaleDateString?.() || selectedContent.date}</span>
            )}
          </div>
        ) : null}

        {/* Content */}
        {isVideo ? (
          <div className="mt-6">
            <div className="relative w-full overflow-hidden rounded-xl border border-emerald-200 shadow">
              <iframe
                className="w-full aspect-video"
                src={`https://www.youtube.com/embed/${selectedContent.videoId}`}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            {selectedContent.description && (
              <p className="mt-4 text-slate-700 leading-relaxed">
                {selectedContent.description}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-6 prose prose-emerald max-w-none">
            {/* If content is plain text */}
            {typeof selectedContent.content === "string" ? (
              <p className="text-slate-800 leading-relaxed text-lg">
                {selectedContent.content}
              </p>
            ) : (
              // If content is an array of paragraphs/blocks
              Array.isArray(selectedContent.content) &&
              selectedContent.content.map((para, idx) => (
                <p key={idx} className="text-slate-800 leading-relaxed text-lg">
                  {para}
                </p>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentPage;
