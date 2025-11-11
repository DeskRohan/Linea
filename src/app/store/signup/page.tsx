
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useAuth, useUser, useFirestore } from "@/firebase";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SwiftPayLogo } from "@/components/icons/logo";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const VALID_ACTIVATION_KEY = "rhlinea2k25";

export default function StoreSignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [activationKey, setActivationKey] = useState("");
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, loading } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      router.push("/store/dashboard");
    }
  }, [user, router]);

  const handleEmailSignUp = async (event: React.FormEvent) => {
    event.preventDefault();

    if (activationKey !== VALID_ACTIVATION_KEY) {
      toast({
        variant: "destructive",
        title: "Invalid Activation Key",
        description:
          "Please enter the correct activation key to create a store.",
      });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const newUser = userCredential.user;

      if (newUser) {
        await updateProfile(newUser, {
          displayName: storeName,
        });

        // Create a document for the store in Firestore
        const storeDocRef = doc(firestore, "stores", newUser.email!);
        await setDoc(storeDocRef, {
          owner: newUser.email,
          shopName: storeName,
          createdAt: new Date().toISOString(),
        });
      }

      toast({
        title: "Store Created",
        description: "You can now log in to your store dashboard.",
      });
      router.push("/store/dashboard");
    } catch (error: any) {
      console.error("Store Signup Error:", error);
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: error.message,
      });
    }
  };

  if (loading) {
     return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (user) {
    return null;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <SwiftPayLogo className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl">Create Your Store</CardTitle>
          <CardDescription>
            Join SwiftPay and start selling today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                type="text"
                placeholder="My Awesome Store"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Business Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="store@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activationKey">Activation Key</Label>
              <Input
                id="activationKey"
                type="password"
                placeholder="Enter your activation key"
                required
                value={activationKey}
                onChange={(e) => setActivationKey(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Create Store
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 justify-center text-center text-sm text-muted-foreground">
          <p>
            Already have an account?{" "}
            <Link
              href="/store/login"
              className="text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
          <Link href="/" className="text-primary hover:underline">
            Back to role selection
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
