
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell } from "recharts";
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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, Users, CreditCard, Activity } from "lucide-react";

// Mock data for the charts
const monthlySalesData = [
  { month: "January", sales: 4000 },
  { month: "February", sales: 3000 },
  { month: "March", sales: 5000 },
  { month: "April", sales: 4500 },
  { month: "May", sales: 6000 },
  { month: "June", sales: 7500 },
];

const topProductsData = [
  { name: "Instant Noodles", value: 400, fill: "var(--color-noodles)" },
  { name: "Green Tea", value: 300, fill: "var(--color-tea)" },
  { name: "Crackers", value: 300, fill: "var(--color-crackers)" },
  { name: "Chocolate", value: 200, fill: "var(--color-chocolate)" },
];

const chartConfig = {
  sales: {
    label: "Sales (INR)",
  },
  noodles: {
    label: "Instant Noodles",
    color: "hsl(var(--chart-1))",
  },
  tea: {
    label: "Green Tea",
    color: "hsl(var(--chart-2))",
  },
  crackers: {
    label: "Crispy Crackers",
    color: "hsl(var(--chart-3))",
  },
  chocolate: {
    label: "Chocolate Bar",
    color: "hsl(var(--chart-4))",
  },
};

const recentSales = [
    { customer: 'Liam Johnson', email: 'liam@example.com', amount: '₹20,800.00' },
    { customer: 'Olivia Smith', email: 'olivia@example.com', amount: '₹12,500.00' },
    { customer: 'Noah Williams', email: 'noah@example.com', amount: '₹29,100.00' },
    { customer: 'Emma Brown', email: 'emma@example.com', amount: '₹37,450.00' },
    { customer: 'James Jones', email: 'james@example.com', amount: '₹5,600.00' },
];

export default function AnalyticsPage() {
  return (
    <>
      <div className="flex items-center mb-4">
        <h1 className="text-lg font-semibold md:text-2xl">Store Analytics</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹3,764,231</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+120</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+57</div>
            <p className="text-xs text-muted-foreground">+2 since last hour</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales Overview</CardTitle>
            <CardDescription>January - June 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <BarChart accessibilityLayer data={monthlySalesData}>
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
            <CardDescription>January - June 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie data={topProductsData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                   {topProductsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="name" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <Card>
            <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>A list of the most recent transactions.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentSales.map((sale, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <div className="font-medium">{sale.customer}</div>
                                <div className="hidden text-sm text-muted-foreground md:inline">
                                {sale.email}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">{sale.amount}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
