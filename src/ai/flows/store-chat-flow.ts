
'use server';

import { ai } from "@/ai/genkit";
import { z } from "genkit";

// For this example, we are using mock data tools.
// In a real application, these tools would query a database.
// We are also adding a tool to get real customer data.

// Since the store owner dashboard already uses the Firebase Client SDK
// to show analytics, we will create tools that also use the Client SDK.
// NOTE: Genkit flows run on the server, but they *can* use the client SDK
// if they are configured to do so (e.g. by passing credentials).
// For simplicity in this prototype, we will use mock data tools for sales
// and a tool that would theoretically use the Firebase Admin SDK for users.

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth, UserRecord } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// IMPORTANT: To use Firebase Admin SDK, you must set the
// FIREBASE_SERVICE_ACCOUNT_KEY environment variable.
// The value should be the JSON content of your service account key.
// In Firebase Studio, this is handled for you, but for local development,
// you would need to set this in your .env.local file.
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY && !getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  initializeApp({
    credential: cert(serviceAccount),
  });
}


const getTopCustomers = ai.defineTool(
  {
    name: "getTopCustomers",
    description: "Returns a list of all customers who have signed up.",
    outputSchema: z.any(),
  },
  async () => {
    // This function requires the Admin SDK. If not configured, it will fail.
    try {
      const listUsersResult = await getAuth().listUsers();
      return listUsersResult.users.map((user: UserRecord) => ({
        name: user.displayName || user.email || 'Unknown',
        email: user.email,
        // In a real app, 'spent' would come from aggregating an 'orders' collection.
        // We'll simulate it here.
        spent: Math.floor(Math.random() * 5000), 
      }));
    } catch (error) {
        console.error("Admin SDK error fetching users:", error);
        return "Could not fetch customer data. The Firebase Admin SDK may not be configured. Please check your environment variables.";
    }
  }
);


const getMonthlySales = ai.defineTool(
  {
    name: "getMonthlySales",
    description: "Returns the sales data for each month. NOTE: This is currently example data.",
    outputSchema: z.any(),
  },
  async () => {
    // In a real app, you would query an 'orders' collection in Firestore.
    return [
      { month: "January", sales: 4000 },
      { month: "February", sales: 3000 },
      { month: "March", sales: 5000 },
      { month: "April", sales: 4500 },
      { month: "May", sales: 6000 },
      { month: "June", sales: 7500 },
    ];
  }
);

const getTopProducts = ai.defineTool(
  {
    name: "getTopProducts",
    description: "Returns top selling products. NOTE: This is currently example data.",
    outputSchema: z.any(),
  },
  async () => {
    // In a real app, you would aggregate sales data from an 'orders' collection.
    return [
        { name: "Instant Noodles", value: 400 },
        { name: "Green Tea", value: 300 },
        { name: "Crackers", value: 300 },
        { name: "Chocolate", value: 200 },
    ];
  }
);

const getSalesByDay = ai.defineTool(
  {
    name: "getSalesByDay",
    description: "Returns sales by day of the week. NOTE: This is currently example data.",
    outputSchema: z.any(),
  },
  async () => {
     // In a real app, you would query an 'orders' collection.
    return [
        { day: "Mon", sales: 1200 },
        { day: "Tue", sales: 1500 },
        { day: "Wed", sales: 1800 },
        { day: "Thu", sales: 1700 },
        { day: "Fri", sales: 2500 },
        { day: "Sat", sales: 3200 },
        { day: "Sun", sales: 3000 },
    ];
  }
);

const getRecentSales = ai.defineTool(
  {
    name: "getRecentSales",
    description: "Returns recent sales. NOTE: This is currently example data.",
    outputSchema: z.any(),
  },
  async () => {
     // In a real app, you would query an 'orders' collection.
    return [
        { customer: "Liam Johnson", email: "liam@example.com", amount: "₹20,800.00" },
        { customer: "Olivia Smith", email: "olivia@example.com", amount: "₹12,500.00" },
        { customer: "Noah Williams", email: "noah@example.com", amount: "₹29,100.00" },
        { customer: "Emma Brown", email: "emma@example.com", amount: "₹37,450.00" },
    ];
  }
);


// -------- Chat Schemas --------
const ChatMessageSchema = z.object({
  role: z.enum(["user", "model", "tool", "system"]),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

const ChatHistorySchema = z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string()
}));
export type ChatHistory = z.infer<typeof ChatHistorySchema>;


// -------- Main Chat Function --------
export async function chatWithStoreBot(history: ChatHistory): Promise<{role: "assistant", content: string}> {
  try {
    const result = await storeAnalystFlow(history.map(m => ({...m, role: m.role === 'assistant' ? 'model' : 'user'})));
    return { role: "assistant", content: result };
  } catch (error: any) {
    console.error("💥 chatWithStoreBot failed:", error);
    return { role: "assistant", content: "Internal error occurred. Please check the server logs." };
  }
}

// -------- Flow Definition --------
export const storeAnalystFlow = ai.defineFlow(
  {
    name: "storeAnalystFlow",
    inputSchema: z.array(ChatMessageSchema),
    outputSchema: z.string(),
  },
  async (history) => {
    const systemPrompt = `
      You are Navya, an AI business analyst for a small grocery store.
      Your personality is friendly, helpful, and professional.
      When asked for data, use the provided tools.
      
      IMPORTANT: For any data related to sales, revenue, products, or orders, you MUST state that this is example data because the final order and payment system integration is not yet complete. However, you can provide real customer data if you use the correct tool.
      
      Analyze the results from the tools and provide a clear, concise, and insightful answer to the user.
      If you use a tool, present the data in a readable format. For example, for a list of customers, present it as a list, not a single block of text.
    `;
    
    // Map the incoming simple history to the format Genkit expects
    const messages = history.map(m => ({ role: m.role, content: m.content }));

    const llmResponse = await ai.generate({
      model: "gemini-1.5-flash-latest",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      tools: [
        getMonthlySales,
        getTopProducts,
        getSalesByDay,
        getRecentSales,
        getTopCustomers,
      ],
      // Adding a config to reduce the likelihood of the model refusing to answer.
      // In a real-world app, you'd want to carefully consider safety implications.
      config: {
        safetySettings: [
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_NONE',
            },
        ]
      }
    });

    // Check if the model decided to use a tool
    if (llmResponse.toolRequest) {
        const toolResponse = await llmResponse.toolRequest.run();
        const responseWithToolContent = await ai.generate({
             model: "gemini-1.5-flash-latest",
             messages: [
                { role: "system", content: systemPrompt },
                ...messages,
                llmResponse.message, // Include the model's request to use a tool
                { role: 'tool', content: toolResponse } // Include the tool's output
             ]
        });
        return responseWithToolContent.text;
    }


    return llmResponse.text;
  }
);
