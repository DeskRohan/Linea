
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "@/firebase";

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
import { Loader2 } from "lucide-react";

const VALID_ACTIVATION_KEY = "rhlinea2k25";

export default function StoreSignupPage() {
  const [email, setEmail] = useState("tcc@linea.com");
  const [password, setPassword] = useState("tcc2k25");
  const [storeName, setStoreName] = useState("The Corner Collection");
  const [activationKey, setActivationKey] = useState(VALID_ACTIVATION_KEY);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();

  const handleEmailSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (activationKey !== VALID_ACTIVATION_KEY) {
      toast({
        variant: "destructive",
        title: "Invalid Activation Key",
        description:
          "Please enter the correct activation key to create a store.",
      });
      setIsLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: "Store Account Created & Logged In",
        description: "Redirecting to your dashboard...",
      });
      router.push("/store/dashboard");
    } catch (error: any) {
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
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Your Store</CardTitle>
          <CardDescription>
            Join Linea and start selling today.
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
