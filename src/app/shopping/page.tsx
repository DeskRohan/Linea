
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
  Loader2,
  Trophy,
  MapPin,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Scanner from "@/components/scanner";
import { type CartItem, type Product } from "@/lib/products";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { formatCurrency } from "@/lib/utils";
import { collection, query, where, getDocs, limit, addDoc, serverTimestamp, onSnapshot } from "firebase/firestore";

type AppState = "shopping" | "completed";

interface Store {
  id: string; // This is the ownerUid
  name: string;
  address: string;
}


export default function ShoppingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();

  const [appState, setAppState] = useState<AppState>("shopping");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const scannerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace("/login");
    }
  }, [user, userLoading, router]);
  
  useEffect(() => {
    if (!firestore) return;
    const storesCollection = collection(firestore, "stores");
    const unsubscribe = onSnapshot(storesCollection, (snapshot) => {
      const storesData: Store[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        storesData.push({ 
          id: doc.id, 
          name: data.shopName || "Unnamed Store",
          address: data.shopAddress || "No address"
        });
      });
      setStores(storesData);
      if (storesData.length > 0 && !selectedStoreId) {
        setSelectedStoreId(storesData[0].id);
      }
      setStoresLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, selectedStoreId]);


  useEffect(() => {
    if (isScanning) {
      scannerTimeoutRef.current = setTimeout(() => {
        setIsScanning(false);
        toast({
          variant: "destructive",
          title: "Scanner Timed Out",
          description: "No barcode was detected in time.",
        });
      }, 10000); // 10 seconds
    } else {
      if (scannerTimeoutRef.current) {
        clearTimeout(scannerTimeoutRef.current);
      }
    }

    return () => {
      if (scannerTimeoutRef.current) {
        clearTimeout(scannerTimeoutRef.current);
      }
    };
  }, [isScanning, toast]);


  const handleScanSuccess = async (decodedText: string) => {
    setIsScanning(false); // Stop scanning immediately
    
    if (!selectedStoreId) {
        toast({ variant: "destructive", title: "No Store Selected", description: "Please select a store first." });
        return;
    }

    const productsCollection = collection(firestore, `stores/${selectedStoreId}/products`);
    const q = query(productsCollection, where("barcode", "==", decodedText), limit(1));
    
    try {
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            toast({
                variant: "destructive",
                title: "Product Not Found",
                description: "This barcode is not in the selected store's inventory.",
            });
            return;
        }

        const productDoc = querySnapshot.docs[0];
        const product = { id: productDoc.id, ...productDoc.data() } as Product;

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

    } catch (error) {
        console.error("Error fetching product:", error);
        toast({
            variant: "destructive",
            title: "Database Error",
            description: "Could not fetch product from the inventory.",
        });
    }
  };

  const handleCheckout = async () => {
    if (!user || cartItems.length === 0) return;
    setIsCheckingOut(true);

    if (!selectedStoreId) {
      toast({ variant: "destructive", title: "Store not found" });
      setIsCheckingOut(false);
      return;
    }

    const order = {
      customerId: user.uid,
      customerName: user.displayName || user.email,
      customerEmail: user.email, // Add email for customer page
      customerPhotoURL: user.photoURL, // Add photoURL for customer page
      storeId: selectedStoreId,
      items: cartItems,
      totalAmount: total,
      totalItems: totalItems,
      createdAt: serverTimestamp(),
      status: "completed",
    };

    try {
      const ordersCollection = collection(firestore, "stores", selectedStoreId, "orders");
      await addDoc(ordersCollection, order);
      setAppState("completed");
    } catch (error: any) {
      console.error("Error creating order: ", error);
      toast({
        variant: "destructive",
        title: "Checkout Error",
        description: error.message || "Could not process your order.",
      });
    } finally {
      setIsCheckingOut(false);
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

  if (userLoading || storesLoading || !user) {
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
            stores={stores}
            selectedStoreId={selectedStoreId}
            isScanning={isScanning}
            onSetIsScanning={setIsScanning}
            onStoreChange={setSelectedStoreId}
            onScanSuccess={handleScanSuccess}
            onCheckout={handleCheckout}
            onLogout={handleLogout}
            onQuantityChange={handleQuantityChange}
            isCheckingOut={isCheckingOut}
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
            stores={stores}
            selectedStoreId={selectedStoreId}
            isScanning={isScanning}
            onSetIsScanning={setIsScanning}
            onStoreChange={setSelectedStoreId}
            onScanSuccess={handleScanSuccess}
            onCheckout={handleCheckout}
            onLogout={handleLogout}
            onQuantityChange={handleQuantityChange}
            isCheckingOut={isCheckingOut}
          />
        );
    }
  };

  return <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">{renderContent()}</div>;
}

