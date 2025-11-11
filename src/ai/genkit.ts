// /ai/genkit.ts
import { Genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai"; // ✅ correct package name

// ✅ Initialize Genkit with your Gemini API key
export const ai = new Genkit({
  plugins: [
    googleAI({
      apiVersion: "v1beta",
      apiKey: process.env.GOOGLE_API_KEY, // load from .env.local
    }),
  ],
});
