import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

export interface FishIdentificationResult {
  species: string;
  commonName: string;
  confidence: number;
  details: {
    description?: string;
    habitat?: string;
    size?: string;
    diet?: string;
    characteristics?: string[];
    conservationStatus?: string;
  };
}

export async function identifyFish(imagePath: string): Promise<FishIdentificationResult> {
  try {
    const imageBytes = fs.readFileSync(imagePath);

    const systemPrompt = `You are an expert marine biologist specializing in fish species identification. 
Analyze the provided image and identify the fish species with the highest accuracy possible.

Provide your response in the following JSON format:
{
  "species": "Scientific name (Genus species)",
  "commonName": "Common name of the fish",
  "confidence": number between 0 and 100,
  "details": {
    "description": "Brief description of the fish",
    "habitat": "Natural habitat information",
    "size": "Typical size range",
    "diet": "Diet and feeding habits",
    "characteristics": ["distinguishing feature 1", "distinguishing feature 2", "distinguishing feature 3"],
    "conservationStatus": "Conservation status if known"
  }
}

Be precise with the scientific nomenclature and provide accurate biological information.`;

    const contents = [
      {
        inlineData: {
          data: imageBytes.toString("base64"),
          mimeType: "image/jpeg",
        },
      },
      systemPrompt,
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            species: { type: "string" },
            commonName: { type: "string" },
            confidence: { type: "number" },
            details: {
              type: "object",
              properties: {
                description: { type: "string" },
                habitat: { type: "string" },
                size: { type: "string" },
                diet: { type: "string" },
                characteristics: {
                  type: "array",
                  items: { type: "string" }
                },
                conservationStatus: { type: "string" }
              }
            }
          },
          required: ["species", "commonName", "confidence", "details"]
        }
      },
      contents: contents,
    });

    const rawJson = response.text;
    console.log(`Fish identification response: ${rawJson}`);

    if (rawJson) {
      const result: FishIdentificationResult = JSON.parse(rawJson);
      
      // Clean up the uploaded file
      fs.unlinkSync(imagePath);
      
      return result;
    } else {
      throw new Error("Empty response from Gemini model");
    }
  } catch (error) {
    // Clean up the uploaded file even if identification fails
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    throw new Error(`Failed to identify fish: ${error}`);
  }
}
