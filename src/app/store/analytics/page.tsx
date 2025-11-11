
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AnalyticsPage() {

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Store Analytics</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Your store's performance metrics.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Your analytics dashboard will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

    