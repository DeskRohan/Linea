// /ai/dev.ts
// This file is used by Genkit when running in dev mode.
// Import flows here so they register correctly.

import "./flows/store-chat-flow";   // <-- REQUIRED

// You can import more flows here if you add them later.
// Example:
// import "./flows/inventory-flow";

console.log("Genkit Dev Mode: Flows loaded successfully.");
