
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, DollarSign, Crown, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useUser, useFirestore } from "@/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

interface Customer {
    uid: string;
    name: string;
    email: string;
    photoURL?: string;
    spent: number;
    orderCount: number;
}

export default function CustomersPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const storeId = user.uid;
    const ordersQuery = collection(firestore, "stores", storeId, "orders");

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
        const customerData: { [uid: string]: Customer } = {};

        snapshot.forEach(doc => {
            const order = doc.data();
            const uid = order.customerId;
            if (!customerData[uid]) {
                customerData[uid] = {
                    uid: uid,
                    name: order.customerName || "Unknown Customer",
                    email: order.customerEmail || "No email",
                    photoURL: order.customerPhotoURL,
                    spent: 0,
                    orderCount: 0
                };
            }
            customerData[uid].spent += order.totalAmount;
            customerData[uid].orderCount += 1;
        });

        const customerList = Object.values(customerData).sort((a,b) => b.spent - a.spent);
        setCustomers(customerList);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore]);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCustomers = filteredCustomers.length;
  const totalSpent = filteredCustomers.reduce((acc, customer) => acc + customer.spent, 0);
  const averageLTV = totalCustomers > 0 ? totalSpent / totalCustomers : 0;
  const topSpender = filteredCustomers.length > 0
    ? filteredCustomers.reduce((prev, current) => (prev.spent > current.spent) ? prev : current)
    : null;

  return (
    <>
      <div className="flex items-center mb-4">
        <h1 className="text-lg font-semibold md:text-2xl">Customer Management</h1>
      </div>

       <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{totalCustomers}</div>}
            <p className="text-xs text-muted-foreground">Customers with at least one order</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Lifetime Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{formatCurrency(averageLTV)}</div>}
            <p className="text-xs text-muted-foreground">Average customer spending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Spender</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold truncate">{topSpender ? topSpender.name : 'N/A'}</div>}
            <p className="text-xs text-muted-foreground">
              {topSpender ? formatCurrency(topSpender.spent) : 'No spending data'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Customers</CardTitle>
          <CardDescription>
            A list of all customers who have made a purchase, updated in real-time.
          </CardDescription>
           <div className="flex items-center gap-4 pt-4">
            <div className="relative w-full md:w-1/3">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    type="search" 
                    placeholder="Search customers..." 
                    className="pl-8" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
        </CardHeader>
        <CardContent>
           <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell text-center">Orders</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-40 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-40 text-center text-muted-foreground">
                      No customers have made purchases yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.uid}>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <Avatar className="hidden h-9 w-9 sm:flex">
                            <AvatarImage src={customer.photoURL} alt={customer.name} />
                            <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="grid gap-1">
                            <p className="text-sm font-medium leading-none">
                              {customer.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {customer.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-center">
                        {customer.orderCount}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(customer.spent)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </>
  );
}
