
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
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

export default function StoreLoginPage() {
  const [email, setEmail] = useState("tcc@linea.com");
  const [password, setPassword] = useState("tcc2k25");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      // First, try to sign in
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/store/dashboard");
    } catch (error: any) {
      // If sign-in fails because the user doesn't exist, create the account
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          toast({
            title: "Account Created & Logged In",
            description: "Welcome! Your new store account has been created.",
          });
          router.push("/store/dashboard");
        } catch (signUpError: any) {
          console.error("Signup failed after login attempt:", signUpError);
          toast({
            variant: "destructive",
            title: "Signup Failed",
            description: signUpError.message || "Could not create your store account.",
          });
        }
      } else {
        // Handle other login errors (e.g., wrong password)
        console.error("Login failed:", error);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message || "Please check your email and password.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Shop Owner Login</CardTitle>
          <CardDescription>Sign in or create your store account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </CardContent>
         <CardFooter className="flex flex-col gap-4 justify-center text-center text-sm text-muted-foreground">
            <Link href="/" className="text-primary hover:underline">
              Back to role selection
            </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
