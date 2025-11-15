
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const activationKey = searchParams.get('key');

  useEffect(() => {
    if (!activationKey) {
        toast({
            variant: "destructive",
            title: "Invalid Access",
            description: "No activation key provided. Please use the link sent to your email.",
        });
    }
  }, [activationKey, toast]);


  const handleEmailSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setEmailError("");

    if (!email.endsWith("@linea.com")) {
        setEmailError("Only emails from @linea.com are allowed.");
        setIsLoading(false);
        return;
    }

    if (!activationKey) {
         toast({
            variant: "destructive",
            title: "Missing Activation Key",
            description: "Please use the unique sign-up link from your email.",
        });
        setIsLoading(false);
        return;
    }

    // In a real implementation, you would validate the activationKey against
    // a backend service (e.g., a Cloud Function) here.
    // For now, we assume if a key is present, it's valid.

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: storeName });

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
            Complete the form below to set up your store account.
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
            
            <Button type="submit" className="w-full btn-paper btn-primary" disabled={isLoading || !activationKey}>
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
