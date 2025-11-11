
"use client";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpRight, Search, Users, DollarSign, Crown } from "lucide-react";
import Link from "next/link";

const mockCustomers = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    avatar: "https://picsum.photos/seed/1/50/50",
    signupDate: "2023-01-15",
    orders: 12,
    spent: 2580.50,
  },
  {
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    avatar: "https://picsum.photos/seed/2/50/50",
    signupDate: "2023-02-20",
    orders: 8,
    spent: 1750.00,
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    avatar: "https://picsum.photos/seed/3/50/50",
    signupDate: "2023-03-10",
    orders: 15,
    spent: 3205.75,
  },
  {
    name: "William Kim",
    email: "will@email.com",
    avatar: "https://picsum.photos/seed/4/50/50",
    signupDate: "2023-04-05",
    orders: 5,
    spent: 980.25,
  },
  {
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    avatar: "https://picsum.photos/seed/5/50/50",
    signupDate: "2023-05-21",
    orders: 20,
    spent: 4100.00,
  },
  {
    name: "Liam Johnson",
    email: "liam@example.com",
    avatar: "https://picsum.photos/seed/6/50/50",
    signupDate: "2023-06-18",
    orders: 2,
    spent: 350.00,
  }
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

export default function CustomersPage() {

  const totalCustomers = mockCustomers.length;
  const totalSpent = mockCustomers.reduce((acc, customer) => acc + customer.spent, 0);
  const averageLTV = totalSpent / totalCustomers;
  const topSpender = mockCustomers.reduce((prev, current) => (prev.spent > current.spent) ? prev : current);

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
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">+5 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Lifetime Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageLTV)}</div>
            <p className="text-xs text-muted-foreground">Average spend per customer</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Spender</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topSpender.name}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(topSpender.spent)} total spent
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Customers</CardTitle>
          <CardDescription>
            A list of all customers who have shopped at your store.
          </CardDescription>
           <div className="flex items-center gap-4 pt-4">
            <div className="relative w-full md:w-1/3">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search customers..." className="pl-8" />
            </div>
            <Button variant="outline">
                Export to CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
           <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Sign-up Date</TableHead>
                  <TableHead className="hidden md:table-cell text-center">Orders</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCustomers.map((customer) => (
                  <TableRow key={customer.email}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                          <AvatarImage src={customer.avatar} alt="Avatar" />
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
                    <TableCell className="hidden md:table-cell">
                      {customer.signupDate}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-center">
                      <Badge variant="secondary">{customer.orders}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(customer.spent)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </>
  );
}
