import React from "react";
import ContentCard from "../components/ContentCard";
import { topics } from "../data/topics";
import { useParams } from "react-router";
import { articles } from "../data/articles";

const TopicPage = () => {
  const { topicId } = useParams();
  const selectedTopic = topics.find((topic) => topic.id === topicId);

  if (!selectedTopic) {
    return (
      <div className="h-screen flex items-center justify-center bg-red-100 text-red-700 text-xl font-semibold">
        ❌ Topic Not Found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className=" mx-12">
        {/* Topic Title */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-green-300">
          <h1 className="text-4xl font-extrabold text-green-800">{selectedTopic.title}</h1>
          <p className="text-gray-700 mt-2">{selectedTopic.description}</p>
        </div>

        {/* Content List */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedTopic.content.map((contentId) => (
            <ContentCard key={contentId} content={articles[contentId]} contentId={contentId} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopicPage;
