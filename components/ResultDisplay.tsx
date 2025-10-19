
import React from 'react';
import type { BreedInfo } from '../types';

interface ResultDisplayProps {
  breedInfo: BreedInfo;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ breedInfo }) => {
  const confidencePercentage = breedInfo.confidence ? Math.round(breedInfo.confidence * 100) : 0;
  
  const getConfidenceColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full text-left animate-fade-in">
      <h2 className="text-4xl font-extrabold text-green-800 mb-2">{breedInfo.breed}</h2>
      {breedInfo.confidence && (
        <p className={`text-lg font-semibold mb-4 ${getConfidenceColor(confidencePercentage)}`}>
          Confidence: {confidencePercentage}%
        </p>
      )}
      <p className="text-gray-700 leading-relaxed">
        {breedInfo.description}
      </p>
    </div>
  );
};
