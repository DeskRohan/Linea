

"use client";

import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface StoreSettings {
  shopName: string;
  shopAddress: string;
  invoicePrefix: string;
  invoiceFooter: string;
  whatsapp: string;
  gstin: string;
  terms: string;
  receiptTemplate: string;
}

export default function ShopSettingsPage() {
  const { toast } = useToast();

  const [settings, setSettings] = useState<StoreSettings>({
    shopName: "My Awesome Store",
    shopAddress: "123 Main Street, Anytown, 12345",
    invoicePrefix: "INV-",
    invoiceFooter: "Thank you for your business!",
    whatsapp: "9876543210",
    gstin: "29AABCU9603R1ZM",
    terms: "1. All sales are final. 2. No returns or exchanges.",
    receiptTemplate: "classic",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setSettings((prev) => ({ ...prev, [id]: value }));
  };

  const handleTemplateChange = (value: string) => {
    setSettings((prev) => ({ ...prev, receiptTemplate: value }));
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    // Mock saving
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings Saved (Mock)",
        description: "Your store settings have been updated.",
        action: <Check className="h-5 w-5 text-green-500" />,
      });
    }, 1000);
  };

  const TemplatePreview = ({ name, id }: { name: string, id: string }) => {
    const isSelected = settings.receiptTemplate === id;
    return (
      <div
        className={cn(
          "rounded-lg border-2 p-4 cursor-pointer transition-all",
          isSelected ? "border-primary ring-2 ring-primary" : "border-muted"
        )}
        onClick={() => handleTemplateChange(id)}
      >
        <div className="flex items-center space-x-4 mb-4">
          <RadioGroupItem value={id} id={`template-radio-${id}`} />
          <Label htmlFor={`template-radio-${id}`} className="text-base font-medium cursor-pointer">{name}</Label>
        </div>
        <div className="h-64 bg-white rounded-md shadow-inner p-2 border">
            {id === 'classic' && (
                <div className="w-full h-full text-[6px] leading-tight text-gray-800 font-mono bg-white p-2">
                  <div className="text-center mb-2">
                      <p className="font-bold text-[7px]">YOUR AWESOME STORE</p>
                      <p>123 Main Street, Anytown</p>
                      <p>GSTIN: 29AABCU9603R1ZM</p>
                      <p>--------------------------</p>
                  </div>
                  <div className="flex justify-between"><p>Instant Noodles</p><p>104.00</p></div>
                  <div className="flex justify-between"><p>Green Tea</p><p>208.00</p></div>
                  <div className="flex justify-between"><p>Crispy Crackers</p><p>312.00</p></div>
                  <p className="my-1">--------------------------</p>
                  <div className="flex justify-between"><p>Subtotal</p><p>624.00</p></div>
                  <div className="flex justify-between"><p>GST @ 5%</p><p>31.20</p></div>
                  <p className="my-1">--------------------------</p>
                  <div className="flex justify-between font-bold text-[7px]"><p>TOTAL</p><p>655.20</p></div>
                  <p className="my-1">--------------------------</p>
                  <p className="text-center mt-4">Thank you for shopping!</p>
                </div>
            )}
            {id === 'modern' && (
                <div className="w-full h-full text-[5px] leading-snug text-gray-800 font-sans bg-gray-50 p-2 rounded-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="font-bold text-[7px]">The Corner Collection</p>
                            <p className="text-gray-500">#123 Main Road, Mumbai</p>
                            <p className="text-gray-500">GSTIN: 29AT...</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-[8px]">INVOICE</p>
                            <p className="text-gray-500">#TCC-1762...</p>
                        </div>
                    </div>
                     <div className="flex justify-between items-start mb-3 text-gray-600">
                        <div>
                            <p className="text-[6px] font-semibold">BILLED TO</p>
                            <p>Kavya Joshi</p>
                        </div>
                        <div className="text-right">
                            <p>Invoice Date: 12/11/2025</p>
                        </div>
                    </div>
                    <div className="bg-gray-100 rounded-t-sm px-1 py-0.5 flex justify-between font-bold">
                        <p className="w-[40%]">Product</p><p>Price</p><p>Qty</p><p>Total</p>
                    </div>
                    <div className="bg-white px-1 py-1 flex justify-between text-gray-700">
                        <p className="w-[40%]">Levi's Jacket</p><p>₹2999</p><p>1</p><p>₹2999</p>
                    </div>
                    <div className="flex justify-end mt-2 text-right">
                        <div className="w-1/2">
                            <div className="flex justify-between"><p>Subtotal</p><p>₹2999.00</p></div>
                            <div className="flex justify-between"><p>Discount</p><p className="text-red-500">-₹299.90</p></div>
                            <div className="flex justify-between font-bold mt-1 pt-1 border-t"><p>Grand Total</p><p>₹2699.10</p></div>
                        </div>
                    </div>
                    <div className="bg-gray-800 text-white p-2 mt-3 rounded-md text-[4.5px] leading-relaxed">
                        <div className="flex justify-between items-center">
                            <p className="font-bold text-[6px]">WARRANTY CARD</p>
                            <p className="bg-gray-600 px-1 py-0.5 rounded-full text-[4px]">2 Years</p>
                        </div>
                        <p className="mt-1">This certifies the product(s) are covered under warranty.</p>
                    </div>
                </div>
            )}
            {id === 'compact' && (
              <div className="w-full h-full text-[6px] leading-tight text-gray-800 font-mono bg-white p-2 flex flex-col">
                  <p className="text-center text-[8px] font-bold">LineaMart</p>
                  <p className="text-center text-gray-600">INV# 88372</p>
                  <div className="border-t border-dashed my-2"></div>
                  <div className="flex-grow space-y-1">
                      <p>Noodles...........1 x 104.00</p>
                      <p>Green Tea.........1 x 208.00</p>
                      <p>Crackers..........1 x 312.00</p>
                  </div>
                  <div className="border-t border-dashed my-2"></div>
                  <div className="flex justify-between font-bold text-[7px]">
                      <p>TOTAL</p>
                      <p>₹624.00</p>
                  </div>
                  <p className="text-center text-gray-600 mt-2">Thanks for your visit!</p>
              </div>
            )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Shop Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 grid gap-8 auto-rows-min">
          <Card>
            <CardHeader>
              <CardTitle>Shop Details</CardTitle>
              <CardDescription>
                This information will appear on your invoices and store profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="shopName">Shop Name</Label>
                <Input id="shopName" type="text" className="w-full" value={settings.shopName} onChange={handleInputChange} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="shopAddress">Shop Address</Label>
                <Textarea
                  id="shopAddress"
                  value={settings.shopAddress}
                  onChange={handleInputChange}
                  className="min-h-24"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Receipt Template</CardTitle>
              <CardDescription>
                Choose the design for customer receipts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={settings.receiptTemplate} onValueChange={handleTemplateChange} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <TemplatePreview name="Classic" id="classic" />
                  <TemplatePreview name="Modern" id="modern" />
                  <TemplatePreview name="Compact" id="compact" />
              </RadioGroup>
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
                <Label htmlFor="invoicePrefix">Invoice Prefix (Optional)</Label>
                <Input id="invoicePrefix" value={settings.invoicePrefix} onChange={handleInputChange} />
                <p className="text-xs text-muted-foreground">Set a prefix for your bill numbers.</p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="invoiceFooter">Invoice Footer Note (Optional)</Label>
                <Textarea
                  id="invoiceFooter"
                  value={settings.invoiceFooter}
                  onChange={handleInputChange}
                  className="min-h-24"
                />
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="md:col-span-1 grid gap-8 auto-rows-min">
          <Card>
            <CardHeader>
              <CardTitle>Save Changes</CardTitle>
              <CardDescription>
                Click the button below to apply all your new settings.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save All Settings"}
              </Button>
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
                <Input id="whatsapp" value={settings.whatsapp} onChange={handleInputChange} />
                <p className="text-xs text-muted-foreground">Used for sharing bills.</p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="gstin">GSTIN (Optional)</Label>
                <Input id="gstin" value={settings.gstin} onChange={handleInputChange} />
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
                  value={settings.terms}
                  onChange={handleInputChange}
                  className="min-h-32"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
