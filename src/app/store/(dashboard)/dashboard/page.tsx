
"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  CreditCard,
  DollarSign,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser, useFirestore } from "@/firebase";
import { collection, onSnapshot, query, limit, getCountFromServer, orderBy } from "firebase/firestore";
import { getAuth, type UserRecord } from "firebase-admin/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

// Note: Most of this data is now static or placeholder as we don't have an "orders" collection yet.
// This component is ready for dynamic data once order processing is implemented.

export default function StoreDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 3764231.89, // Mock
    totalSales: 2350, // Mock
    newCustomers: 120, // Mock
    pendingOrders: 573, // Mock
  });
  const [recentSales, setRecentSales] = useState([ // Mock
      { customer: "Liam Johnson", email: "liam@example.com", amount: "₹20,800.00" },
      { customer: "Olivia Smith", email: "olivia@example.com", amount: "₹12,500.00" },
      { customer: "Noah Williams", email: "noah@example.com", amount: "₹29,100.00" },
      { customer: "Emma Brown", email: "emma@example.com", amount: "₹37,450.00" },
      { customer: "Liam Johnson", email: "liam@example.com", amount: "₹20,800.00" },
  ]);

  useEffect(() => {
    // In a real application, you would fetch this data from your 'orders' collection in Firestore.
    // Since we don't have that yet, we'll stick with mock data and set loading to false.
    setLoading(false);
  }, []);

  return (
    <>
      <div className="flex items-center mb-4">
        <h1 className="text-lg font-semibold md:text-2xl">Welcome, Store Owner!</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>}
            {loading ? <Skeleton className="h-4 w-1/2 mt-1" /> : <p className="text-xs text-muted-foreground">+20.1% from last month</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">+{stats.totalSales}</div>}
            {loading ? <Skeleton className="h-4 w-1/2 mt-1" /> : <p className="text-xs text-muted-foreground">+180.1% from last month</p>}
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">+{stats.newCustomers}</div>}
            {loading ? <Skeleton className="h-4 w-1/2 mt-1" /> : <p className="text-xs text-muted-foreground">+15% from last month</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">+{stats.pendingOrders}</div>}
            {loading ? <Skeleton className="h-4 w-1/2 mt-1" /> : <p className="text-xs text-muted-foreground">+201 since last hour</p>}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Customers</CardTitle>
             <CardDescription>
                This data is a placeholder until the payment system is live.
              </CardDescription>
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
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>
                Recent transactions from your store (Placeholder Data).
              </CardDescription>
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