const ShoppingScreen = ({
  user,
  cartItems,
  total,
  totalItems,
  stores,
  selectedStoreId,
  isScanning,
  onSetIsScanning,
  onStoreChange,
  onScanSuccess,
  onCheckout,
  onLogout,
  onQuantityChange,
  isCheckingOut,
}: {
  user: any;
  cartItems: CartItem[];
  total: number;
  totalItems: number;
  stores: Store[];
  selectedStoreId: string | null;
  isScanning: boolean;
  onSetIsScanning: (isScanning: boolean) => void;
  onStoreChange: (storeId: string) => void;
  onScanSuccess: (decodedText: string) => void;
  onCheckout: () => void;
  onLogout: () => void;
  onQuantityChange: (productId: string, newQuantity: number) => void;
  isCheckingOut: boolean;
}) => (
  <div className="w-full h-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[90vh]">
    
    {/* Left Side: Scanner and User Info */}
    <Card className="flex flex-col h-full overflow-hidden shadow-xl rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-10 w-10 border-2 border-primary/50 cursor-pointer">
                <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>
                <div className="font-bold">{user.displayName || "User"}</div>
                <div className="text-xs text-muted-foreground font-normal">{user.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon">
            <Trophy className="h-6 w-6 text-yellow-500" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
            <Select value={selectedStoreId ?? ""} onValueChange={onStoreChange}>
              <SelectTrigger className="w-auto sm:w-[220px] bg-background border-2 rounded-full shadow-inner">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                <SelectValue placeholder="Select a store" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    <div className="flex flex-col">
                      <span className="font-semibold">{store.name}</span>
                      <span className="text-xs text-muted-foreground">{store.address}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col items-center justify-center p-4 text-center">
        <div className="relative w-full max-w-[300px] sm:max-w-[400px] aspect-square rounded-3xl bg-background shadow-lg p-2 overflow-hidden">
            <div className="w-full h-full rounded-2xl overflow-hidden relative flex items-center justify-center">
                {isScanning ? (
                    <>
                        <Scanner onScanSuccess={onScanSuccess} />
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-xl animate-pulse"></div>
                            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-xl animate-pulse"></div>
                            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-xl animate-pulse"></div>
                            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-xl animate-pulse"></div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-4">
                        <Button
                            variant="ghost"
                            className="h-48 w-48 rounded-full border-4 border-dashed border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all animate-pulse"
                            onClick={() => onSetIsScanning(true)}
                        >
                            <Camera className="h-20 w-20 text-primary/50" />
                        </Button>
                         <h2 className="text-xl font-semibold">Tap to Scan</h2>
                        <p className="text-foreground/80 mt-1 max-w-xs">Click the button to activate the scanner and add items to your cart.</p>
                    </div>
                )}
            </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 border-t lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="lg" className="w-full h-14 text-lg rounded-2xl shadow-lg" disabled={cartItems.length === 0}>
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
              <CartFooterActions total={total} onCheckout={onCheckout} cartItems={cartItems} isCheckingOut={isCheckingOut} />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </CardFooter>
    </Card>

    {/* Right Side: Cart - Hidden on mobile, visible on desktop */}
    <Card className="hidden lg:flex flex-col h-full overflow-hidden shadow-xl rounded-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-card-foreground">Your Cart</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full px-6">
          <CartContent
            cartItems={cartItems}
            onQuantityChange={onQuantityChange}
          />
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 !flex-col gap-4 border-t">
        <CartFooterActions total={total} onCheckout={onCheckout} cartItems={cartItems} isCheckingOut={isCheckingOut} />
      </CardFooter>
    </Card>

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
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
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
  isCheckingOut,
}: {
  total: number;
  onCheckout: () => void;
  cartItems: CartItem[];
  isCheckingOut: boolean;
}) => (
  <>
    <div className="flex justify-between w-full text-2xl font-bold pt-4">
      <span>Total</span>
      <span>{formatCurrency(total)}</span>
    </div>
    <Button
      onClick={onCheckout}
      size="lg"
      className="w-full text-lg h-14 rounded-2xl shadow-lg"
      disabled={cartItems.length === 0 || isCheckingOut}
    >
      {isCheckingOut ? (
        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
      ) : (
        <CreditCard className="mr-3 h-6 w-6" />
      )}
      Proceed to Payment
    </Button>
  </>
);


const CompletionScreen = ({ onNewSession }: { onNewSession: () => void }) => (
  <div className="w-full h-screen flex flex-col items-center justify-center text-center p-4">
    <Card className="max-w-md w-full shadow-xl rounded-2xl">
      <CardContent className="p-10">
        <CheckCircle2 className="h-20 w-20 text-green-500 mb-6 mx-auto" />
        <h1 className="text-3xl font-bold text-primary">
          Payment Complete!
        </h1>
        <p className="text-foreground/80 mt-2 mb-8">
          Thank you for shopping with Linea. Your receipt has been sent to
          your email.
        </p>
        <Button onClick={onNewSession} size="lg" className="w-full h-14 rounded-2xl shadow-lg">
          Start a New Session
        </Button>
      </CardContent>
    </Card>
  </div>
);

    