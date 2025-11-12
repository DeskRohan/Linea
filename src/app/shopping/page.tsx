
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
  Bell,
  User,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import Scanner from "@/components/scanner";
import { findProductByBarcode, type CartItem } from "@/lib/products";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import MobileLayout from "@/components/mobile-layout";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

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
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleScanSuccess = (decodedText: string) => {
    const product = findProductByBarcode(decodedText);
    if (product) {
      if (typeof window.navigator.vibrate === "function") {
        window.navigator.vibrate(100);
      }
      toast({
        title: `${product.name} added to cart!`,
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

  const totalItems = useMemo(() => {
     return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const renderContent = () => {
    switch (appState) {
      case "shopping":
        return (
          <ShoppingScreen
            cartItems={cartItems}
            total={total}
            totalItems={totalItems}
            onScanSuccess={handleScanSuccess}
            onCheckout={() => setAppState("completed")}
            onLogout={handleLogout}
            onQuantityChange={handleQuantityChange}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
          />
        );
      case "completed":
        return <CompletionScreen onNewSession={handleNewSession} />;
      default:
        return (
           <ShoppingScreen
            cartItems={cartItems}
            total={total}
            totalItems={totalItems}
            onScanSuccess={handleScanSuccess}
            onCheckout={() => setAppState("completed")}
            onLogout={handleLogout}
            onQuantityChange={handleQuantityChange}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
          />
        );
    }
  };

  return (
    <MobileLayout>
      <div className="flex flex-col h-full w-full">
          {renderContent()}
      </div>
    </MobileLayout>
  );
}

const ShoppingScreen = ({
  cartItems,
  total,
  totalItems,
  onScanSuccess,
  onCheckout,
  onLogout,
  onQuantityChange,
  isCartOpen,
  setIsCartOpen
}: {
  cartItems: CartItem[];
  total: number;
  totalItems: number;
  onScanSuccess: (decodedText: string) => void;
  onCheckout: () => void;
  onLogout: () => void;
  onQuantityChange: (productId: string, newQuantity: number) => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}) => (
  <div className="flex flex-col h-full w-full">
    <header className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-primary/50">
          <AvatarImage src="" />
          <AvatarFallback className="bg-secondary text-secondary-foreground">TU</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold text-lg">Test User</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onLogout}>
          <LogOut className="h-6 w-6" />
        </Button>
      </div>
    </header>

    <main className="flex-grow flex flex-col items-center justify-start p-4 pt-8 text-center">
      <div className="relative w-full max-w-[300px] aspect-square rounded-3xl bg-black/20 p-2 overflow-hidden">
        <div className="w-full h-full rounded-2xl overflow-hidden border-4 border-dashed border-primary/50">
          <Scanner onScanSuccess={onScanSuccess} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-1 bg-primary/70 animate-scan-beam"></div>
          </div>
        </div>
      </div>
      <h2 className="mt-6 text-xl font-semibold">Scan & Go</h2>
      <p className="text-foreground/80 mt-1">Add items to your cart by scanning their barcodes.</p>
    </main>

    <footer className="p-4">
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetTrigger asChild>
          <Button size="lg" className="w-full h-14 text-lg rounded-2xl" disabled={cartItems.length === 0}>
             <ShoppingCart className="mr-3 h-6 w-6" />
            View Cart ({totalItems} items)
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh] flex flex-col bg-card rounded-t-3xl">
          <CartSheet 
            cartItems={cartItems} 
            total={total} 
            onQuantityChange={onQuantityChange} 
            onCheckout={onCheckout}
          />
        </SheetContent>
      </Sheet>
    </footer>
  </div>
);

const CartSheet = ({
  cartItems,
  total,
  onQuantityChange,
  onCheckout,
}: {
  cartItems: CartItem[];
  total: number;
  onQuantityChange: (productId: string, newQuantity: number) => void;
  onCheckout: () => void;
}) => (
  <>
    <SheetHeader className="text-left p-4">
      <SheetTitle className="text-2xl">Your Cart</SheetTitle>
    </SheetHeader>
    <div className="flex-grow overflow-hidden">
       <ScrollArea className="h-full px-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-10">
              <Package size={48} className="mb-4 text-primary/50" />
              <p className="font-semibold text-lg">Your cart is empty</p>
              <p className="text-sm">Start scanning to add items.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 rounded-lg"
                >
                  <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md object-cover border-2 border-secondary" data-ai-hint={item.imageHint}/>
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
                   <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-destructive" onClick={() => onQuantityChange(item.id, 0)}>
                        <XCircle className="h-5 w-5"/>
                   </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
    </div>
    <SheetFooter className="p-4 !flex-col gap-4 bg-background/95 sticky bottom-0">
       <Separator />
       <div className="flex justify-between w-full text-2xl font-bold pt-4">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <Button
          onClick={onCheckout}
          size="lg"
          className="w-full text-lg h-14 rounded-2xl"
          disabled={cartItems.length === 0}
        >
          <CreditCard className="mr-3 h-6 w-6" />
          Proceed to Payment
        </Button>
    </SheetFooter>
  </>
);


const CompletionScreen = ({ onNewSession }: { onNewSession: () => void }) => (
  <Card className="w-full h-full border-none shadow-none rounded-none flex flex-col items-center justify-center text-center bg-transparent">
    <CardContent className="p-10">
      <CheckCircle2 className="h-20 w-20 text-green-500 mb-6 mx-auto" />
      <h1 className="text-3xl font-bold text-primary">
        Payment Complete!
      </h1>
      <p className="text-foreground/80 mt-2 mb-8">
        Thank you for shopping with Linea. Your receipt has been sent to
        your email.
      </p>
      <Button onClick={onNewSession} size="lg" className="w-full h-14 rounded-2xl">
        Start a New Session
      </Button>
    </CardContent>
  </Card>
);
