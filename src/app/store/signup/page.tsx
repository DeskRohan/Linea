
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useAuth, useFirestore } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";

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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Store, Mail, Lock, Key } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StoreSignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [activationKey, setActivationKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [activationKeyError, setActivationKeyError] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const handleEmailSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setEmailError("");
    setActivationKeyError("");
    let hasError = false;

    if (!email.endsWith("@linea.com")) {
      setEmailError("Only emails from @linea.com are allowed.");
      hasError = true;
    }

    if (activationKey !== "L1N-51M-9M9-NV5") {
      setActivationKeyError("Invalid activation key.");
      hasError = true;
    }

    if(hasError) {
        setIsLoading(false);
        return;
    }

    try {
      // Key is valid, proceed with creating the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: storeName });

      // Create the store document
      const storeRef = doc(firestore, "stores", userCredential.user.uid);
      await setDoc(storeRef, {
          shopName: storeName,
          ownerEmail: email,
          createdAt: new Date(),
      });

      toast({
        title: "Store Account Created & Logged In",
        description: "Redirecting to your dashboard...",
      });
      router.push("/store/dashboard");

    } catch (error: any) {
      console.error("Signup failed: ", error);
       toast({
        variant: "destructive",
        title: "Signup Failed",
        description: error.message || "An unexpected error occurred. The email might already be in use.",
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm card-paper">
        <header className="title-bar">
          <h1 className="text-lg">Create Your Store</h1>
        </header>
        <CardContent className="p-6">
          <CardDescription className="text-center mb-4">
            Join Linea and start selling today. An activation key is required.
          </CardDescription>
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName" className="flex items-center gap-2"><Store />Store Name</Label>
              <Input
                id="storeName"
                type="text"
                placeholder="Enter your store name"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                disabled={isLoading}
                className="input-paper"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2"><Mail />Business Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your business email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className={cn("input-paper", emailError && "border-destructive animate-shake")}
              />
              {emailError && <p className="text-sm font-medium text-destructive">{emailError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2"><Lock />Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Choose a strong password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="input-paper"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activationKey" className="flex items-center gap-2"><Key />Activation Key</Label>
              <Input
                id="activationKey"
                type="text"
                placeholder="Enter your activation key"
                required
                value={activationKey}
                onChange={(e) => setActivationKey(e.target.value)}
                disabled={isLoading}
                className={cn("input-paper", activationKeyError && "border-destructive animate-shake")}
              />
              {activationKeyError && <p className="text-sm font-medium text-destructive">{activationKeyError}</p>}
               <p className="text-xs text-muted-foreground px-1">
                Don't have a key?{' '}
                <a
                  href="https://wa.me/9110218701?text=Hello!%20I'm%20setting%20up%20my%20store%20on%20Linea%20and%20would%20like%20to%20request%20an%20activation%20key.%20Thank%20you!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-primary"
                >
                  Contact support
                </a>
              </p>
            </div>
            <Button type="submit" className="w-full btn-paper btn-primary" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Store
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 justify-center text-center text-sm text-muted-foreground p-6 pt-0">
          <p>
            Already have an account?{" "}
            <Link
              href="/store/login"
              className="text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
