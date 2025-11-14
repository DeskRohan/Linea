
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2, CheckCircle2, Home, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Define types for order and store settings
interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  storeName: string;
  items: { name: string; price: number; quantity: number }[];
  subtotal: number;
  gst: number;
  totalAmount: number;
  createdAt: { toDate: () => Date };
}

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

export default function InvoicePage({ params }: { params: { orderId: string } }) {
  const { orderId } = params;
  const searchParams = useSearchParams();
  const storeId = searchParams.get('storeId');

  const firestore = useFirestore();
  const [order, setOrder] = useState<Order | null>(null);
  const [store, setStore] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || !storeId) {
      setError('Order or Store ID is missing.');
      setLoading(false);
      return;
    }

    const fetchInvoiceData = async () => {
      try {
        // Fetch order
        const orderRef = doc(firestore, 'stores', storeId, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);
        if (!orderSnap.exists()) {
          throw new Error('Order not found.');
        }
        const orderData = { id: orderSnap.id, ...orderSnap.data() } as Order;
        setOrder(orderData);

        // Fetch store settings
        const storeRef = doc(firestore, 'stores', storeId);
        const storeSnap = await getDoc(storeRef);
        if (!storeSnap.exists()) {
          throw new Error('Store details not found.');
        }
        setStore(storeSnap.data() as StoreSettings);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [orderId, storeId, firestore]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
        <Card className="max-w-md w-full shadow-xl">
            <CardHeader>
                <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{error}</p>
            </CardContent>
             <CardFooter>
                 <Button asChild className="w-full">
                    <Link href="/shopping"><Home className="mr-2"/> Back to Shopping</Link>
                </Button>
            </CardFooter>
        </Card>
      </div>
    );
  }

  if (!order || !store) {
     return null;
  }
  
  const receiptTemplate = store.receiptTemplate || 'classic';

  return (
     <div className="min-h-screen bg-muted/40 p-4 sm:p-8 flex flex-col items-center">
        <Card className="w-full max-w-2xl mx-auto shadow-lg mb-8">
            <CardHeader className="text-center bg-background/80 p-6">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-3xl font-bold">Payment Successful!</CardTitle>
                <CardDescription>
                    Thank you for your purchase. Here is your invoice.
                </CardDescription>
            </CardHeader>
             <CardFooter className="p-6 flex flex-col sm:flex-row gap-4">
                <Button asChild className="w-full">
                    <Link href="/shopping"><Home className="mr-2"/> Start New Session</Link>
                </Button>
                <Button variant="outline" className="w-full" onClick={() => window.print()}>
                    <Download className="mr-2"/> Download / Print
                </Button>
            </CardFooter>
        </Card>
        
        {/* Printable Invoice Section */}
        <div className="w-full max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-2xl print:shadow-none">
            {receiptTemplate === 'classic' && <ClassicTemplate order={order} store={store} />}
            {receiptTemplate === 'modern' && <ModernTemplate order={order} store={store} />}
            {receiptTemplate === 'compact' && <CompactTemplate order={order} store={store} />}
        </div>
    </div>
  );
}


// --- TEMPLATE COMPONENTS ---

