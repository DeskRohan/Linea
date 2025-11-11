
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ShopAddressPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/store/settings">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-lg font-semibold md:text-2xl">Shop Address</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Update Your Shop Address</CardTitle>
          <CardDescription>Enter the physical location of your store.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address1">Address Line 1</Label>
            <Input id="address1" placeholder="e.g., 123 Main St" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address2">Address Line 2</Label>
            <Input id="address2" placeholder="e.g., Suite 100" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="e.g., New York" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="state">State / Province</Label>
                <Input id="state" placeholder="e.g., NY" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="zip">Zip / Postal Code</Label>
                <Input id="zip" placeholder="e.g., 10001" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Address</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
