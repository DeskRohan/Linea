
"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  CreditCard,
  DollarSign,
  Users,
  Loader2,
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
import { collection, onSnapshot, query, limit, orderBy, getCountFromServer } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";


export default function StoreDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    newCustomers: 0,
  });
  const [recentSales, setRecentSales] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const storeId = user.uid;

    // Real-time listener for recent orders
    const recentOrdersQuery = query(
      collection(firestore, "stores", storeId, "orders"),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const unsubscribeRecent = onSnapshot(recentOrdersQuery, (snapshot) => {
      const sales: any[] = [];
      snapshot.forEach((doc) => {
        sales.push({
          id: doc.id,
          customerName: doc.data().customerName || 'Unknown',
          totalAmount: doc.data().totalAmount,
        });
      });
      setRecentSales(sales);
      setLoading(false); // Stop loading after first data fetch
    }, (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: recentOrdersQuery.path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
    });

    // Real-time listener for all orders to calculate stats
    const allOrdersQuery = collection(firestore, "stores", storeId, "orders");
    const unsubscribeAll = onSnapshot(allOrdersQuery, (snapshot) => {
      let revenue = 0;
      const customerIds = new Set<string>();
      snapshot.forEach(doc => {
        const orderData = doc.data();
        revenue += orderData.totalAmount;
        customerIds.add(orderData.customerId);
      });
      setStats({
        totalRevenue: revenue,
        totalSales: snapshot.size,
        newCustomers: customerIds.size,
      });
    }, (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: allOrdersQuery.path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
    });

    return () => {
      unsubscribeRecent();
      unsubscribeAll();
    };
  }, [user, firestore]);

  const getInitials = (name: string) => {
    if (!name) return "?";
    const nameParts = name.split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <div className="flex items-center mb-4">
        <h1 className="text-lg font-semibold md:text-2xl">Welcome, Store Owner!</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading && stats.totalSales === 0 ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>}
            <p className="text-xs text-muted-foreground">From {stats.totalSales} sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading && stats.totalSales === 0 ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">+{stats.totalSales}</div>}
             <p className="text-xs text-muted-foreground">Total completed orders</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading && stats.newCustomers === 0 ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">+{stats.newCustomers}</div>}
            <p className="text-xs text-muted-foreground">Customers who made a purchase</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
             <CardDescription>
                Your most recent sales will appear here in real-time.
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
                        <TableCell colSpan={2} className="h-40 text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
                        </TableCell>
                    </TableRow>
                ) : recentSales.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={2} className="h-40 text-center text-muted-foreground">
                            No recent sales yet.
                        </TableCell>
                    </TableRow>
                ) : (
                    recentSales.map((sale) => (
                        <TableRow key={sale.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="hidden h-9 w-9 sm:flex">
                                    <AvatarFallback>{getInitials(sale.customerName)}</AvatarFallback>
                                </Avatar>
                                <div className="font-medium">{sale.customerName}</div>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(sale.totalAmount)}</TableCell>
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
