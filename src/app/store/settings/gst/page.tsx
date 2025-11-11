
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ShopGstPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/store/settings">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-lg font-semibold md:text-2xl">GST Details</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Update Your GSTIN</CardTitle>
          <CardDescription>Enter your Goods and Services Tax Identification Number.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gstin">GSTIN</Label>
            <Input id="gstin" placeholder="Enter your 15-digit GSTIN" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save GSTIN</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
