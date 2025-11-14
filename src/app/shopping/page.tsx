
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
import { collection, query, where, getDocs, limit, onSnapshot } from "firebase/firestore";
import { useCartStore } from "@/store/cart-store";
import { type Store } from "@/lib/types";
import Link from "next/link";


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

  // Zustand store integration
  const { 
    items: cartItems, 
    store: selectedStore,
    addItem, 
    updateItemQuantity,
    setStore,
    totalItems
  } = useCartStore();


  useEffect(() => {
    if (!userLoading && !user) {
      router.replace("/login");
    }
  }, [user, userLoading, router]);

  // Fetch stores in real-time
  useEffect(() => {
    if (!firestore) return;
    setStoresLoading(true);
    const storesCollection = collection(firestore, "stores");
    const unsubscribe = onSnapshot(storesCollection, (snapshot) => {
      const storesData: Store[] = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().shopName || "Unnamed Store",
          address: doc.data().shopAddress || "No address provided"
      }));
      
      setStores(storesData);
      
      if (storesData.length > 0 && !selectedStore) {
        setStore(storesData[0]);
      }
      setStoresLoading(false);
    }, (error) => {
      console.error("Error fetching stores:", error);
      toast({
        variant: "destructive",
        title: "Could not fetch stores",
        description: "Please check your connection or try again later.",
      });
      setStores([]);
      setStoresLoading(false);
    });

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
    setIsScanning(false);
    
    if (!selectedStore) {
        toast({ variant: "destructive", title: "No Store Selected", description: "Please select a store first." });
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
      setStore(newStore);
  }

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return null; // The useEffect hook will redirect.
  }

  return (
    <div className="min-h-screen bg-background p-4">
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
}) => {
  const { items: cartItems, updateItemQuantity, totalItems, totalPrice } = useCartStore();

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      
      {/* Left Side: Scanner and User Info */}
      <Card className="card-paper flex flex-col h-full overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
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
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <h1 className="font-headline text-xl">Scan & Go</h1>
          </div>
          <div className="flex items-center gap-2">
              <Select value={selectedStore?.id ?? ""} onValueChange={onStoreChange} disabled={storesLoading}>
                <SelectTrigger className="w-auto sm:w-[220px] input-paper">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  <SelectValue placeholder="Select a store" />
                </SelectTrigger>
                <SelectContent>
                  {storesLoading ? (
                     <SelectItem value="loading" disabled>Loading stores...</SelectItem>
                  ) : stores && stores.length === 0 ? (
                    <SelectItem value="no-stores" disabled>No stores available</SelectItem>
                  ) : (
                    stores && stores.map((store) => (
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

        <CardContent className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <div className="relative w-full max-w-[400px] aspect-square border-4 border-dashed border-border/30 p-2">
              <div className="w-full h-full relative flex items-center justify-center bg-white/50">
                  {isScanning ? (
                      <>
                          <Scanner onScanSuccess={onScanSuccess} />
                      </>
                  ) : (
                      <div className="flex flex-col items-center justify-center gap-4">
                          <Button
                              variant="ghost"
                              className="h-48 w-48"
                              onClick={() => onSetIsScanning(true)}
                              disabled={!selectedStore}
                          >
                              <Camera className="h-24 w-24 text-foreground/20" />
                          </Button>
                           <h2 className="text-xl font-headline">Tap to Scan Item</h2>
                           {!selectedStore && (
                              <p className="text-destructive mt-1 max-w-xs">Please select a store to begin scanning.</p>
                           )}
                      </div>
                  )}
              </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 border-t lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="lg" className="btn-paper btn-primary w-full h-14 text-lg" disabled={cartItems.length === 0}>
                <ShoppingCart className="mr-3 h-6 w-6" />
                View Cart ({totalItems()} items)
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh] flex flex-col bg-card rounded-none border-t-4 border-foreground p-0">
              <SheetHeader className="p-4 pb-0 border-b-2 border-border">
                <SheetTitle className="font-headline text-2xl">Your Cart</SheetTitle>
              </SheetHeader>
              <div className="flex-grow overflow-hidden">
                <ScrollArea className="h-full px-4">
                  <CartContent
                    cartItems={cartItems}
                    onQuantityChange={updateItemQuantity}
                  />
                </ScrollArea>
              </div>
              <SheetFooter className="p-4 !flex-col gap-4 bg-background sticky bottom-0 border-t-2 border-border">
                <CartFooterActions total={totalPrice()} cartItems={cartItems} />
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </CardFooter>
      </Card>

      {/* Right Side: Cart - Hidden on mobile, visible on desktop */}
      <Card className="hidden lg:flex flex-col h-full overflow-hidden card-paper">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Your Cart</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden p-0">
          <ScrollArea className="h-full px-6">
            <CartContent
              cartItems={cartItems}
              onQuantityChange={updateItemQuantity}
            />
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 !flex-col gap-4 border-t-2">
          <CartFooterActions total={totalPrice()} cartItems={cartItems} />
        </CardFooter>
      </Card>

    </div>
  );
};


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
            <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="border-2 border-border object-cover" data-ai-hint={item.imageHint}/>
            <div className="flex-grow">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground font-mono">
                {formatCurrency(item.price)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => onQuantityChange(item.id, item.quantity - 1)}>
                  <MinusCircle className="h-5 w-5 text-destructive"/>
              </Button>
              <span className="font-bold text-lg min-w-[2ch] text-center">
                  {item.quantity}
              </span>
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
  cartItems,
}: {
  total: number;
  cartItems: any[];
}) => {

  return (
    <>
      <div className="flex justify-between w-full text-2xl font-bold font-headline pt-4">
        <span>Total</span>
        <span className="font-mono">{formatCurrency(total)}</span>
      </div>
      <Button
        asChild
        size="lg"
        className="btn-paper btn-primary w-full text-lg h-14"
        disabled={cartItems.length === 0}
      >
        <Link href="/checkout">
          <CreditCard className="mr-3 h-6 w-6" />
          Proceed to Checkout
        </Link>
      </Button>
    </>
  );
};
