
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCartStore, type CartItem } from '@/store/cart-store';
import { useUser } from '@/firebase';
import { type Store } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { CheckCircle2, Home, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BillPage() {
  const { items, store, totalPrice, clearCart } = useCartStore();
  const { user } = useUser();
  const router = useRouter();

  // Define static store settings for presentation, as they are not fetched for this static bill
  const staticStoreSettings = {
    shopName: store?.name || "Your Favorite Store",
    shopAddress: store?.address || "123 Market Street, Shopsville",
    invoicePrefix: "INV-",
    invoiceFooter: "Thank you for your purchase!",
    whatsapp: "",
    gstin: "STORE-GSTIN-001",
    terms: "All sales are final. No returns or exchanges.",
    receiptTemplate: "classic", // Default template
  };

  const subtotal = totalPrice();
  const cgst = subtotal * 0.09;
  const sgst = subtotal * 0.09;
  const totalAmount = subtotal + cgst + sgst;
  
  const orderData = {
    customerName: user?.displayName || "Valued Customer",
    customerEmail: user?.email || "",
    storeName: staticStoreSettings.shopName,
    items: items,
    subtotal: subtotal,
    cgst: cgst,
    sgst: sgst,
    totalAmount: totalAmount,
    createdAt: { toDate: () => new Date() }, // Use current date for display
    id: `static-${Date.now()}` // Create a temporary ID
  };
  
  const handleNewSession = () => {
    clearCart();
    router.push('/shopping');
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
        <Card className="max-w-md w-full shadow-xl">
            <CardHeader className="text-center">
                <CardTitle>Your Cart is Empty</CardTitle>
                <CardDescription>There's nothing to show on the bill.</CardDescription>
            </CardHeader>
             <CardFooter>
                 <Button asChild className="w-full">
                    <Link href="/shopping"><Home className="mr-2"/> Back to Shopping</Link>
                </Button>
            </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-8 flex flex-col items-center">
      <Card className="w-full max-w-2xl mx-auto shadow-lg print:shadow-none">
        <CardHeader className="text-center bg-background/80 p-6 print:hidden">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold">Thank You!</CardTitle>
          <CardDescription>
            Your bill has been generated below.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
             {/* Printable Invoice Section */}
            <div className="p-8 bg-white print:p-0">
                <ClassicTemplate order={orderData} store={staticStoreSettings} />
            </div>
        </CardContent>
        <CardFooter className="p-6 flex flex-col sm:flex-row gap-4 border-t print:hidden">
          <Button onClick={handleNewSession} className="w-full">
            <Home className="mr-2" /> Start New Session
          </Button>
          <Button variant="outline" className="w-full" onClick={() => window.print()}>
            <Download className="mr-2" /> Download / Print Bill
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}


// --- TEMPLATE COMPONENT ---
// Using only the classic template for simplicity in this static version.

const ClassicTemplate = ({ order, store }: { order: any; store: any }) => (
  <div className="font-mono text-sm text-gray-800">
    <div className="text-center mb-6">
      <h1 className="font-bold text-xl uppercase">{store.shopName}</h1>
      <p>{store.shopAddress}</p>
      {store.gstin && <p>GSTIN: {store.gstin}</p>}
    </div>
    <Separator className="my-4 border-dashed" />
    <div className="flex justify-between text-xs mb-4">
        <span>Bill to: {order.customerName}</span>
        <span>Date: {order.createdAt.toDate().toLocaleDateString()}</span>
    </div>
    <Separator className="my-4 border-dashed" />
    {/* Items Table */}
    <div className="space-y-2">
        <div className="flex font-bold">
            <span className="flex-grow">Item</span>
            <span className="w-16 text-right">Price</span>
            <span className="w-12 text-right">Qty</span>
            <span className="w-20 text-right">Total</span>
        </div>
        {order.items.map((item: CartItem, i: number) => (
            <div key={i} className="flex">
            <span className="flex-grow">{item.name}</span>
            <span className="w-16 text-right">{formatCurrency(item.price)}</span>
            <span className="w-12 text-right">{item.quantity}</span>
            <span className="w-20 text-right">{formatCurrency(item.price * item.quantity)}</span>
            </div>
        ))}
    </div>
    <Separator className="my-4 border-dashed" />
    {/* Totals */}
    <div className="space-y-2 w-1/2 ml-auto text-sm">
        <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
            <span className="text-gray-600">CGST (9%)</span>
            <span>{formatCurrency(order.cgst)}</span>
        </div>
        <div className="flex justify-between">
            <span className="text-gray-600">SGST (9%)</span>
            <span>{formatCurrency(order.sgst)}</span>
        </div>
        <div className="flex justify-between font-bold text-base border-t pt-2 mt-2 border-dashed">
            <span>TOTAL</span>
            <span>{formatCurrency(order.totalAmount)}</span>
        </div>
    </div>
    <Separator className="my-4 border-dashed" />
    {/* Footer */}
    <div className="text-center text-xs mt-6">
      <p>{store.invoiceFooter}</p>
      <p className="mt-2">{store.terms}</p>
    </div>
  </div>
);
