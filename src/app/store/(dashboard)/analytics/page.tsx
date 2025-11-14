
"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell, ResponsiveContainer, Legend } from "recharts";
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
import { useUser, useFirestore } from "@/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

interface MonthlySale {
  month: string;
  sales: number;
}

interface TopProduct {
    name: string;
    value: number;
    fill: string;
}

interface SalesByDay {
    day: string;
    sales: number;
}

interface ChartData {
  monthlySales: MonthlySale[];
  topProducts: TopProduct[];
  salesByDay: SalesByDay[];
}

interface Stats {
    totalRevenue: number;
    totalSales: number;
    activeNow: number;
}

export default function AnalyticsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const storeId = user.uid;
    const ordersQuery = collection(firestore, "stores", storeId, "orders");

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      if (snapshot.empty) {
        setChartData({ monthlySales: [], topProducts: [], salesByDay: [] });
        setStats({ totalRevenue: 0, totalSales: 0, activeNow: 0 });
        setLoading(false);
        return;
      }

      let totalRevenue = 0;
      const monthlySales: { [key: string]: number } = {};
      const topProducts: { [key: string]: number } = {};
      const salesByDay: { [key: string]: number } = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0};

      snapshot.forEach((doc) => {
        const order = doc.data();
        totalRevenue += order.totalAmount;

        const date = order.createdAt.toDate();
        const month = date.toLocaleString('default', { month: 'long' });
        monthlySales[month] = (monthlySales[month] || 0) + order.totalAmount;
        
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        salesByDay[day] = (salesByDay[day] || 0) + order.totalAmount;

        order.items.forEach((item: any) => {
          topProducts[item.name] = (topProducts[item.name] || 0) + item.price * item.quantity;
        });
      });

      const formattedMonthlySales = Object.entries(monthlySales).map(([month, sales]) => ({ month, sales }));
      
      const chartColors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
      const formattedTopProducts = Object.entries(topProducts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, value], i) => ({ name, value, fill: chartColors[i % chartColors.length] }));

      const formattedSalesByDay = Object.entries(salesByDay).map(([day, sales]) => ({day, sales}));


      setChartData({
        monthlySales: formattedMonthlySales,
        topProducts: formattedTopProducts,
        salesByDay: formattedSalesByDay,
      });

      setStats({
          totalRevenue: totalRevenue,
          totalSales: snapshot.size,
          activeNow: 0, // Placeholder for active users
      });

      setLoading(false);
    }, (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: ordersQuery.path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore]);

  const chartConfig = {
      sales: { label: "Sales", color: "hsl(var(--primary))" },
      // Add dynamic config for products
      ...chartData?.topProducts.reduce((acc, p) => ({...acc, [p.name]: {label: p.name, color: p.fill}}), {})
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
        This dashboard shows live data from your store, updated in real-time.
      </CardDescription>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue ?? 0)}</div>}
            <p className="text-xs text-muted-foreground">From {stats?.totalSales ?? 0} sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">+{stats?.totalSales ?? 0}</div>}
            <p className="text-xs text-muted-foreground">Completed orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">+0</div>}
             <p className="text-xs text-muted-foreground">Real-time count coming soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats?.activeNow ?? 0}</div>}
            <p className="text-xs text-muted-foreground">Live shoppers</p>
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
              <CardDescription>Your total revenue per month.</CardDescription>
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
                    content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />}
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
              <CardDescription>Your best-selling products.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[350px] flex items-center justify-center">
             {chartData.topProducts.length === 0 ? renderEmptyChart("Top Products") : (
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel formatter={(value) => formatCurrency(value as number)} />}
                    />
                    <Pie data={chartData.topProducts} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                        {chartData.topProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                     <Legend content={<ChartLegendContent />} />
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
            </CardHeader>
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
                        content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />}
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

const ChartLegendContent = (props: any) => {
  const { payload } = props;
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-4 text-sm text-muted-foreground">
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span>{entry.payload.name}</span>
        </div>
      ))}
    </div>
  );
};
