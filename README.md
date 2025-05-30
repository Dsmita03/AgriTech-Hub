# AgriTech-Hub

## Overview
AgriTech-Hub is an advanced agriculture-based platform designed to empower farmers and agricultural professionals with real-time insights, smart recommendations, and a collaborative knowledge-sharing space. It integrates AI, real-time data, and community-driven insights to optimize farming practices and improve crop productivity.

## Features
- **Interactive Knowledge Hub**: A space for farmers to share knowledge, best practices, and farming techniques.
- **Crop Recommendation System**: Provides crop suggestions based on soil quality, weather conditions, and user preferences.
- **Smart Weather Updates**: Delivers real-time and location-based weather information.
- **Plant Disease Detection**: AI-powered tool to detect plant diseases through image analysis.
- **Localized Language Support**: Available in English, Hindi, and Bengali using React-i18next.
- **Community Forum**: Enables discussions, problem-solving, and idea-sharing among users.
- **Government Schemes & Subsidies**: Provides updated information on agricultural schemes and subsidies.

<h2 id="screenshots">⚙ Screenshots</h2>
<h4>Login Page</h4>
<img src="snaps/Login.png" alt="Login Page" width="800">
<h4>Home Page</h4>
<img src="snaps/home.png" alt="Home Page" width="800">
<h4>Features Page</h4>
<img src="snaps/features.png" alt="Features Page" width="800">
<h4>Plant Disease Detector</h4>
<img src="snaps/plant.png" alt="Plant" width="800">

## Tech Stack
### Frontend
- **Framework**: React (Vite) with Tailwind CSS
- **State Management**: Context API / Redux (if required)
- **Localization**: React-i18next
- **PWA Support**: Enabled for offline access

### Backend
- **Framework**: Node.js with Express.js
- **Database**: Firebase (for user data and preferences)
- **APIs Used**:
  - **Soil Data**: SoilGrids API
  - **Weather Updates**: OpenWeather API
  - **Crop Details**: OpenFarm API

### Machine Learning
- **Plant Disease Detection Model**: Custom TensorFlow model (trained on 8 classes, achieving >85% accuracy)
- **Image Processing**: Flask-based backend API for model inference

## Installation
### Prerequisites
- Node.js & npm
- Python (for ML model)
- Firebase project setup  

### Steps
1. **Clone the Repository**
   ```sh
   git clone https://github.com/Dsmita03/AgriTech-Hub
   ```
2. **Install Dependencies**
   ```sh
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```
3. **Start the Backend Server**
   ```sh
   cd backend
   node server.js
   ```
4. **Start the Frontend**
   ```sh
   cd frontend
   npm run dev
   ```

## API Endpoints
- **GET /weather**: Fetches real-time weather updates.
- **POST /recommend-crop**: Returns crop suggestions based on soil and weather data.
- **POST /detect-disease**: Processes plant images to detect diseases.

## Future Enhancements
- AI-driven pest control recommendations.
- Blockchain-based supply chain tracking for agricultural products.
- Voice assistant integration for hands-free usage.

## Contributors
[![Contributors](https://contrib.rocks/image?repo=Dsmita03/AgriTech-Hub)](https://github.com/Dsmita03/AgriTech-Hub/graphs/contributors)

---
Feel free to contribute, suggest improvements, or report issues!
