 
import { useNavigate } from "react-router-dom"; // fix: use react-router-dom
import { Button } from "@/components/ui/button";
import { FaVideo } from "react-icons/fa";

const ContentCard = ({ content, contentId }) => {
  const navigate = useNavigate();

  if (!content) {
    return (
      <div className="border border-rose-200 bg-rose-50 text-rose-700 rounded-lg p-4 text-sm">
        Content unavailable.
      </div>
    );
  }

  const goToContent = () => {
    navigate(`/articles-videos/content/${contentId}`);
  };

  const isVideo = content.type === "video";
  const title = content.title || "Untitled";

  return (
    <div className="rounded-xl border border-emerald-200 bg-white/95 p-5 shadow-sm hover:shadow transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {content.subtitle && (
            <p className="mt-1 text-sm text-slate-600">{content.subtitle}</p>
          )}
          {isVideo && (
            <span className="inline-flex items-center mt-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
              <FaVideo className="mr-1" /> Video
            </span>
          )}
        </div>

        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={goToContent}
          aria-label={isVideo ? "Watch video" : "Read article"}
          size="sm"
        >
          {isVideo ? "Watch Video" : "Read Article"}
        </Button>
      </div>
    </div>
  );
};

import PropTypes from "prop-types";

ContentCard.propTypes = {
  content: PropTypes.shape({
    type: PropTypes.string,
    title: PropTypes.string,
    subtitle: PropTypes.string,
  }),
  contentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default ContentCard;
