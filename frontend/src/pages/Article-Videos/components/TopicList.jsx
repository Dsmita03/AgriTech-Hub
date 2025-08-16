import TopicCard from "./TopicCard";
import { topics } from "../data/topics";

const TopicList = () => {
  const isArray = Array.isArray(topics);
  const hasItems = isArray && topics.length > 0;

  if (!isArray || !hasItems) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-6 text-center text-slate-600">
        No topics available right now. Please check back soon.
      </div>
    );
  }

  return (
    <section aria-label="Topic list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {topics.map((topic) => (
        <TopicCard key={String(topic.id)} topic={topic} />
      ))}
    </section>
  );
};

export default TopicList;
