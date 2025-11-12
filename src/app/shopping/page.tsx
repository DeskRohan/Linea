
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  ScanLine,
  CreditCard,
  CheckCircle2,
  Package,
  LogOut,
  PlusCircle,
  MinusCircle,
  XCircle,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

type AppState = "shopping" | "completed";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

export default function ShoppingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [appState, setAppState] = useState<AppState>("shopping");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [lastScannedId, setLastScannedId] = useState<string | null>(null);

  const handleScanSuccess = (decodedText: string) => {
    const product = findProductByBarcode(decodedText);
    if (product) {
      if (typeof window.navigator.vibrate === "function") {
        window.navigator.vibrate(200);
      }
      toast({
        title: `${product.name} added`,
        description: `Price: ${formatCurrency(product.price)}`,
      });
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === product.id);
        if (existingItem) {
          return prevItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [{ ...product, quantity: 1 }, ...prevItems];
      });
      setLastScannedId(product.id);
    } else {
        toast({
            variant: "destructive",
            title: "Product Not Found",
            description: "This barcode is not in our inventory.",
        });
    }
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    setCartItems((prevItems) => {
        if (newQuantity <= 0) {
            return prevItems.filter(item => item.id !== productId);
        }
        return prevItems.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item);
    });
  };

  const handleNewSession = () => {
    setCartItems([]);
    setAppState("shopping");
  };

  const handleLogout = async () => {
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
      const timer = setTimeout(() => setLastScannedId(null), 1200);
      return () => clearTimeout(timer);
    }
  }, [lastScannedId]);

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
            onLogout={handleLogout}
            onQuantityChange={handleQuantityChange}
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
            onLogout={handleLogout}
            onQuantityChange={handleQuantityChange}
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
  onLogout,
  onQuantityChange,
}: {
  cartItems: CartItem[];
  total: number;
  onScanSuccess: (decodedText: string) => void;
  onCheckout: () => void;
  lastScannedId: string | null;
  onLogout: () => void;
  onQuantityChange: (productId: string, newQuantity: number) => void;
}) => (
  <div className="w-full h-screen md:h-auto max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-5 gap-8">
    <Card className="shadow-xl flex flex-col md:col-span-2">
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

    <Card className="shadow-xl flex flex-col max-h-[calc(100vh-2rem)] md:max-h-auto md:col-span-3">
      <CardHeader className="flex flex-row items-start justify-between">
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
            <div className="text-right">
                <p className="font-semibold">Test User</p>
                <p className="text-xs text-muted-foreground">test@example.com</p>
            </div>
            <Avatar className="h-12 w-12 border-2 border-primary/50">
              <AvatarImage src="" />
              <AvatarFallback>TU</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={onLogout} className="self-start">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-10">
              <Package size={48} className="mb-4 text-primary/50" />
              <p className="font-semibold text-lg">Your cart is empty</p>
              <p className="text-sm">Start scanning to add items.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 pr-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-lg transition-all duration-500",
                    item.id === lastScannedId && "bg-green-100 dark:bg-green-900/30 animate-scan-pulse"
                  )}
                >
                  <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md object-cover border" data-ai-hint={item.imageHint}/>
                  <div className="flex-grow">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => onQuantityChange(item.id, item.quantity - 1)}>
                        <MinusCircle className="h-5 w-5 text-destructive"/>
                    </Button>
                    <Badge variant="secondary" className="text-lg px-3">
                        {item.quantity}
                    </Badge>
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => onQuantityChange(item.id, item.quantity + 1)}>
                        <PlusCircle className="h-5 w-5 text-primary"/>
                    </Button>
                  </div>
                  <div className="font-semibold w-24 text-right">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                   <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-destructive" onClick={() => onQuantityChange(item.id, 0)}>
                        <XCircle className="h-5 w-5"/>
                   </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <Separator />
      <CardFooter className="flex flex-col !p-6 bg-muted/50 rounded-b-lg">
        <div className="flex justify-between w-full text-2xl font-bold mb-4">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <Button
          onClick={onCheckout}
          size="lg"
          className="w-full text-lg"
          disabled={cartItems.length === 0}
        >
          <CreditCard className="mr-3 h-6 w-6" />
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
        Thank you for shopping with Linea. Your receipt has been sent to
        your email.
      </p>
      <Button onClick={onNewSession} size="lg" className="w-full" variant="outline">
        Start a New Session
      </Button>
    </CardContent>
  </Card>
);

