
"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useFirestore, useUser } from "@/firebase";

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

interface StoreSettings {
  shopName: string;
  shopAddress: string;
  invoicePrefix: string;
  invoiceFooter: string;
  whatsapp: string;
  gstin: string;
  terms: string;
}

export default function ShopSettingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [settings, setSettings] = useState<StoreSettings>({
    shopName: "",
    shopAddress: "",
    invoicePrefix: "",
    invoiceFooter: "",
    whatsapp: "",
    gstin: "",
    terms: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const storeDocRef = doc(firestore, "stores", user.email!);
          const docSnap = await getDoc(storeDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setSettings({
              shopName: data.shopName || "",
              shopAddress: data.shopAddress || "",
              invoicePrefix: data.invoicePrefix || "",
              invoiceFooter: data.invoiceFooter || "",
              whatsapp: data.whatsapp || "",
              gstin: data.gstin || "",
              terms: data.terms || "",
            });
          }
        } catch (error) {
          console.error("Error fetching settings:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch store settings.",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchSettings();
  }, [user, firestore, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setSettings((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleSave = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Authenticated",
        description: "You must be logged in to save settings.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const storeDocRef = doc(firestore, "stores", user.email!);
      await setDoc(storeDocRef, settings, { merge: true });
      toast({
        title: "Settings Saved",
        description: "Your store settings have been updated successfully.",
        action: <Check className="h-5 w-5 text-green-500" />,
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save settings. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Shop Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
