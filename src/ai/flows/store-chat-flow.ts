'use server';

import { ai } from "@/ai/genkit";
import { z } from "genkit";

// -------- Mock Data --------
const monthlySalesData = [
  { month: "January", sales: 4000 },
  { month: "February", sales: 3000 },
  { month: "March", sales: 5000 },
  { month: "April", sales: 4500 },
  { month: "May", sales: 6000 },
  { month: "June", sales: 7500 },
];

const topProductsData = [
  { name: "Instant Noodles", value: 400 },
  { name: "Green Tea", value: 300 },
  { name: "Crackers", value: 300 },
  { name: "Chocolate", value: 200 },
];

const salesByDayData = [
  { day: "Mon", sales: 1200 },
  { day: "Tue", sales: 1500 },
  { day: "Wed", sales: 1800 },
  { day: "Thu", sales: 1700 },
  { day: "Fri", sales: 2500 },
  { day: "Sat", sales: 3200 },
  { day: "Sun", sales: 3000 },
];

const recentSales = [
  { customer: "Liam Johnson", email: "liam@example.com", amount: "₹20,800.00" },
  { customer: "Olivia Smith", email: "olivia@example.com", amount: "₹12,500.00" },
  { customer: "Noah Williams", email: "noah@example.com", amount: "₹29,100.00" },
  { customer: "Emma Brown", email: "emma@example.com", amount: "₹37,450.00" },
];

const mockCustomers = [
  { name: "Olivia Martin", email: "olivia.martin@email.com", spent: 2580.5 },
  { name: "Jackson Lee", email: "jackson.lee@email.com", spent: 1750.0 },
  { name: "Isabella Nguyen", email: "isabella.nguyen@email.com", spent: 3205.75 },
  { name: "William Kim", email: "will@email.com", spent: 980.25 },
  { name: "Sofia Davis", email: "sofia.davis@email.com", spent: 4100.0 },
];

// -------- Define Tools --------
const getMonthlySales = ai.defineTool(
  {
    name: "getMonthlySales",
    description: "Returns the sales data for each month.",
    outputSchema: z.any(),
  },
  async () => monthlySalesData
);

const getTopProducts = ai.defineTool(
  {
    name: "getTopProducts",
    description: "Returns top selling products.",
    outputSchema: z.any(),
  },
  async () => topProductsData
);

const getSalesByDay = ai.defineTool(
  {
    name: "getSalesByDay",
    description: "Returns sales by day.",
    outputSchema: z.any(),
  },
  async () => salesByDayData
);

const getRecentSales = ai.defineTool(
  {
    name: "getRecentSales",
    description: "Returns recent sales.",
    outputSchema: z.any(),
  },
  async () => recentSales
);

const getTopCustomers = ai.defineTool(
  {
    name: "getTopCustomers",
    description: "Returns customer spend list.",
    outputSchema: z.any(),
  },
  async () => mockCustomers
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
      If data isn't available, say so.
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
