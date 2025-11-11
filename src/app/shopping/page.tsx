
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  ScanLine,
  CreditCard,
  CheckCircle2,
  Package,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Scanner from "@/components/scanner";
import { findProductByBarcode, type CartItem } from "@/lib/products";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase/auth/use-user";
import { getAuth, signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

type AppState = "shopping" | "completed";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

export default function ShoppingPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const auth = getAuth();

  const [appState, setAppState] = useState<AppState>("shopping");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [lastScannedId, setLastScannedId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);


  const handleScanSuccess = (decodedText: string) => {
    const product = findProductByBarcode(decodedText);
    if (product) {
      if (typeof window.navigator.vibrate === "function") {
        window.navigator.vibrate(200);
      }
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === product.id);
        if (existingItem) {
          return prevItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prevItems, { ...product, quantity: 1 }];
      });
      setLastScannedId(product.id);
    }
  };

  const handleNewSession = () => {
    setCartItems([]);
    setAppState("shopping");
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const total = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  useEffect(() => {
    if (lastScannedId) {
      const timer = setTimeout(() => setLastScannedId(null), 800);
      return () => clearTimeout(timer);
    }
  }, [lastScannedId]);

  if (loading || !user) {
    return null;
  }
  
  const renderContent = () => {
    switch (appState) {
      case "shopping":
        return (
          <ShoppingScreen
            cartItems={cartItems}
            total={total}
            onScanSuccess={handleScanSuccess}
            onCheckout={() => setAppState("completed")}
            lastScannedId={lastScannedId}
            user={user}
            loading={loading}
            onLogout={handleLogout}
          />
        );
      case "completed":
        return <CompletionScreen onNewSession={handleNewSession} />;
      default:
        return (
           <ShoppingScreen
            cartItems={cartItems}
            total={total}
            onScanSuccess={handleScanSuccess}
            onCheckout={() => setAppState("completed")}
            lastScannedId={lastScannedId}
            user={user}
            loading={loading}
            onLogout={handleLogout}
          />
        );
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background">
      {renderContent()}
    </main>
  );
}

const ShoppingScreen = ({
  cartItems,
  total,
  onScanSuccess,
  onCheckout,
  lastScannedId,
  user,
  loading,
  onLogout,
}: {
  cartItems: CartItem[];
  total: number;
  onScanSuccess: (decodedText: string) => void;
  onCheckout: () => void;
  lastScannedId: string | null;
  user: any;
  loading: boolean;
  onLogout: () => void;
}) => (
  <div className="w-full h-screen md:h-auto max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
    <Card className="shadow-xl flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ScanLine className="mr-2 text-primary" />
          Scan Products
        </CardTitle>
        <CardDescription>
          Align a product's barcode with the scanner.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow min-h-[300px] md:min-h-0">
        <div className="aspect-video w-full h-full rounded-lg overflow-hidden border">
           <Scanner onScanSuccess={onScanSuccess} />
        </div>
      </CardContent>
    </Card>

    <Card className="shadow-xl flex flex-col max-h-[calc(100vh-2rem)] md:max-h-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <ShoppingCart className="mr-2 text-primary" />
            Your Cart
          </CardTitle>
          <CardDescription>
            Items you have scanned will appear here.
          </CardDescription>
        </div>
         <div className="flex items-center gap-4">
            {loading ? (
              <Skeleton className="h-10 w-10 rounded-full" />
            ) : user ? (
              <Avatar>
                <AvatarImage src={user.photoURL} />
                <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
            ) : null}
            <Button variant="ghost" size="icon" onClick={onLogout} disabled={loading}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-10">
              <Package size={48} className="mb-4" />
              <p>Your cart is empty.</p>
              <p className="text-sm">Start scanning to add items.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 pr-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg transition-all",
                    item.id === lastScannedId && "bg-blue-50"
                  )}
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-lg">
                    {item.quantity}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <Separator />
      <CardFooter className="flex-col !p-6">
        <div className="flex justify-between w-full text-xl font-bold mb-4">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <Button
          onClick={onCheckout}
          size="lg"
          className="w-full"
          disabled={cartItems.length === 0}
        >
          <CreditCard className="mr-2 h-5 w-5" />
          Proceed to Payment
        </Button>
      </CardFooter>
    </Card>
  </div>
);

const CompletionScreen = ({ onNewSession }: { onNewSession: () => void }) => (
  <Card className="w-full max-w-md shadow-2xl">
    <CardContent className="p-10 flex flex-col items-center text-center">
      <CheckCircle2 className="h-20 w-20 text-green-500 mb-4" />
      <h1 className="text-3xl font-bold font-headline text-primary">
        Payment Complete!
      </h1>
      <p className="text-muted-foreground mt-2 mb-8">
        Thank you for shopping with SwiftPay. Your receipt has been sent to
        your email.
      </p>
      <Button onClick={onNewSession} size="lg" className="w-full" variant="outline">
        Start a New Session
      </Button>
    </CardContent>
  </Card>
);
