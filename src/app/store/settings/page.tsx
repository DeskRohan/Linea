
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Landmark, Gavel, FileText } from "lucide-react";

export default function ShopSettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shop Settings</h1>
          <p className="text-muted-foreground">
            Manage your store details and preferences.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Shop Address
              </CardTitle>
              <CardDescription>
                Update your physical store location and contact info.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button>Edit Address</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5" />
                GST Details
              </CardTitle>
              <CardDescription>
                Manage your Goods and Services Tax information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button>Update GSTIN</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="h-5 w-5" />
                Terms & Conditions
              </CardTitle>
              <CardDescription>
                Define the terms of service for your customers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button>Edit Terms</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Receipt Templates
              </CardTitle>
              <CardDescription>
                Choose and customize the look of your receipts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button>Manage Templates</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
