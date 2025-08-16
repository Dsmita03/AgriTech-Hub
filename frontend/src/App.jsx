import { BrowserRouter, Routes, Route } from "react-router-dom";  
import { Toaster } from "sonner";

import LandingLayout from "./Layout/LandingLayout";
import CropRecommendation from "./pages/CropRecommendation";
import DiseaseDetection from "./pages/DiseaseDetection";
import Weather from "./pages/Weather";
import Forum from "./pages/Forum";
import GovernmentSchemes from "./pages/GovernmentSchemes";

import Home from "./pages/Article-Videos/pages/Home";
import TopicPage from "./pages/Article-Videos/pages/TopicPage";
import ContentPage from "./pages/Article-Videos/pages/ContentPage";

import Contact from "./pages/Contact";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

import "./i18n";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      {/* Global toaster for notifications */}
      <Toaster richColors position="top-right" />

      <Routes>
        {/* Auth */}
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Dashboard layout route (optional content inside LandingLayout) */}
        <Route path="/dashboard" element={<LandingLayout />} />

        {/* Feature pages */}
        <Route path="/crop-recommendation" element={<CropRecommendation />} />
        <Route path="/disease-detection" element={<DiseaseDetection />} />
        <Route path="/weather-updates" element={<Weather />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/government-schemes" element={<GovernmentSchemes />} />

        {/* Articles & Videos */}
        <Route path="/articles-videos" element={<Home />} />
        <Route path="/articles-videos/topic/:topicId" element={<TopicPage />} />
        <Route
          path="/articles-videos/content/:contentId"
          element={<ContentPage />}
        />

        {/* Static pages */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
