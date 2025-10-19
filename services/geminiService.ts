import { GoogleGenAI, Type } from "@google/genai";
import type { BreedInfo } from '../types';

// This service leverages the powerful visual analysis capabilities of Google's Gemini model.
// Instead of relying on a pre-compiled, static database of cow images, we send the user's
// image to the Gemini API. The model, with its extensive training on diverse data,
// can recognize cow breeds in real-time, providing a more flexible and intelligent solution.

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

const breedInfoSchema = {
  type: Type.OBJECT,
  properties: {
    breed: {
      type: Type.STRING,
      description: "The identified breed of the cow. e.g., 'Holstein Friesian', 'Angus', 'Hereford'."
    },
    description: {
      type: Type.STRING,
      description: "A brief, interesting one-paragraph description of the breed's characteristics, origin, or primary use."
    },
    confidence: {
      type: Type.NUMBER,
      description: "A confidence score from 0.0 to 1.0 on the breed identification."
    },
    error: {
        type: Type.STRING,
        description: "An error message if a cow is not detected in the image. e.g., 'No cow was detected in the provided image.'"
    },
  },
};

export const recognizeCowBreed = async (imageBase64: string, mimeType: string): Promise<BreedInfo> => {
  try {
    const prompt = "Analyze the image of this cow. Focus on its features like coloration, body structure, and head shape to identify its breed. Provide the places where this breed popularly found. If the image does not clearly show a cow, please indicate that. Provide a confidence score for your identification.";
    
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: prompt,
    };
    
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [textPart, imagePart] },
      config: {
          responseMimeType: "application/json",
          responseSchema: breedInfoSchema,
      }
    });

    const jsonString = response.text.trim();
    const result: BreedInfo = JSON.parse(jsonString);

    if (result.error) {
        return { error: result.error };
    }

    if (!result.breed) {
        return { error: "Could not determine the breed. The image may not contain a cow." };
    }
    
    return result;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return { error: `API Error: ${error.message}` };
    }
    return { error: "An unexpected error occurred during breed recognition." };
  }
};