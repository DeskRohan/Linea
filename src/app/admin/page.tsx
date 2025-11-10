"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Admin Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Welcome, Admin! This is your control panel.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
