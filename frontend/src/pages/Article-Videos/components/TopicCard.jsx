 
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom"; // fix: use react-router-dom

const TopicCard = ({ topic }) => {
  const navigate = useNavigate();

  if (!topic) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 p-4 text-sm">
        Topic unavailable.
      </div>
    );
  }

  const goToTopic = () => navigate(`/articles-videos/topic/${topic.id}`);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={goToTopic}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") goToTopic();
      }}
      className="group rounded-xl border border-emerald-200 bg-white/95 p-4 shadow-sm hover:shadow-md transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
      aria-label={`Open topic: ${topic.title}`}
    >
      <div className="overflow-hidden rounded-lg">
        <img
          src={topic.image}
          alt={topic.title || "Topic image"}
          className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </div>

      <h2 className="mt-3 text-lg font-semibold text-slate-900">
        {topic.title}
      </h2>

      {topic.description && (
        <p className="mt-1 text-sm text-slate-600 line-clamp-2">
          {topic.description}
        </p>
      )}
    </div>
  );
};
TopicCard.propTypes = {
  topic: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    image: PropTypes.string,
    description: PropTypes.string,
  }),
};

export default TopicCard;
 
