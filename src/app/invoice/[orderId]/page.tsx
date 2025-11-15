
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import QRCode from 'qrcode.react';

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
import { CheckCircle2, Home, Download, Loader2 } from 'lucide-react';
import { type CartItem } from '@/store/cart-store';

interface Order {
    id: string;
    customerName: string;
    storeName: string;
    items: CartItem[];
    subtotal: number;
    cgst: number;
    sgst: number;
    totalAmount: number;
    createdAt: { toDate: () => Date };
    storeId: string;
}

interface StoreSettings {
    shopName: string;
    shopAddress: string;
    invoiceFooter: string;
    gstin: string;
    terms: string;
}

export default function InvoicePage() {
  const router = useRouter();
  const params = useParams();
  const { orderId } = params;

  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();

  const [order, setOrder] = useState<Order | null>(null);
  const [store, setStore] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId || !firestore) return;

    const fetchOrderAndStore = async () => {
      setLoading(true);
      try {
        // Fetch Order from root collection
        const orderRef = doc(firestore, 'orders', orderId as string);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
          console.error("No such order!");
          router.push('/customer/orders');
          return;
        }
        const orderData = { id: orderSnap.id, ...orderSnap.data() } as Order;
        setOrder(orderData);

        // Fetch Store Details using storeId from the order
        const storeRef = doc(firestore, 'stores', orderData.storeId);
        const storeSnap = await getDoc(storeRef);
        if (storeSnap.exists()) {
            setStore(storeSnap.data() as StoreSettings);
        } else {
            setStore({
                shopName: orderData.storeName || "Your Favorite Store",
                shopAddress: "123 Market Street, Shopsville",
                invoiceFooter: "Thank you for your purchase!",
                gstin: "STORE-GSTIN-001",
                terms: "All sales are final. No returns or exchanges.",
            });
        }
      } catch (error) {
        console.error("Error fetching invoice details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndStore();
  }, [orderId, firestore, router]);

  if (loading || userLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!order || !store) {
     return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
        <Card className="max-w-md w-full shadow-xl">
            <CardHeader className="text-center">
                <CardTitle>Invoice Not Found</CardTitle>
                <CardDescription>Could not load the invoice details.</CardDescription>
            </CardHeader>
             <CardFooter>
                 <Button asChild className="w-full">
                    <Link href="/customer/orders"><Home className="mr-2"/> Back to Orders</Link>
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
            <div className="p-8 bg-white print:p-0">
                <ClassicTemplate order={order} store={store} />
            </div>
        </CardContent>
        <CardFooter className="p-6 flex flex-col sm:flex-row gap-4 border-t print:hidden">
          <Button asChild className="w-full">
             <Link href="/shopping"><Home className="mr-2" /> New Session</Link>
          </Button>
          <Button variant="outline" className="w-full" onClick={() => window.print()}>
            <Download className="mr-2" /> Download / Print Bill
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

const ClassicTemplate = ({ order, store }: { order: Order; store: StoreSettings }) => (
  <div className="font-mono text-sm text-gray-800">
    <div className="text-center mb-6">
      <h1 className="font-bold text-xl uppercase">{store.shopName}</h1>
      <p>{store.shopAddress}</p>
      {store.gstin && <p>GSTIN: {store.gstin}</p>}
    </div>
    <Separator className="my-4 border-dashed" />
    <div className="flex justify-between text-xs mb-2">
        <span>Bill to: {order.customerName}</span>
        <span>Date: {order.createdAt.toDate().toLocaleDateString()}</span>
    </div>
     <div className="flex justify-between text-xs mb-4">
        <span>Invoice #: {order.id.slice(0, 8)}...</span>
        <span>Time: {order.createdAt.toDate().toLocaleTimeString()}</span>
    </div>
    <Separator className="my-4 border-dashed" />
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
    <div className="text-center text-xs mt-6 space-y-4">
       <div className="flex flex-col items-center justify-center">
            <QRCode value={order.id} size={128} />
            <p className="mt-2 font-sans font-semibold">Scan at exit</p>
        </div>
      <p>{store.invoiceFooter}</p>
      <p className="mt-2">{store.terms}</p>
    </div>
  </div>
);
