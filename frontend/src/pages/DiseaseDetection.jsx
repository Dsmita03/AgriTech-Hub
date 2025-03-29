import { useState } from "react";
import axios from "axios";
import { Loader2, UploadCloud } from "lucide-react";
 
const PlantDiseaseDetector = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await axios.post("https://agritech-hub-b8if.onrender.com/api/disease/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image: " + (error.response?.data?.error || error.message));
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-r from-green-100 to-green-300">
      {/* Left Section - Form */}
      <div className="flex items-center justify-center">
  <div className="w-full max-w-lg space-y-6 bg-white p-10 rounded-2xl shadow-xl border border-green-300">
    <div className="text-center">
      <h1 className="text-3xl font-extrabold text-green-700">🌿 Plant Disease Detector</h1>
      <p className="text-gray-600 mt-2">Upload an image to analyze plant health.</p>
    </div>

    <div className="flex flex-col items-center w-full">
  <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" id="file-upload" />
  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-1 px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition w-64">
    <UploadCloud size={20} />
    <span className="text-sm font-medium">Upload Image</span>
  </label>

  {preview && (
    <div className="mt-4 w-full h-56 flex justify-center items-center border border-green-300 rounded-md shadow-sm bg-gray-100">
      <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-md" />
    </div>
  )}
</div>

    <button onClick={handleUpload} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition">
      Upload & Predict
    </button>

    {loading && (
      <div className="flex justify-center items-center mt-4">
        <Loader2 className="animate-spin text-green-600" size={30} />
        <p className="text-gray-600 ml-2">Analyzing...</p>
      </div>
    )}

    {result && (
      <div className="mt-6 p-5 bg-green-50 border border-green-400 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-green-700">🌱 Disease: {result.disease}</h3>
        <p className="text-gray-700 text-lg">📊 Confidence: {result.confidence*10}%</p>
      </div>
    )}
  </div>
</div>


      {/* Right Section - Leaf Image */}
      <div className="hidden lg:block relative">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=2940&auto=format&fit=crop')" }} />
        <div className="absolute inset-0 bg-gradient-to-tr from-green-600/20 to-green-800/40" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <p className="text-lg font-bold">"Healthy leaves lead to thriving plants."</p>
          <span className="text-sm">- Agricultural Science Initiative</span>
        </div>
      </div>
    </div>
  );
};

export default PlantDiseaseDetector;
