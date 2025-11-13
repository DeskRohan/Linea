
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

    // Real-time listener for orders
    const ordersQuery = query(
      collection(firestore, "stores", storeId, "orders"),
      orderBy("createdAt", "desc"),
      limit(5) // Get the 5 most recent sales
    );

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      let totalRevenue = 0;
      let totalSales = 0;
      const sales: any[] = [];

      snapshot.forEach((doc) => {
        const order = doc.data();
        totalRevenue += order.totalAmount;
        totalSales++;
        sales.push({
            id: doc.id,
            customerName: order.customerName || 'Unknown',
            totalAmount: order.totalAmount,
        });
      });
      
      setRecentSales(sales);

      // For total stats, we listen to the whole collection
      const allOrdersQuery = collection(firestore, "stores", storeId, "orders");
      onSnapshot(allOrdersQuery, (allDocsSnapshot) => {
          let revenue = 0;
          allDocsSnapshot.forEach(doc => {
              revenue += doc.data().totalAmount;
          });
          setStats(prev => ({ ...prev, totalRevenue: revenue, totalSales: allDocsSnapshot.size }));
      });

      setLoading(false);
    });

    // Real-time listener for new customers
    // Note: This only counts users who have made a purchase if you only track them via orders.
    // For a full customer list, you'd query the main 'users' collection if you had one.
    // For this app, let's count unique customers from orders.
    const allOrdersQuery = collection(firestore, "stores", storeId, "orders");
    const unsubscribeCustomers = onSnapshot(allOrdersQuery, (snapshot) => {
        const customerIds = new Set<string>();
        snapshot.forEach(doc => {
            customerIds.add(doc.data().customerId);
        });
        setStats(prev => ({...prev, newCustomers: customerIds.size }));
    });


    return () => {
      unsubscribeOrders();
      unsubscribeCustomers();
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
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>}
            <p className="text-xs text-muted-foreground">From {stats.totalSales} sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">+{stats.totalSales}</div>}
             <p className="text-xs text-muted-foreground">Total completed orders</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">+{stats.newCustomers}</div>}
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
