import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import { GoogleGenAI } from "@google/genai";


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function callGemini(prompt) {
  console.log(`Prompt 🌐 ${prompt}`);
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-05-20",
    contents: prompt,
  });

  const responseText = response.text;
  // Save the raw response for debugging
  

  // Extract JSON from the response
  try {
    // Check if response contains JSON inside code blocks
    if (responseText.includes("```json")) {
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1].trim());
      }
    }

    // Check for JSON array directly
    if (
      responseText.trim().startsWith("[") &&
      responseText.trim().endsWith("]")
    ) {
      return JSON.parse(responseText.trim());
    }

    // Check for JSON object directly
    if (
      responseText.trim().startsWith("{") &&
      responseText.trim().endsWith("}")
    ) {
        
      return JSON.parse(responseText.trim());
    }

    // If we couldn't parse JSON, return empty array to avoid errors
    console.error("Could not parse JSON from Gemini response");
    return [];
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    // Return empty array to avoid mapping errors
    return [];
  }
}

// Add a test function to verify JSON parsing
async function testGemini() {
  const result = await callGemini(
    "Generate 2 MCQs on computer science in JSON format with fields: question, options (array of 4), correctIndex"
  );
  console.log("Parsed result:", result);
  console.log("Is array:", Array.isArray(result));
  console.log("Length:", result.length);
}

// Uncomment to test
// testGemini();

export { callGemini };
