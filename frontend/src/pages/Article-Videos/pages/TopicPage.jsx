import ContentCard from "../components/ContentCard";
import { topics } from "../data/topics";
import { useParams } from "react-router-dom"; // use react-router-dom
import { articles } from "../data/articles";

const TopicPage = () => {
  const { topicId } = useParams();

  // Coerce if your topics use numeric IDs; otherwise remove Number(...)
  const selectedTopic = Array.isArray(topics)
    ? topics.find((topic) => String(topic.id) === String(topicId))
    : topics?.[topicId];

  if (!selectedTopic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <div className="rounded-xl border border-rose-200 bg-white px-6 py-4 text-rose-700 text-lg font-semibold shadow-sm">
          ❌ Topic Not Found
        </div>
      </div>
    );
  }

  const contentIds = Array.isArray(selectedTopic.content)
    ? selectedTopic.content
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50/60 py-8 px-4">
      <div className="mx-auto w-full max-w-6xl">
        {/* Topic Header */}
        <div className="bg-white/95 border border-emerald-200 rounded-2xl shadow-sm p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-700 tracking-tight">
            {selectedTopic.title}
          </h1>
          {selectedTopic.description && (
            <p className="mt-2 text-slate-700 leading-relaxed">
              {selectedTopic.description}
            </p>
          )}
        </div>

        {/* Content Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentIds.length > 0 ? (
            contentIds.map((contentId) => {
              const content = articles?.[contentId];
              if (!content) {
                // Skip invalid/missing content entries gracefully
                return null;
              }
              return (
                <ContentCard
                  key={contentId}
                  content={content}
                  contentId={contentId}
                />
              );
            })
          ) : (
            <div className="col-span-full rounded-xl border border-emerald-200 bg-emerald-50/60 p-6 text-center text-slate-600">
              No content available for this topic yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicPage;
