
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useUser } from "@/firebase/auth/use-user";

export default function StoreDashboard() {
  const { user } = useUser();

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Welcome, {user?.displayName || "Store Owner"}!</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Dashboard</CardTitle>
              <CardDescription>Here's a quick overview of your store's performance.</CardDescription>
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </CardHeader>
          <CardContent>
            <p>You can manage your inventory, view analytics, and see customer information from the navigation bar above.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
