import { useState, useRef } from "react";
import axios from "axios";
import { Loader2, UploadCloud, Image as ImageIcon, ShieldCheck, AlertTriangle } from "lucide-react";

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const PlantDiseaseDetector = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ type: "", message: "" });
  const inputRef = useRef(null);

  const resetAll = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setNotice({ type: "", message: "" });
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    setResult(null);
    setNotice({ type: "", message: "" });

    if (!file) return;

    // Validate type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setNotice({ type: "error", message: "Please select a JPG, PNG, or WebP image." });
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setNotice({ type: "error", message: `File too large. Max ${MAX_FILE_SIZE_MB}MB allowed.` });
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!image) {
      setNotice({ type: "error", message: "Please select an image before predicting." });
      return;
    }

    setLoading(true);
    setNotice({ type: "", message: "" });
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", image); // Matches your backend upload.single("file")

      // FIXED: Remove Content-Type header - let browser set it automatically
      const response = await axios.post(
        "https://agritech-hub-b8if.onrender.com/api/disease/predict",
        formData
        // DON'T set headers for multipart/form-data - axios handles it
      );

      setResult(response.data);
      setNotice({ type: "success", message: "Prediction complete." });

    } catch (error) {
      console.error("Error uploading image:", error);
      
      // Enhanced error handling
      let errorMessage = "Upload failed. Please try again.";
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.error || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request made but no response
        errorMessage = "Network error. Please check your connection.";
      } else {
        // Something else happened
        errorMessage = error.message || "Unknown error occurred.";
      }
      
      setNotice({ type: "error", message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const confidenceText = (val) => {
    if (val == null) return "N/A";
    const num = Number(val);
    // Your backend already returns percentage (0-100), so no conversion needed
    return `${num.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-r from-emerald-50 to-emerald-100">
      {/* Left: Form Panel */}
      <div className="flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl space-y-6 bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-emerald-200 p-6 md:p-8">
          
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-emerald-700 tracking-tight">
              Plant Disease Detector
            </h1>
            <p className="text-slate-600 mt-2">
              Upload a plant leaf image to analyze its health with AI.
            </p>
          </div>

          {/* Status Notice */}
          {notice.message && (
            <div
              className={`flex items-start gap-3 rounded-lg px-4 py-3 text-sm border ${
                notice.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
              role="status"
              aria-live="polite"
            >
              {notice.type === "success" ? (
                <ShieldCheck className="mt-0.5" size={18} />
              ) : (
                <AlertTriangle className="mt-0.5" size={18} />
              )}
              <span>{notice.message}</span>
            </div>
          )}

          {/* Uploader */}
          <div className="flex flex-col items-center w-full">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer w-full">
              <div className="flex flex-col items-center gap-2 border-2 border-dashed border-emerald-300 hover:border-emerald-400 rounded-xl p-6 transition bg-emerald-50/40">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-700">
                  <UploadCloud size={22} />
                </div>
                <p className="text-slate-800 font-medium">Click to upload</p>
                <p className="text-xs text-slate-500">
                  JPG, PNG, WebP • up to {MAX_FILE_SIZE_MB}MB
                </p>
              </div>
            </label>

            {/* Preview */}
            <div className="mt-4 w-full">
              {preview ? (
                <div className="w-full h-56 flex justify-center items-center border border-emerald-200 rounded-xl shadow-sm bg-slate-50">
                  <img
                    src={preview}
                    alt="Selected preview"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
              ) : (
                <div className="w-full h-40 flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-xl bg-white text-slate-400">
                  <ImageIcon size={28} />
                  <span className="text-sm mt-1">No image selected</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={loading || !image}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Analyzing...
                </>
              ) : (
                "Upload & Predict"
              )}
            </button>
            <button
              onClick={resetAll}
              disabled={loading}
              className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
            >
              Reset
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="mt-2 p-5 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-emerald-700">
                Disease: <span className="font-semibold">{result.disease || "Unknown"}</span>
              </h3>
              <p className="text-slate-700 text-base mt-1">
                Confidence: {confidenceText(result.confidence * 10)}
              </p>
              {/* Optional guidance */}
              <p className="text-slate-600 text-sm mt-2">
                Tip: For best results, use clear, well-lit close-up photos of the affected leaf.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Visual Panel */}
      <div className="hidden lg:block relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=2400&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/20 to-emerald-800/40" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white drop-shadow">
          <p className="text-lg font-bold">
            &quot;Healthy leaves lead to thriving plants.&quot;
          </p>
          <span className="text-sm opacity-90">
            — Agricultural Science Initiative
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlantDiseaseDetector;
