import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { Loader } from './components/Loader';
import { CowIcon } from './components/icons/CowIcon';
import { recognizeCowBreed } from './services/geminiService';
import type { BreedInfo } from './types';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [breedInfo, setBreedInfo] = useState<BreedInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (file: File | null) => {
    if (file) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
      setBreedInfo(null);
      setError(null);
    }
  };

  const handleRecognize = useCallback(async () => {
    if (!imageFile) {
      setError("Please upload an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setBreedInfo(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const result = await recognizeCowBreed(base64String, imageFile.type);
        if (result.error) {
           setError(result.error);
        } else {
           setBreedInfo(result);
        }
        setIsLoading(false);
      };
      reader.onerror = () => {
        setError("Failed to read the image file.");
        setIsLoading(false);
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setIsLoading(false);
    }
  }, [imageFile]);

  const handleReset = () => {
    setImageFile(null);
    setImageUrl(null);
    setBreedInfo(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/cowfarm/1920/1080')" }}>
      <div className="min-h-screen bg-black bg-opacity-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
          <header className="p-6 bg-green-800 text-white flex items-center justify-center space-x-4">
            <CowIcon className="w-10 h-10" />
            <h1 className="text-3xl font-bold tracking-wider">Gomata Breed Detection</h1>
          </header>

          <main className="p-8 grid md:grid-cols-5 gap-8 items-start">
            <div className="md:col-span-3 flex flex-col space-y-6">
              <ImageUploader imageUrl={imageUrl} onImageChange={handleImageChange} />
              <div className="flex space-x-4">
                <button
                  onClick={handleRecognize}
                  disabled={!imageFile || isLoading}
                  className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  {isLoading ? 'Recognizing...' : 'Recognize Breed'}
                </button>
                {imageUrl && (
                  <button
                    onClick={handleReset}
                    className="w-full bg-gray-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="md:col-span-2 flex items-center justify-center min-h-[300px] bg-green-50 rounded-lg p-6 border-2 border-dashed border-green-200">
              {isLoading ? (
                <Loader />
              ) : error ? (
                <div className="text-center text-red-600 font-semibold">
                  <p>Error: {error}</p>
                </div>
              ) : breedInfo ? (
                <ResultDisplay breedInfo={breedInfo} />
              ) : (
                <div className="text-center text-gray-500">
                  <p className="font-semibold">Your cow's breed information will appear here.</p>
                  <p className="text-sm">Upload an image and click "Recognize Breed".</p>
                </div>
              )}
            </div>
          </main>
        </div>
        <footer className="text-white text-center mt-6 text-sm bg-black bg-opacity-50 px-4 py-2 rounded-full">
          Powered by Gemini API | Designed by a World-Class Senior Frontend React Engineer
        </footer>
      </div>
    </div>
  );
};

export default App;