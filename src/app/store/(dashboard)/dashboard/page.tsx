
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
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

// This component is ready for dynamic data once order processing is implemented.

export default function StoreDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    newCustomers: 0,
    pendingOrders: 0,
  });
  const [recentSales, setRecentSales] = useState<any[]>([]);

  useEffect(() => {
    // In a real application, you would fetch this data from your 'orders' collection in Firestore.
    // Since we don't have that yet, we'll use an empty state.
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
            <p className="text-xs text-muted-foreground">No sales data yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">+{stats.totalSales}</div>}
             <p className="text-xs text-muted-foreground">No sales data yet</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">+{stats.newCustomers}</div>}
            <p className="text-xs text-muted-foreground">No customer data yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">+{stats.pendingOrders}</div>}
            <p className="text-xs text-muted-foreground">No pending orders</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Customers</CardTitle>
             <CardDescription>
                Your most recent customers will appear here.
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
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
                            <Skeleton className="h-8 w-full" />
                        </TableCell>
                    </TableRow>
                ) : recentSales.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
                            No recent sales.
                        </TableCell>
                    </TableRow>
                ) : (
                    recentSales.map((sale, index) => (
                        <TableRow key={index}>
                        <TableCell>
                            <div className="font-medium">{sale.customer}</div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                            {sale.email}
                            </div>
                        </TableCell>
                        <TableCell className="text-right">{sale.amount}</TableCell>
                        </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>
                Recent transactions from your store will show here.
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
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
                            <Skeleton className="h-8 w-full" />
                        </TableCell>
                    </TableRow>
                ) : recentSales.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
                            No recent sales.
                        </TableCell>
                    </TableRow>
                ) : (
                    recentSales.map((sale, index) => (
                        <TableRow key={index}>
                        <TableCell>
                            <div className="font-medium">{sale.customer}</div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                            {sale.email}
                            </div>
                        </TableCell>
                        <TableCell className="text-right">{sale.amount}</TableCell>
                        </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
