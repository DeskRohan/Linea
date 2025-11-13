
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
        // The AI flow currently returns mock data. For a true empty state,
        // we will initialize with empty arrays. When the backend is fully
        // connected to a real order system, this will populate dynamically.
        setChartData({
            monthlySales: [],
            topProducts: [],
            salesByDay: [],
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

  const renderEmptyChart = (title: string) => (
     <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
        <Package size={32} className="mb-2 text-primary/50" />
        <p className="font-semibold text-base">{title}</p>
        <p className="text-xs">Data will appear here once you make sales.</p>
      </div>
  );

  return (
    <>
      <div className="flex items-center mb-4">
        <h1 className="text-lg font-semibold md:text-2xl">Store Analytics</h1>
      </div>
      <CardDescription className="mb-4">
        This dashboard shows live data from your store. Sales and revenue data will populate as you make sales.
      </CardDescription>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">₹0.00</div>}
            <p className="text-xs text-muted-foreground">No sales data</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">+0</div>}
            <p className="text-xs text-muted-foreground">No sales data</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">+0</div>}
             <p className="text-xs text-muted-foreground">No customer data</p>
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
            <Loader2 className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
            <h3 className="mt-4 text-lg font-semibold">Loading Analytics...</h3>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Sales Overview</CardTitle>
              <CardDescription>Sales data will appear here.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[350px] flex items-center justify-center">
              {chartData.monthlySales.length === 0 ? renderEmptyChart("Monthly Sales") : (
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
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Products by Revenue</CardTitle>
              <CardDescription>Top selling products will appear here.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[350px] flex items-center justify-center">
             {chartData.topProducts.length === 0 ? renderEmptyChart("Top Products") : (
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
             )}
            </CardContent>
          </Card>

           <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Sales by Day of the Week</CardTitle>
                <CardDescription>Your busiest days will be shown here.</CardDescription>
            </Header>
            <CardContent className="min-h-[350px] flex items-center justify-center">
                {chartData.salesByDay.length === 0 ? renderEmptyChart("Sales by Day") : (
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
                )}
            </CardContent>
            </Card>
        </div>
      )}
    </>
  );
}
