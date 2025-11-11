
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ShopReceiptsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/store/settings">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-lg font-semibold md:text-2xl">Receipt Templates</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Select a Receipt Template</CardTitle>
          <CardDescription>Choose the design for your customer receipts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <RadioGroup defaultValue="template-1" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Label htmlFor="template-1" className="cursor-pointer">
                <Card className="hover:border-primary">
                    <CardContent className="p-4 flex flex-col items-center justify-center aspect-square gap-2">
                       <RadioGroupItem value="template-1" id="template-1" className="sr-only" />
                        <div className="w-full h-24 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">Template 1 Preview</div>
                        <p className="font-medium">Modern</p>
                    </CardContent>
                </Card>
               </Label>
               <Label htmlFor="template-2" className="cursor-pointer">
                 <Card className="hover:border-primary">
                    <CardContent className="p-4 flex flex-col items-center justify-center aspect-square gap-2">
                        <RadioGroupItem value="template-2" id="template-2" className="sr-only" />
                        <div className="w-full h-24 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">Template 2 Preview</div>
                        <p className="font-medium">Classic</p>
                    </CardContent>
                </Card>
                </Label>
                <Label htmlFor="template-3" className="cursor-pointer">
                 <Card className="hover:border-primary">
                    <CardContent className="p-4 flex flex-col items-center justify-center aspect-square gap-2">
                        <RadioGroupItem value="template-3" id="template-3" className="sr-only" />
                        <div className="w-full h-24 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">Template 3 Preview</div>
                        <p className="font-medium">Minimalist</p>
                    </CardContent>
                </Card>
                </Label>
            </RadioGroup>
        </CardContent>
        <CardFooter>
          <Button>Save Template</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
