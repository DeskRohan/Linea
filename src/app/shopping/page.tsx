
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
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return null; // The useEffect hook will redirect.
  }

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
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
              <Select value={selectedStore?.id ?? ""} onValueChange={onStoreChange} disabled={storesLoading}>
                <SelectTrigger className="w-auto sm:w-[220px] bg-background border-2 rounded-full shadow-inner">
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
                              disabled={!selectedStore}
                          >
                              <Camera className="h-20 w-20 text-primary/50" />
                          </Button>
                           <h2 className="text-xl font-semibold">Tap to Scan</h2>
                           {selectedStore ? (
                              <p className="text-foreground/80 mt-1 max-w-xs">Click the button to add items to your cart.</p>
                           ) : (
                              <p className="text-destructive/80 mt-1 max-w-xs">Please select a store to begin scanning.</p>
                           )}
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
                View Cart ({totalItems()} items)
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
                    onQuantityChange={updateItemQuantity}
                  />
                </ScrollArea>
              </div>
              <SheetFooter className="p-4 !flex-col gap-4 bg-background/95 sticky bottom-0 border-t">
                <CartFooterActions total={totalPrice()} cartItems={cartItems} />
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
              onQuantityChange={updateItemQuantity}
            />
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 !flex-col gap-4 border-t">
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
  cartItems,
}: {
  total: number;
  cartItems: any[];
}) => {

  return (
    <>
      <div className="flex justify-between w-full text-2xl font-bold pt-4">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
      <Button
        asChild
        size="lg"
        className="w-full text-lg h-14 rounded-2xl shadow-lg"
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
