
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StoreDashboard() {

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Store Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Welcome, Store Owner! Manage your store from here.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
