
"use client";

import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PlusCircle, Loader2, ScanLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type Product } from "@/lib/products";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, onSnapshot, query, where } from "firebase/firestore";
import { formatCurrency } from "@/lib/utils";
import Scanner from "@/components/scanner";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
  barcode: z.string().min(1, "Barcode is required"),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function InventoryPage() {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<Product[]>([]);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const firestore = useFirestore();
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    const storeId = user.uid;
    const productsCollection = collection(firestore, "stores", storeId, "products");
    
    const unsubscribe = onSnapshot(productsCollection, (snapshot) => {
      const products: Product[] = [];
      snapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });
      setInventory(products);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching inventory:", error);
      toast({
        variant: "destructive",
        title: "Error Fetching Inventory",
        description: "Could not load products. Please check your connection and permissions."
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore, toast]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      quantity: 0,
      barcode: "",
    },
  });

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    if (!user) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to add products." });
        return;
    }
    const storeId = user.uid;
    const productsCollection = collection(firestore, "stores", storeId, "products");

    try {
        await addDoc(productsCollection, {
            ...data,
            imageUrl: `https://picsum.photos/seed/${data.barcode}/200/200`,
            imageHint: data.name.split(" ").slice(0, 2).join(" ").toLowerCase()
        });

        toast({
            title: "Product Added",
            description: `${data.name} has been added to your inventory.`,
        });
        form.reset();
        setIsAddProductDialogOpen(false);
    } catch (error: any) {
        console.error("Error adding product: ", error);
        toast({
            variant: "destructive",
            title: "Error adding product",
            description: error.message || "An unexpected error occurred.",
        });
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    form.setValue("barcode", decodedText, { shouldValidate: true });
    setIsScannerOpen(false);
    toast({
        title: "Barcode Scanned!",
        description: `Value: ${decodedText}`,
    });
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Inventory Management</h1>
        <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Enter the details for the new product. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Green Tea" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (INR)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 150.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode (ID)</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input placeholder="Scan or enter barcode" {...field} />
                        </FormControl>
                        <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                            <DialogTrigger asChild>
                                <Button type="button" variant="outline" size="icon">
                                    <ScanLine className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Scan Barcode</DialogTitle>
                                    <DialogDescription>
                                    Position the barcode inside the frame to scan it.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="w-full aspect-square rounded-lg overflow-hidden">
                                    <Scanner onScanSuccess={handleScanSuccess} />
                                </div>
                            </DialogContent>
                        </Dialog>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Product
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Products</CardTitle>
          <CardDescription>
            The list of all products available in your store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
          ) : inventory.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
                <p>No products found in your inventory.</p>
                <p>Click "Add Product" to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Barcode</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell className="text-center">{product.quantity}</TableCell>
                    <TableCell className="text-right font-mono">{product.barcode}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
