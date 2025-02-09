import React from "react";
import { UploadCloud } from "lucide-react";

const FileUploader = ({ onFileSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-400 rounded-xl bg-white shadow-md hover:shadow-lg transition duration-300">
      <label className="cursor-pointer flex flex-col items-center gap-3 text-gray-700 font-medium">
        <div className="flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full shadow-inner">
          <UploadCloud size={32} className="text-gray-600" />
        </div>
        <span className="text-sm text-gray-600">Drag & Drop or Click to Upload</span>
        <input 
          type="file" 
          accept="image/*" 
          onChange={onFileSelect} 
          className="hidden"
        />
      </label>
    </div>
  );
};

export default FileUploader;
