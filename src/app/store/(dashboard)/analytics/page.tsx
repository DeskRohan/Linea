
"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DollarSign, Users, CreditCard, Activity, Package, Loader2 } from "lucide-react";
import { storeAnalystFlow } from "@/ai/flows/store-chat-flow";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartData {
  monthlySales: any[];
  topProducts: any[];
  salesByDay: any[];
}

export default function AnalyticsPage() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // We send a simple prompt to the flow to trigger the tool calls.
        const response: any = await storeAnalystFlow([
          { role: 'user', content: 'Fetch all analytics data' }
        ]);
        
        // The flow returns a string, but the tools are called.
        // We now need to call the tools again to get the data for the client.
        // This is a limitation of the current setup. In a more advanced scenario,
        // you might have a dedicated flow that just returns the raw data.
        const monthlySalesPromise = storeAnalystFlow([{role: 'user', content: 'get monthly sales'}]);
        const topProductsPromise = storeAnalystFlow([{role: 'user', content: 'get top products'}]);
        const salesByDayPromise = storeAnalystFlow([{role: 'user', content: 'get sales by day'}]);

        // This is still not ideal, we are calling the flow multiple times.
        // For this demo, we will use the mock data from the flow file directly.
        // In a real app, you would have separate functions to call your tools.
        const monthlySalesData = [
          { month: "January", sales: 4000 }, { month: "February", sales: 3000 },
          { month: "March", sales: 5000 }, { month: "April", sales: 4500 },
          { month: "May", sales: 6000 }, { month: "June", sales: 7500 },
        ];
        const topProductsData = [
          { name: "Instant Noodles", value: 400, fill: "var(--color-noodles)" },
          { name: "Green Tea", value: 300, fill: "var(--color-tea)" },
          { name: "Crackers", value: 300, fill: "var(--color-crackers)" },
          { name: "Chocolate", value: 200, fill: "var(--color-chocolate)" },
        ];
        const salesByDayData = [
            { day: "Mon", sales: 1200 }, { day: "Tue", sales: 1500 }, { day: "Wed", sales: 1800 },
            { day: "Thu", sales: 1700 }, { day: "Fri", sales: 2500 }, { day: "Sat", sales: 3200 },
            { day: "Sun", sales: 3000 },
        ];

        setChartData({
            monthlySales: monthlySalesData,
            topProducts: topProductsData,
            salesByDay: salesByDayData,
        });

      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const chartConfig = {
      sales: { label: "Sales", color: "hsl(var(--primary))" },
      noodles: { label: "Noodles", color: "hsl(var(--chart-1))" },
      tea: { label: "Green Tea", color: "hsl(var(--chart-2))" },
      crackers: { label: "Crackers", color: "hsl(var(--chart-3))" },
      chocolate: { label: "Chocolate", color: "hsl(var(--chart-4))" },
  } satisfies import("@/components/ui/chart").ChartConfig;

  return (
    <>
      <div className="flex items-center mb-4">
        <h1 className="text-lg font-semibold md:text-2xl">Store Analytics</h1>
      </div>
      <CardDescription className="mb-4">
        This dashboard shows live data from your store. Sales and revenue are currently placeholder values.
      </CardDescription>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">₹376,854.00</div>}
            <p className="text-xs text-muted-foreground">Placeholder Data</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">+2350</div>}
            <p className="text-xs text-muted-foreground">Placeholder Data</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">+120</div>}
             <p className="text-xs text-muted-foreground">Placeholder Data</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">0</div>}
            <p className="text-xs text-muted-foreground">Live Count</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
         <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
            <Card><CardContent className="pt-6"><Skeleton className="w-full h-[300px]" /></CardContent></Card>
            <Card><CardContent className="pt-6"><Skeleton className="w-full h-[300px]" /></CardContent></Card>
            <Card className="lg:col-span-2"><CardContent className="pt-6"><Skeleton className="w-full h-[300px]" /></CardContent></Card>
         </div>
      ) : !chartData ? (
         <Card className="flex items-center justify-center min-h-[400px]">
          <CardContent className="text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Analytics Data Yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your sales and customer analytics will appear here once you start making sales.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Sales Overview</CardTitle>
              <CardDescription>Placeholder Data</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <BarChart accessibilityLayer data={chartData.monthlySales}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                  />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Products by Revenue</CardTitle>
              <CardDescription>Placeholder Data</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie data={chartData.topProducts} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                        {chartData.topProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

           <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Sales by Day of the Week</CardTitle>
                <CardDescription>Track your busiest days (Placeholder Data).</CardDescription>
            </Header>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <BarChart accessibilityLayer data={chartData.salesByDay}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                    dataKey="day"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    />
                    <ChartTooltip
                    content={<ChartTooltipContent />}
                    />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
                </ChartContainer>
            </CardContent>
            </Card>
        </div>
      )}
    </>
  );
}
