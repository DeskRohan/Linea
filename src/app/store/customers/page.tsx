
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CustomersPage() {

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Customer Management</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Your Customers</CardTitle>
            <CardDescription>A list of all customers who have shopped at your store.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Your customer list will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

    