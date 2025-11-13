'use server';

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { UserRecord, getAuth } from "firebase-admin/auth";

// Initialize Firebase Admin SDK
// This is necessary for server-side operations.
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}
const db = getFirestore();
const auth = getAuth();


// -------- Define Tools with Dynamic Firestore Data --------

// This tool is a placeholder as we don't have order data yet.
const getMonthlySales = ai.defineTool(
  {
    name: "getMonthlySales",
    description: "Returns the sales data for each month. NOTE: This is currently mock data.",
    outputSchema: z.any(),
  },
  async () => {
     // In a real app, you would query an 'orders' collection.
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

// This tool is a placeholder as we don't have order data yet.
const getTopProducts = ai.defineTool(
  {
    name: "getTopProducts",
    description: "Returns top selling products. NOTE: This is currently mock data.",
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

// This tool is a placeholder as we don't have order data yet.
const getSalesByDay = ai.defineTool(
  {
    name: "getSalesByDay",
    description: "Returns sales by day. NOTE: This is currently mock data.",
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

// This tool is a placeholder as we don't have order data yet.
const getRecentSales = ai.defineTool(
  {
    name: "getRecentSales",
    description: "Returns recent sales. NOTE: This is currently mock data.",
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


const getTopCustomers = ai.defineTool(
  {
    name: "getTopCustomers",
    description: "Returns a list of all customers who have signed up.",
    outputSchema: z.any(),
  },
  async () => {
    const listUsersResult = await auth.listUsers();
    return listUsersResult.users.map((user: UserRecord) => ({
      name: user.displayName || user.email || 'Unknown',
      email: user.email,
      // 'spent' would come from an 'orders' collection in a real app
      spent: Math.floor(Math.random() * 5000), 
    }));
  }
);

// -------- Chat Schemas --------
const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

const ChatHistorySchema = z.array(ChatMessageSchema);
export type ChatHistory = z.infer<typeof ChatHistorySchema>;

// -------- Main Chat Function --------
export async function chatWithStoreBot(history: ChatHistory): Promise<ChatMessage> {
  try {
    const result = await storeAnalystFlow(history);
    return { role: "assistant", content: result };
  } catch (error: any) {
    console.error("💥 chatWithStoreBot failed:", error);
    return { role: "assistant", content: "Internal error occurred." };
  }
}

// -------- Flow Definition --------
export const storeAnalystFlow = ai.defineFlow(
  {
    name: "storeAnalystFlow",
    inputSchema: ChatHistorySchema,
    outputSchema: z.string(),
  },
  async (history) => {
    const systemPrompt = `
      You are Navya, an AI business analyst for a small grocery store.
      Answer only using the data from tools.
      Be friendly, accurate, and helpful.
      If data for sales, revenue, or top products is requested, inform the user that this is currently example data because the order and payment system has not been implemented yet.
      However, you can provide real customer data.
    `;

    const llmResponse = await ai.generate({
      model: "models/gemini-1.5-flash", // FREE TIER SUPPORTED MODEL
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
      ],
      tools: [
        getMonthlySales,
        getTopProducts,
        getSalesByDay,
        getRecentSales,
        getTopCustomers,
      ],
    });

    return llmResponse.text;
  }
);