const ClassicTemplate = ({ order, store }: { order: Order; store: StoreSettings }) => (
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
        {order.items.map((item, i) => (
            <div key={i} className="flex">
            <span className="flex-grow">{item.name}</span>
            <span className="w-16 text-right">{formatCurrency(item.price, 'INR', 0)}</span>
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
            <span className="text-gray-600">GST</span>
            <span>{formatCurrency(order.gst)}</span>
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

const ModernTemplate = ({ order, store }: { order: Order; store: StoreSettings }) => (
    <div className="font-sans text-gray-800">
        <header className="flex justify-between items-start pb-6 mb-6 border-b">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{store.shopName}</h1>
                <p className="text-gray-500">{store.shopAddress}</p>
                 {store.gstin && <p className="text-gray-500">GSTIN: {store.gstin}</p>}
            </div>
            <div className="text-right">
                <h2 className="text-2xl font-semibold uppercase text-gray-500">Invoice</h2>
                <p className="text-gray-500">#{`${store.invoicePrefix || ''}${order.id.slice(0, 6).toUpperCase()}`}</p>
            </div>
        </header>

        <div className="flex justify-between mb-8 text-sm">
            <div>
                <p className="font-bold text-gray-500 mb-1">BILLED TO</p>
                <p className="font-semibold text-gray-900">{order.customerName}</p>
                <p className="text-gray-600">{order.customerEmail}</p>
            </div>
            <div className="text-right">
                <p><span className="font-bold text-gray-500">Invoice Date:</span> {order.createdAt.toDate().toLocaleDateString()}</p>
                <p><span className="font-bold text-gray-500">Order ID:</span> {order.id.slice(0,10)}...</p>
            </div>
        </div>

        <table className="w-full mb-8 text-sm">
            <thead className="bg-gray-100">
                <tr>
                    <th className="p-3 text-left font-semibold text-gray-600">Product</th>
                    <th className="p-3 text-right font-semibold text-gray-600">Price</th>
                    <th className="p-3 text-center font-semibold text-gray-600">Quantity</th>
                    <th className="p-3 text-right font-semibold text-gray-600">Total</th>
                </tr>
            </thead>
            <tbody>
                {order.items.map((item, i) => (
                    <tr key={i} className="border-b">
                        <td className="p-3">{item.name}</td>
                        <td className="p-3 text-right">{formatCurrency(item.price)}</td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        
        <div className="flex justify-end mb-8">
            <div className="w-full max-w-xs space-y-3">
                 <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-medium">{formatCurrency(order.subtotal)}</span></div>
                 <div className="flex justify-between"><span className="text-gray-500">GST</span><span className="font-medium">{formatCurrency(order.gst)}</span></div>
                 <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t"><span >Grand Total</span><span>{formatCurrency(order.totalAmount)}</span></div>
            </div>
        </div>

        <footer className="text-center text-xs text-gray-500">
            <p className="font-semibold mb-2">{store.invoiceFooter}</p>
            <p>{store.terms}</p>
        </footer>
    </div>
);


const CompactTemplate = ({ order, store }: { order: Order; store: StoreSettings }) => (
    <div className="font-mono text-xs text-black max-w-sm mx-auto">
        <div className="text-center mb-4">
            <h1 className="text-lg font-bold">{store.shopName}</h1>
            <p className="text-gray-600">{store.shopAddress}</p>
            <p className="text-gray-600">INV#{order.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <Separator className="border-dashed" />
        <div className="my-2">
            <p>Date: {order.createdAt.toDate().toLocaleString()}</p>
            <p>Billed to: {order.customerName}</p>
        </div>
        <Separator className="border-dashed" />
        <div className="my-3 space-y-1">
            {order.items.map((item, i) =>(
                <div key={i} className="grid grid-cols-12 gap-1">
                    <span className="col-span-7 truncate">{item.name}</span>
                    <span className="col-span-2 text-right">{item.quantity}x</span>
                    <span className="col-span-3 text-right">{formatCurrency(item.price, 'INR', 0)}</span>
                </div>
            ))}
        </div>
        <Separator className="border-dashed" />
        <div className="my-3 space-y-1">
             <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
             <div className="flex justify-between"><span className="text-gray-600">GST</span><span>{formatCurrency(order.gst)}</span></div>
        </div>
        <Separator className="border-dashed" />
        <div className="flex justify-between font-bold text-base my-2">
            <p>TOTAL</p>
            <p>{formatCurrency(order.totalAmount)}</p>
        </div>
        <Separator className="border-dashed" />
        <div className="text-center text-[10px] text-gray-600 mt-4 space-y-1">
            <p>{store.invoiceFooter}</p>
            <p>{store.terms}</p>
        </div>
    </div>
);
