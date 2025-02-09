import React from "react";
import { useParams } from "react-router";
import { articles } from "../data/articles";

const ContentPage = () => {
  const { contentId } = useParams();
  const selectedContent = articles[contentId];

  if (!selectedContent) {
    return (
      <div className="h-screen flex items-center justify-center bg-red-100 text-red-700 text-xl font-semibold">
        ❌ Content Not Found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className=" mx-12 bg-white p-8 rounded-lg shadow-md border border-green-300">
        {/* Title */}
        <h1 className="text-4xl font-extrabold text-green-800">{selectedContent.title}</h1>

        {/* Content Section */}
        {selectedContent.type === "video" ? (
          <div className="mt-6">
            <iframe
              className="w-full h-[500px] rounded-lg shadow-lg"
              src={`https://www.youtube.com/embed/${selectedContent.videoId}`}
              title={selectedContent.title}
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div className="mt-6 text-lg text-gray-700 leading-relaxed">
            <p>{selectedContent.content}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentPage;
