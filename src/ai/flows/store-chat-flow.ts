
'use server';
/**
 * @fileOverview A store analyst AI agent that can answer questions about store performance.
 *
 * - chatWithStoreBot - A function that handles the chat interaction.
 * - ChatMessage - The type for a single chat message.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Mock Data - In a real app, this would come from a database or API.
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
  { name: "Olivia Martin", email: "olivia.martin@email.com", spent: 2580.50, },
  { name: "Jackson Lee", email: "jackson.lee@email.com", spent: 1750.00, },
  { name: "Isabella Nguyen", email: "isabella.nguyen@email.com", spent: 3205.75, },
  { name: "William Kim", email: "will@email.com", spent: 980.25, },
  { name: "Sofia Davis", email: "sofia.davis@email.com", spent: 4100.00, },
];


// Define Tools
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
        description: 'Returns a list of customers, which can be sorted to find top customers by spending.',
        outputSchema: z.any(),
    },
    async () => mockCustomers
);

// Define Chat History Schema
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'bot', 'system']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

const ChatHistorySchema = z.array(ChatMessageSchema);
export type ChatHistory = z.infer<typeof ChatHistorySchema>;


// Define the main chat function to be called from the client
export async function chatWithStoreBot(history: ChatHistory): Promise<ChatMessage> {
  const result = await storeAnalystFlow(history);
  return { role: 'bot', content: result };
}

// Define the Genkit Flow
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
      history: [{role: 'system', content: systemPrompt}, ...history],
      tools: [getMonthlySales, getTopProducts, getSalesByDay, getRecentSales, getTopCustomers],
    });

    return llmResponse.text;
  }
);
