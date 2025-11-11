
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ShopSettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Shop Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Settings Column */}
        <div className="md:col-span-2 grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Shop Details</CardTitle>
              <CardDescription>
                This information will appear on your invoices and store profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="shop-name">Shop Name</Label>
                <Input id="shop-name" type="text" className="w-full" defaultValue="The Corner Collection" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="shop-address">Shop Address</Label>
                <Textarea
                  id="shop-address"
                  defaultValue="#123 Main Road, Pawai, Mumbai - 488446"
                  className="min-h-24"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Branding & Customization</CardTitle>
              <CardDescription>
                Add a custom note to your invoices and set a prefix.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="invoice-prefix">Invoice Prefix (Optional)</Label>
                <Input id="invoice-prefix" defaultValue="TCC-" />
                <p className="text-xs text-muted-foreground">Set a prefix for your bill numbers.</p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="invoice-footer">Invoice Footer Note (Optional)</Label>
                <Textarea
                  id="invoice-footer"
                  defaultValue="Thank you for your business"
                  className="min-h-24"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar/Action Column */}
        <div className="md:col-span-1 grid gap-8 auto-rows-min">
          <Card>
            <CardHeader>
              <CardTitle>Save Changes</CardTitle>
              <CardDescription>
                Click the button below to apply all your new settings.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full">Save All Settings</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact & Tax</CardTitle>
              <CardDescription>
                Your business contact and tax information.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="whatsapp">Business WhatsApp Number</Label>
                <Input id="whatsapp" defaultValue="9110219701" />
                <p className="text-xs text-muted-foreground">Used for sharing bills.</p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="gstin">GSTIN (Optional)</Label>
                <Input id="gstin" defaultValue="294TXQL08JS11Z" />
                <p className="text-xs text-muted-foreground">Your Goods and Services Tax ID.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Invoice Terms & Conditions</CardTitle>
              <CardDescription>
                This text will appear on the bottom of every invoice.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  defaultValue="1. Once items sold will not be taken back.
2. Warrenty will be claimed if there is valid proof (INVOICE)."
                  className="min-h-32"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
