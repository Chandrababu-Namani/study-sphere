import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Scan, AlertCircle } from 'lucide-react';
import { analyzeImageWithGemini } from '../services/geminiService';

const AIImageAnalyzer: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Extract the base64 data part (remove "data:image/png;base64,")
      const base64Data = base64String.split(',')[1];
      
      setSelectedImage(base64Data);
      setMimeType(file.type);
      setAnalysis(''); // Clear previous analysis
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage || !mimeType) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeImageWithGemini(
        selectedImage, 
        mimeType, 
        "Identify the educational content in this image. If it contains text, summarize it. If it contains diagrams or math problems, explain them step-by-step."
      );
      setAnalysis(result);
    } catch (error) {
      setAnalysis("Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setMimeType('');
    setAnalysis('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <h2 className="text-2xl font-bold flex items-center">
            <Scan className="mr-2" /> Smart Scanner
          </h2>
          <p className="text-indigo-100 mt-1">
            Upload a photo of your notes, textbook, or diagrams, and AI will explain it to you.
          </p>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6">
          {/* Left Column: Upload & Preview */}
          <div className="space-y-4">
            {!selectedImage ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 hover:border-primary cursor-pointer transition-all flex flex-col items-center justify-center h-64"
              >
                <div className="bg-indigo-50 p-4 rounded-full mb-4">
                    <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-medium text-gray-900">Click to upload image</h3>
                <p className="text-sm text-gray-500 mt-1">Supports JPG, PNG, WEBP</p>
              </div>
            ) : (
              <div className="relative h-64 bg-black rounded-xl overflow-hidden flex items-center justify-center group">
                <img 
                  src={`data:${mimeType};base64,${selectedImage}`} 
                  alt="Upload preview" 
                  className="max-h-full max-w-full object-contain" 
                />
                <button 
                  onClick={clearImage}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept="image/*" 
              className="hidden" 
            />

            <button
              onClick={handleAnalyze}
              disabled={!selectedImage || isAnalyzing}
              className={`w-full py-3 rounded-lg font-medium flex items-center justify-center transition-all shadow-md ${
                !selectedImage || isAnalyzing
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-indigo-700'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Scan className="animate-spin mr-2 h-5 w-5" /> Analyzing...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-5 w-5" /> Analyze Image
                </>
              )}
            </button>
          </div>

          {/* Right Column: Results */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 min-h-[300px] flex flex-col">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              Analysis Result
            </h3>
            
            {analysis ? (
              <div className="prose prose-sm max-w-none text-gray-700 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                <p className="whitespace-pre-wrap">{analysis}</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                {isAnalyzing ? (
                    <p>Processing image...</p>
                ) : (
                    <>
                        <AlertCircle className="h-10 w-10 mb-2 opacity-20" />
                        <p className="text-sm text-center px-4">Upload an image and click analyze to see the AI interpretation here.</p>
                    </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIImageAnalyzer;