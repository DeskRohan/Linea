
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  CreditCard,
  Package,
  LogOut,
  PlusCircle,
  MinusCircle,
  XCircle,
  Loader2,
  Trophy,
  MapPin,
  Camera,
  ScanLine,
  ShieldCheck,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { type Product } from "@/lib/products";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { collection, query, where, getDocs, limit, onSnapshot, writeBatch, doc, serverTimestamp, increment, addDoc } from "firebase/firestore";
import { useCartStore } from "@/store/cart-store";
import Link from "next/link";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import ShoppingWelcome from "@/components/ShoppingWelcome";


export type Store = {
  id: string;
  ownerUid: string;
  name: string;
  address: string;
};


export default function ShoppingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();

  const [stores, setStores] = useState<Store[] | null>(null);
  const [storesLoading, setStoresLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const scannerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);


  // Zustand store integration
  const { 
    items: cartItems, 
    store: selectedStore,
    totalPrice,
    totalItems,
    hasSeenWelcomeAnimation,
    clearCart,
    addItem, 
    updateItemQuantity,
    setStore
  } = useCartStore();


  useEffect(() => {
    if (!userLoading && !user) {
      router.replace("/login");
    }
  }, [user, userLoading, router]);


  useEffect(() => {
    if (!firestore) return;
    setStoresLoading(true);

    const storesCollection = collection(firestore, "stores");

    const unsubscribe = onSnapshot(
      storesCollection,
      (snapshot) => {
        const storesData: Store[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ownerUid: docSnap.id, // The document ID is the owner's UID
          name: docSnap.data().shopName || "Unnamed Store",
          address: docSnap.data().shopAddress || "No address provided",
        }));

        setStores(storesData);

        if (storesData.length > 0 && !selectedStore) {
          setStore(storesData[0]);
        }
        setStoresLoading(false);
      },
      (error) => {
        console.error("Error fetching stores:", error);
        toast({
          variant: "destructive",
          title: "Could not fetch stores",
          description: "Please check your connection or try again later.",
        });
        setStores([]);
        setStoresLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, toast, setStore, selectedStore]);



  useEffect(() => {
    if (isScanning) {
      scannerTimeoutRef.current = setTimeout(() => {
        setIsScanning(false);
        toast({
          variant: "destructive",
          title: "Scanner Timed Out",
          description: "No barcode was detected in time.",
        });
      }, 10000);
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
    setIsScanning(false);
    
    if (!selectedStore) {
        toast({ variant: "destructive", title: "No Store Selected", description: "Please select a store first." });
        return;
    }

    if (!firestore) {
        toast({ variant: "destructive", title: "Database not connected" });
        return;
    }

    const productsCollection = collection(firestore, `stores/${selectedStore.id}/products`);
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

        addItem(product);

    } catch (error) {
        console.error("Error fetching product:", error);
        toast({
            variant: "destructive",
            title: "Database Error",
            description: "Could not fetch product from the inventory.",
        });
    }
  };
  

  const handleStoreChange = (storeId: string) => {
    const newStore = stores?.find(s => s.id === storeId) || null;
    if (newStore) setStore(newStore);
  }


  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push("/");
  };


  const handlePayment = async () => {
    if (!user || !selectedStore || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'User, store, or database information is missing.' });
        return;
    }
    if (cartItems.length === 0) {
        toast({ variant: 'destructive', title: 'Empty Cart', description: 'Please add items to your cart before proceeding.' });
        return;
    }

    setIsProcessing(true);

    const subtotal = totalPrice();
    const cgst = subtotal * 0.09;
    const sgst = subtotal * 0.09;
    const totalAmount = subtotal + cgst + sgst;

    const orderData = {
      customerId: user.uid,
      customerName: user.displayName,
      customerEmail: user.email,
      customerPhotoURL: user.photoURL,

      storeId: selectedStore.id,
      storeName: selectedStore.name,

      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),

      subtotal,
      cgst,
      sgst,
      totalAmount,
      totalItems: totalItems(),
      createdAt: serverTimestamp(),
      status: "completed"
    };

    const ordersCollection = collection(firestore, 'orders');
    
    addDoc(ordersCollection, orderData)
    .then(async (newOrderRef) => {

        const batch = writeBatch(firestore);
        for (const item of cartItems) {
            const productRef = doc(
              firestore, 
              'stores', 
              selectedStore.id, 
              'products', 
              item.id
            );
            batch.update(productRef, {
                quantity: increment(-item.quantity)
            });
        }
        
        await batch.commit();
        
        clearCart();
        toast({
            title: "Payment Successful!",
            description: "Your order has been placed.",
        });

        router.push(`/invoice/${newOrderRef.id}`);

    })
    .catch((serverError) => {
        console.error("Error processing payment: ", serverError);
        
        // Create and emit the detailed permission error.
        const permissionError = new FirestorePermissionError({
            path: `/orders/{generatedId}`,
            operation: 'create',
            requestResourceData: orderData,
        } as SecurityRuleContext);

        errorEmitter.emit('permission-error', permissionError);

        toast({
            variant: "destructive",
            title: "Payment Failed",
            description: "There was an error creating your bill. Please check the console for details.",
        });

    })
    .finally(() => {
        setIsProcessing(false);
    });
  };



  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) return null;

  if (!hasSeenWelcomeAnimation) {
    return <ShoppingWelcome />;
  }

  return (
    <div className="min-h-screen bg-background p-4 flex justify-center">
      <ShoppingScreen
        user={user}
        stores={stores}
        storesLoading={storesLoading}
        selectedStore={selectedStore}
        isScanning={isScanning}
        onSetIsScanning={setIsScanning}
        onStoreChange={handleStoreChange}
        onScanSuccess={handleScanSuccess}
        onLogout={handleLogout}
        isProcessing={isProcessing}
        onPayment={handlePayment}
      />
    </div>
  );
}



const ShoppingScreen = ({
  user,
  stores,
  storesLoading,
  selectedStore,
  isScanning,
  onSetIsScanning,
  onStoreChange,
  onScanSuccess,
  onLogout,
  isProcessing,
  onPayment,
}: {
  user: any;
  stores: Store[] | null;
  storesLoading: boolean;
  selectedStore: Store | null;
  isScanning: boolean;
  onSetIsScanning: (isScanning: boolean) => void;
  onStoreChange: (storeId: string) => void;
  onScanSuccess: (decodedText: string) => void;
  onLogout: () => void;
  isProcessing: boolean;
  onPayment: () => void;
}) => {


  const { items: cartItems, updateItemQuantity, totalItems, totalPrice } = useCartStore();
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Shubh Prabhat";
      if (hour < 17) return "Shubh Dopahar";
      return "Shubh Sandhya";
    };
    setGreeting(getGreeting());
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
      
      {/* LEFT SIDE */}
      <Card className="card-paper flex flex-col h-full overflow-hidden lg:col-span-3">
        
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b-2">
          
          <div className="flex items-center gap-3 self-start">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-10 w-10 border-2 border-border cursor-pointer">
                  <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                  <AvatarFallback>
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
                <DropdownMenuItem asChild>
                    <Link href="/customer/orders">My Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>

            <h1 className="font-headline text-xl">
              {greeting}, {user.displayName?.split(" ")[0] || user.email}!
            </h1>
          </div>

          <div className="w-full sm:w-auto">
              <Select 
                value={selectedStore?.id ?? ""} 
                onValueChange={onStoreChange} 
                disabled={storesLoading}
              >
                <SelectTrigger className="w-full min-w-[200px]">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  <SelectValue placeholder="Select a store" />
                </SelectTrigger>

                <SelectContent>
                  {storesLoading ? (
                     <SelectItem value="loading" disabled>Loading stores...</SelectItem>
                  ) : stores && stores.length === 0 ? (
                    <SelectItem value="no-stores" disabled>No stores available</SelectItem>
                  ) : (
                    stores?.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        <div className="flex flex-col">
                          <span className="font-semibold">{store.name}</span>
                          <span className="text-xs text-muted-foreground">{store.address}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
          </div>

        </CardHeader>

        <CardContent className="flex-grow flex flex-col items-center justify-center p-4 text-center bg-foreground/5 font-mono">

          <h2 className="text-sm text-foreground/60 tracking-widest mb-2">SCANNING WINDOW</h2>

          <div className="relative w-full max-w-md aspect-video rounded-lg bg-background border-2 border-border shadow-inner overflow-hidden">

            <div className="w-full h-full relative flex items-center justify-center">
              
              {isScanning ? (
                <>
                  <Scanner onScanSuccess={onScanSuccess} />
                  <div className="absolute inset-0 pointer-events-none border-[1rem] border-background/80" />
                  <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-destructive/70 animate-pulse" />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 p-4">
                  
                  <button
                    className="h-full w-full flex flex-col items-center justify-center gap-2 text-foreground/40 hover:text-foreground transition-colors"
                    onClick={() => onSetIsScanning(true)}
                    disabled={!selectedStore}
                  >
                    <div className="p-5 rounded-full bg-foreground/5">
                      <ScanLine className="h-16 w-16" />
                    </div>

                    <h3 className="font-sans font-semibold tracking-wider mt-2">Tap to Scan</h3>
                    <p className="text-xs max-w-xs">Place a product's barcode in the scanner window.</p>
                  </button>

                  {!selectedStore && (
                    <p className="text-destructive mt-1 max-w-xs text-sm">Please select a store to begin scanning.</p>
                  )}

                </div>
              )}

            </div>
          </div>
        </CardContent>

        {/* MOBILE CART BUTTON */}
        <CardFooter className="p-4 border-t-2 border-border lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="lg" className="w-full h-14 text-lg" disabled={cartItems.length === 0}>
                <ShoppingCart className="mr-3 h-6 w-6" />
                View Cart ({totalItems()} items)
              </Button>
            </SheetTrigger>

            <SheetContent side="bottom" className="h-[90vh] flex flex-col bg-card rounded-none border-t-4 border-foreground p-0">

              <SheetHeader className="p-4 pb-0 border-b-2 border-border">
                <SheetTitle className="text-2xl">Your Cart</SheetTitle>
              </SheetHeader>

              <div className="flex-grow overflow-hidden">
                <ScrollArea className="h-full px-4">
                  <CartContent cartItems={cartItems} onQuantityChange={updateItemQuantity} />
                </ScrollArea>
              </div>

              <SheetFooter className="p-4 flex-col gap-4 bg-background sticky bottom-0 border-t-2 border-border">
                <CartFooterActions 
                  total={totalPrice()} 
                  cartItems={cartItems} 
                  onPayment={onPayment} 
                  isProcessing={isProcessing} 
                />
              </SheetFooter>

            </SheetContent>
          </Sheet>
        </CardFooter>
      </Card>



      {/* RIGHT SIDE CART (DESKTOP) */}
      <Card className="hidden lg:flex flex-col h-full overflow-hidden lg:col-span-2">
        
        <CardHeader>
          <CardTitle>Your Cart</CardTitle>
        </CardHeader>

        <CardContent className="flex-grow overflow-hidden p-0">
          <ScrollArea className="h-full px-6">
            <CartContent cartItems={cartItems} onQuantityChange={updateItemQuantity} />
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-4 flex-col gap-4 border-t-2">
          <CartFooterActions 
            total={totalPrice()} 
            cartItems={cartItems} 
            onPayment={onPayment} 
            isProcessing={isProcessing}
          />
        </CardFooter>

      </Card>

    </div>
  );
};





/* -----------------------------------------
     CART CONTENT
----------------------------------------- */
const CartContent = ({
  cartItems,
  onQuantityChange,
}: {
  cartItems: any[];
  onQuantityChange: (productId: string, newQuantity: number) => void;
}) => (
  <>
    {cartItems.length === 0 ? (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-10">
        <Package size={48} className="mb-4" />
        <p className="font-semibold text-lg">Your cart is empty</p>
        <p className="text-sm">Start scanning to add items.</p>
      </div>
    ) : (
      <div className="flex flex-col gap-4 py-4">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-3 border-b-2 border-dashed border-border/50"
          >
            <div className="flex-grow">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground font-mono">
                {formatCurrency(item.price)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => onQuantityChange(item.id, item.quantity - 1)}>
                  <MinusCircle className="h-5 w-5 text-destructive"/>
              </Button>

              <span className="font-bold text-lg min-w-[2ch] text-center">
                  {item.quantity}
              </span>

              <Button variant="ghost" size="icon" onClick={() => onQuantityChange(item.id, item.quantity + 1)}>
                  <PlusCircle className="h-5 w-5 text-primary"/>
              </Button>
            </div>

            <Button variant="ghost" size="icon" onClick={() => onQuantityChange(item.id, 0)}>
                <XCircle className="h-5 w-5 text-muted-foreground hover:text-destructive"/>
            </Button>

          </div>
        ))}
      </div>
    )}
  </>
);



/* -----------------------------------------
     CART FOOTER ACTIONS
----------------------------------------- */
const CartFooterActions = ({
  total,
  cartItems,
  onPayment,
  isProcessing,
}: {
  total: number;
  cartItems: any[];
  onPayment: () => void;
  isProcessing: boolean;
}) => {

  const subtotal = total;
  const cgst = subtotal * 0.09;
  const sgst = subtotal * 0.09;
  const finalTotal = subtotal + cgst + sgst;

  return (
    <>
      <div className="w-full space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">CGST (9%)</span>
          <span>{formatCurrency(cgst)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">SGST (9%)</span>
          <span>{formatCurrency(sgst)}</span>
        </div>
      </div>

      <div className="flex justify-between w-full text-2xl font-bold pt-4 border-t-2 mt-2">
        <span>Total</span>
        <span className="font-mono">{formatCurrency(finalTotal)}</span>
      </div>

      <Button
        onClick={onPayment}
        size="lg"
        className="w-full text-lg h-14"
        disabled={cartItems.length === 0 || isProcessing}
      >
        {isProcessing ? (
          <Loader2 className="mr-3 h-6 w-6 animate-spin" />
        ) : (
          <ShieldCheck className="mr-3 h-6 w-6" />
        )}
        {isProcessing ? 'Processing...' : 'Proceed to Payment'}
      </Button>
    </>
  );
};
