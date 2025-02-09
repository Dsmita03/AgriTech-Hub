import React from "react";
import TopicList from "../components/TopicList";

const Home = () => {
  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-5xl mx-auto text-center">
        {/* Heading */}
        <h1 className="text-4xl font-extrabold text-green-700 mb-4">
          🌿 Agriculture Knowledge Hub
        </h1>

        {/* Subtext */}
        <p className="text-lg text-gray-700 mb-8">
          Explore modern agricultural techniques, sustainability tips, and expert insights.
        </p>

        {/* Topic List Wrapper */}
        <div >
          <TopicList />
        </div>
      </div>
    </div>
  );
};

export default Home;
