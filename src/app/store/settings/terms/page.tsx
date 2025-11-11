
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ShopTermsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/store/settings">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-lg font-semibold md:text-2xl">Terms & Conditions</h1>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Edit Your Terms & Conditions</CardTitle>
          <CardDescription>Define the rules and guidelines for your customers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea id="terms" placeholder="Enter your terms and conditions here..." className="min-h-[300px]" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Terms</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
