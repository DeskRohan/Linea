// /ai/genkit.ts
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { firebase } from "@genkit-ai/firebase";

// This file is required to initialize the Genkit AI and Firebase plugins.
// It is used by the Genkit development server and in production.

console.log("GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY ? "Loaded" : "NOT LOADED");


export const ai = genkit({
  plugins: [
    firebase(),
    googleAI({
      apiVersion: "v1beta",
    }),
  ],
  logSinks: [
    // Add sinks here.
  ],
  enableTracing: true, // Recommended for development
});
