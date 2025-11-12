
'use server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// --- Mock Data (same as before) ---
const monthlySalesData = [
  { month: 'January', sales: 4000 },
  { month: 'February', sales: 3000 },
  { month: 'March', sales: 5000 },
  { month: 'April', sales: 4500 },
  { month: 'May', sales: 6000 },
  { month: 'June', sales: 7500 },
];

const topProductsData = [
  { name: 'Instant Noodles', value: 400, fill: 'var(--color-noodles)' },
  { name: 'Green Tea', value: 300, fill: 'var(--color-tea)' },
  { name: 'Crackers', value: 300, fill: 'var(--color-crackers)' },
  { name: 'Chocolate', value: 200, fill: 'var(--color-chocolate)' },
];

const salesByDayData = [
  { day: 'Mon', sales: 1200 },
  { day: 'Tue', sales: 1500 },
  { day: 'Wed', sales: 1800 },
  { day: 'Thu', sales: 1700 },
  { day: 'Fri', sales: 2500 },
  { day: 'Sat', sales: 3200 },
  { day: 'Sun', sales: 3000 },
];

const recentSales = [
  { customer: 'Liam Johnson', email: 'liam@example.com', amount: '₹20,800.00' },
  { customer: 'Olivia Smith', email: 'olivia@example.com', amount: '₹12,500.00' },
  { customer: 'Noah Williams', email: 'noah@example.com', amount: '₹29,100.00' },
  { customer: 'Emma Brown', email: 'emma@example.com', amount: '₹37,450.00' },
];

const mockCustomers = [
  { name: 'Olivia Martin', email: 'olivia.martin@email.com', spent: 2580.5 },
  { name: 'Jackson Lee', email: 'jackson.lee@email.com', spent: 1750.0 },
  { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', spent: 3205.75 },
  { name: 'William Kim', email: 'will@email.com', spent: 980.25 },
  { name: 'Sofia Davis', email: 'sofia.davis@email.com', spent: 4100.0 },
];

// --- Define Tools ---
const getMonthlySales = ai.defineTool(
  {
    name: 'getMonthlySales',
    description: 'Returns the sales data for each month.',
    outputSchema: z.any(),
  },
  async () => monthlySalesData
);

const getTopProducts = ai.defineTool(
  {
    name: 'getTopProducts',
    description: 'Returns the top selling products by revenue.',
    outputSchema: z.any(),
  },
  async () => topProductsData
);

const getSalesByDay = ai.defineTool(
  {
    name: 'getSalesByDay',
    description: 'Returns the sales data for each day of the week.',
    outputSchema: z.any(),
  },
  async () => salesByDayData
);

const getRecentSales = ai.defineTool(
  {
    name: 'getRecentSales',
    description: 'Returns a list of the most recent sales transactions.',
    outputSchema: z.any(),
  },
  async () => recentSales
);

const getTopCustomers = ai.defineTool(
  {
    name: 'getTopCustomers',
    description: 'Returns a list of customers and their total spending.',
    outputSchema: z.any(),
  },
  async () => mockCustomers
);

// --- Schemas ---
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

const ChatHistorySchema = z.array(ChatMessageSchema);
export type ChatHistory = z.infer<typeof ChatHistorySchema>;

// --- Main Chat Function ---
export async function chatWithStoreBot(history: ChatHistory): Promise<ChatMessage> {
  try {
    const result = await storeAnalystFlow(history);
    // The result from the flow is just a string, so we wrap it
    return { role: 'model', content: result };
  } catch (error: any) {
    console.error('💥 chatWithStoreBot failed:', error);
    // Provide a more user-friendly error message
    return { role: 'model', content: 'Sorry, I encountered an internal error while analyzing the data. Please check the server logs for details.' };
  }
}

// --- The Flow Definition ---
const storeAnalystFlow = ai.defineFlow(
  {
    name: 'storeAnalystFlow',
    inputSchema: ChatHistorySchema,
    outputSchema: z.string(),
  },
  async (history) => {
    const systemPrompt = `
      You are Navya, an AI business analyst for a local shop owner.
      Your goal is to answer questions about the store's performance based on the data available through the provided tools.
      Be friendly, conversational, and helpful.
      When asked about top products or customers, provide a clear, ranked list.
      When asked for sales data, summarize the key trends.
      If you don't know the answer or the data is not available, just say so.
      Do not make up any information. Only use the information provided by the tools.
    `;

    const llmResponse = await ai.generate({
      model: 'google/gemini-2.5-flash',
      system: systemPrompt,
      history: history,
      tools: [getMonthlySales, getTopProducts, getSalesByDay, getRecentSales, getTopCustomers],
    });

    // The Genkit `generate` call with tools will automatically handle the tool-calling loop.
    // We can directly return the final text response.
    return llmResponse.text;
  }
);
