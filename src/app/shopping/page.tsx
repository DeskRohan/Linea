
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  CreditCard,
  CheckCircle2,
  Package,
  LogOut,
  PlusCircle,
  MinusCircle,
  XCircle,
  Bell,
  Loader2,
  Trophy,
  Phone,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
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
  const auth = useAuth();
  const { user, loading } = useUser();

  const [appState, setAppState] = useState<AppState>("shopping");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);


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
    await signOut(auth);
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

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const renderContent = () => {
    switch (appState) {
      case "shopping":
        return (
          <ShoppingScreen
            user={user}
            cartItems={cartItems}
            total={total}
            totalItems={totalItems}
            onScanSuccess={handleScanSuccess}
            onCheckout={() => setAppState("completed")}
            onLogout={handleLogout}
            onQuantityChange={handleQuantityChange}
          />
        );
      case "completed":
        return <CompletionScreen onNewSession={handleNewSession} />;
      default:
        return (
           <ShoppingScreen
            user={user}
            cartItems={cartItems}
            total={total}
            totalItems={totalItems}
            onScanSuccess={handleScanSuccess}
            onCheckout={() => setAppState("completed")}
            onLogout={handleLogout}
            onQuantityChange={handleQuantityChange}
          />
        );
    }
  };

  return <div className="min-h-screen bg-muted/40">{renderContent()}</div>;
}

const ShoppingScreen = ({
  user,
  cartItems,
  total,
  totalItems,
  onScanSuccess,
  onCheckout,
  onLogout,
  onQuantityChange,
}: {
  user: any;
  cartItems: CartItem[];
  total: number;
  totalItems: number;
  onScanSuccess: (decodedText: string) => void;
  onCheckout: () => void;
  onLogout: () => void;
  onQuantityChange: (productId: string, newQuantity: number) => void;
}) => (
  <div className="flex flex-col lg:flex-row h-screen">
    {/* Left Side: Scanner and User Info */}
    <div className="flex flex-col lg:w-1/2 lg:h-full">
      <header className="flex items-center justify-between p-4 border-b lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
                <Avatar className="h-10 w-10 border-2 border-primary/50 cursor-pointer">
                    <AvatarImage src={user.photoURL || ""} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader className="text-left mt-8">
                    <div className="flex flex-col items-center gap-4">
                        <Avatar className="h-24 w-24 border-4 border-primary/50">
                            <AvatarImage src={user.photoURL || ""} />
                            <AvatarFallback className="bg-secondary text-secondary-foreground text-4xl">
                            {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                            <SheetTitle className="text-2xl">{user.displayName || "User"}</SheetTitle>
                            <SheetDescription>{user.email}</SheetDescription>
                        </div>
                    </div>
                </SheetHeader>
                <div className="py-8 flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <Phone className="h-5 w-5"/>
                        <span className="text-sm">Phone number not set</span>
                    </div>
                    <Separator/>
                    <Button variant="outline" className="w-full" onClick={onLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </SheetContent>
          </Sheet>
          <Button variant="ghost" size="icon">
            <Trophy className="h-6 w-6 text-primary" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-6 w-6" />
          </Button>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 text-center bg-background">
        <div className="relative w-full max-w-[300px] sm:max-w-[400px] aspect-square rounded-3xl bg-black/5 p-2 overflow-hidden border">
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
    </div>

    {/* Right Side: Cart - Hidden on mobile, visible on desktop */}
    <aside className="hidden lg:flex lg:flex-col lg:w-1/2 lg:h-full bg-card border-l">
      <div className="text-left p-4 pb-0">
        <h2 className="text-2xl font-semibold text-card-foreground">Your Cart</h2>
      </div>
      <div className="flex-grow overflow-hidden">
        <ScrollArea className="h-full px-4">
          <CartContent
            cartItems={cartItems}
            onQuantityChange={onQuantityChange}
          />
        </ScrollArea>
      </div>
      <footer className="p-4 !flex-col gap-4 bg-background/95 sticky bottom-0 border-t">
        <CartFooterActions total={total} onCheckout={onCheckout} cartItems={cartItems} />
      </footer>
    </aside>

    {/* Mobile Only: "View Cart" button that triggers a sheet */}
    <footer className="p-4 border-t bg-background lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="lg" className="w-full h-14 text-lg rounded-2xl" disabled={cartItems.length === 0}>
             <ShoppingCart className="mr-3 h-6 w-6" />
            View Cart ({totalItems} items)
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh] flex flex-col bg-card rounded-t-3xl p-0">
          <SheetHeader className="text-left p-4 pb-0">
            <SheetTitle className="text-2xl">Your Cart</SheetTitle>
          </SheetHeader>
          <div className="flex-grow overflow-hidden">
            <ScrollArea className="h-full px-4">
              <CartContent
                cartItems={cartItems}
                onQuantityChange={onQuantityChange}
              />
            </ScrollArea>
          </div>
          <SheetFooter className="p-4 !flex-col gap-4 bg-background/95 sticky bottom-0 border-t">
             <CartFooterActions total={total} onCheckout={onCheckout} cartItems={cartItems} />
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </footer>
  </div>
);


const CartContent = ({
  cartItems,
  onQuantityChange,
}: {
  cartItems: CartItem[];
  onQuantityChange: (productId: string, newQuantity: number) => void;
}) => (
  <>
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
  </>
);


const CartFooterActions = ({
  total,
  onCheckout,
  cartItems,
}: {
  total: number;
  onCheckout: () => void;
  cartItems: CartItem[];
}) => (
  <>
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
  </>
);


const CompletionScreen = ({ onNewSession }: { onNewSession: () => void }) => (
  <div className="w-full h-screen flex flex-col items-center justify-center text-center bg-transparent p-4">
    <Card className="max-w-md w-full">
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
  </div>
);

    