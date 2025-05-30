import { BrowserRouter, Route, Routes } from "react-router"; // Fixed import
 
import LandingLayout from "./Layout/LandingLayout";
import CropRecommendation from "./pages/CropRecommendation";
import DiseaseDetection from "./pages/DiseaseDetection";
import Weather from "./pages/Weather";
import Forum from "./pages/Forum";
import GovernmentSchemes from "./pages/GovernmentSchemes";
import "./i18n";
import "./App.css";
import Home from "./pages/Article-Videos/pages/Home";
import TopicPage from "./pages/Article-Videos/pages/TopicPage";
import ContentPage from "./pages/Article-Videos/pages/ContentPage";
import Contact from "./pages/Contact";

import About from "./pages/About";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<LandingLayout />} /> 
        <Route path="/crop-recommendation" element={<CropRecommendation />} />
        <Route path="/disease-detection" element={<DiseaseDetection />} />
        <Route path="/weather-updates" element={<Weather />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/government-schemes" element={<GovernmentSchemes />} />
        <Route path="/articles-videos" element={<Home />} />
        <Route path="/articles-videos/topic/:topicId" element={<TopicPage />} />
        <Route path="/articles-videos/content/:contentId" element={<ContentPage />} />
        <Route path="/government-schemes" element={<GovernmentSchemes />} />
        <Route path="/contact" element={<Contact/>} />
        <Route path="/about" element={<About/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;