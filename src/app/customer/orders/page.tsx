
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { Loader2, Receipt, ShoppingBag, ArrowLeft } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

interface Order {
  id: string;
  storeName: string;
  totalAmount: number;
  totalItems: number;
  createdAt: { toDate: () => Date };
  status: string;
  storeId: string;
}

export default function CustomerOrdersPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !firestore) {
      if (!userLoading) setLoading(false);
      return;
    };

    setLoading(true);
    const ordersQuery = query(
      collection(firestore, 'orders'),
      where('customerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const userOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Order));
      setOrders(userOrders);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching user orders:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore, userLoading]);

  if (userLoading || loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
       <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
        <Card className="text-center p-8">
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription className="mt-2">You must be logged in to view your orders.</CardDescription>
            <Button asChild className="mt-6">
                <Link href="/login">
                    <ArrowLeft className="mr-2" />
                    Go to Login
                </Link>
            </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
           <Button variant="outline" size="icon" asChild>
                <Link href="/shopping"><ArrowLeft /></Link>
            </Button>
           <h1 className="text-2xl font-bold tracking-tight">My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-20 text-center">
            <CardHeader>
              <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <CardTitle>You have no orders yet.</CardTitle>
              <CardDescription>Start shopping to see your orders here.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/shopping">Start Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
               <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map(order => (
                    <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.storeName}</TableCell>
                        <TableCell>{order.createdAt.toDate().toLocaleDateString()}</TableCell>
                        <TableCell className="text-center">{order.totalItems}</TableCell>
                        <TableCell className="text-center">
                            <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                                {order.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
                         <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                               <Link href={`/invoice/${order.id}`}>
                                    <Receipt className="mr-2 h-4 w-4" />
                                    View Bill
                                </Link>
                            </Button>
                         </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
