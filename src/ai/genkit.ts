// /ai/genkit.ts
import { Genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

console.log("GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY ? "Loaded" : "NOT LOADED");

export const ai = new Genkit({
  plugins: [
    googleAI({
      apiVersion: "v1beta",
      apiKey: process.env.GOOGLE_API_KEY,  // MUST be a Google Cloud backend key
    }),
  ],
});
