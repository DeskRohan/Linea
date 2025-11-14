
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { useUser, useFirestore } from '@/firebase';
import {
  CreditCard,
  Wallet,
  Landmark,
  ShieldCheck,
  Loader2,
  Package,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const { items, store, totalPrice, totalItems, clearCart } = useCartStore();

  const [isClient, setIsClient] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Ensure this component only renders on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect if cart is empty or user is not logged in
  useEffect(() => {
    if (isClient) {
      if (!userLoading && !user) {
        router.replace('/login');
      }
      if (items.length === 0) {
        router.replace('/shopping');
      }
    }
  }, [isClient, items, user, userLoading, router]);

  const subtotal = totalPrice();
  const gst = subtotal * 0.05; // Simulate 5% GST
  const total = subtotal + gst;

  const handlePayment = async () => {
    if (!user || !store) {
        toast({ variant: 'destructive', title: 'Error', description: 'User or store information is missing.' });
        return;
    }
    setIsProcessing(true);

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    const order = {
      customerId: user.uid,
      customerName: user.displayName || user.email,
      customerEmail: user.email,
      customerPhotoURL: user.photoURL,
      storeId: store.id,
      storeName: store.name,
      items: items,
      subtotal: subtotal,
      gst: gst,
      totalAmount: total,
      totalItems: totalItems(),
      createdAt: serverTimestamp(),
      status: 'completed',
    };

    try {
      const ordersCollection = collection(firestore, 'stores', store.id, 'orders');
      const docRef = await addDoc(ordersCollection, order);
      
      clearCart();
      router.push(`/invoice/${docRef.id}?storeId=${store.id}`);

    } catch (error: any) {
      console.error('Error creating order: ', error);
      toast({
        variant: 'destructive',
        title: 'Checkout Error',
        description: error.message || 'Could not process your order.',
      });
      setIsProcessing(false);
    }
  };

  if (!isClient || userLoading || items.length === 0) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 p-4 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/shopping"><ArrowLeft /></Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="space-y-8 lg:col-span-3">
            {/* Shipping Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p className="font-semibold">{user?.displayName || 'Customer'}</p>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <p className="text-muted-foreground mt-2">
                    Address will be collected at checkout in a real app.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="rounded-md border object-cover"
                    />
                    <div className="flex-grow">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} x {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8 lg:col-span-2">
            {/* Price & Payment Card */}
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Total</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Coupon Code */}
                <div className="flex gap-2">
                  <Input placeholder="Coupon Code" className="flex-grow" disabled/>
                  <Button variant="outline" disabled>Apply</Button>
                </div>
                <Separator />
                {/* Price Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST (5%)</span>
                    <span>{formatCurrency(gst)}</span>
                  </div>
                   <div className="flex items-center justify-between text-muted-foreground">
                    <span>Delivery Fee</span>
                     <div className="flex items-center gap-1">
                        <span className="font-semibold text-primary">FREE</span>
                        <Info className="h-3 w-3" />
                     </div>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-4">
                 <div className="grid grid-cols-3 gap-3">
                    <PaymentMethodButton 
                        label="Card" 
                        icon={CreditCard} 
                        isSelected={paymentMethod === 'card'} 
                        onClick={() => setPaymentMethod('card')} 
                    />
                    <PaymentMethodButton 
                        label="Wallet" 
                        icon={Wallet} 
                        isSelected={paymentMethod === 'wallet'} 
                        onClick={() => setPaymentMethod('wallet')} 
                    />
                    <PaymentMethodButton 
                        label="Net Banking" 
                        icon={Landmark} 
                        isSelected={paymentMethod === 'banking'} 
                        onClick={() => setPaymentMethod('banking')} 
                    />
                </div>
                <Button
                  onClick={handlePayment}
                  size="lg"
                  className="w-full text-lg h-14 rounded-xl shadow-lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-3 h-6 w-6" />
                  )}
                  {isProcessing ? 'Processing...' : `Pay ${formatCurrency(total)}`}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

const PaymentMethodButton = ({ label, icon: Icon, isSelected, onClick }: { label: string, icon: React.ElementType, isSelected: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all",
      isSelected ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
    )}
  >
    <Icon className={cn("h-7 w-7", isSelected ? "text-primary" : "text-muted-foreground")} />
    <span className={cn("text-xs font-semibold", isSelected ? "text-primary" : "text-muted-foreground")}>{label}</span>
  </button>
)
