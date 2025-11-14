
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuth } from "@/firebase";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineaLogo } from "@/components/icons/linea-logo";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("rohangodakhindi@gmail.com");
  const [password, setPassword] = useState("RohanG01!");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect to the generic customer page, which will handle routing to orders
      router.push("/customer");
    } catch (error: any) {
      console.error("Login failed:", error);
      let description = "Please check your email and password.";
      if (error.code === 'auth/operation-not-allowed') {
        description = "Email/Password sign-in is not enabled. Please enable it in the Firebase console.";
      } else if (error.message) {
        description = error.message;
      }
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        router.push("/customer");
    } catch (error: any) {
        if (error.code === 'auth/popup-closed-by-user') {
            // User closed the popup, do nothing
        } else if (error.code === 'auth/operation-not-allowed') {
            toast({
                variant: "destructive",
                title: "Google Sign-In Disabled",
                description: "Google Sign-In is not enabled for this project. Please enable it in the Firebase console.",
            });
        } else {
            console.error("Google Sign-In failed:", error);
            toast({
                variant: "destructive",
                title: "Google Sign-In Failed",
                description: error.message || "Could not sign in with Google.",
            });
        }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Link href="/" className="absolute top-8">
          <LineaLogo className="h-16 w-16" />
      </Link>
      <Card className="w-full max-w-sm card-paper">
        <header className="title-bar">
            <h1 className="text-lg">Customer Login</h1>
        </header>
        <CardContent className="p-6">
          <p className="text-center text-sm mb-4">
            Sign in to start your shopping session.
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="input-paper"
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
                className="input-paper"
              />
            </div>
            <Button type="submit" className="w-full btn-paper btn-primary" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
           <Button variant="outline" className="w-full mt-4 btn-paper" onClick={handleGoogleSignIn} disabled={isLoading}>
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.1 512 0 401.9 0 265.8 0 129.7 110.1 20 244 20c66.5 0 125.1 24.4 169.6 63.7L373.1 120.1C338.3 89.2 295.6 70 244 70c-78.6 0-142.9 64.3-142.9 142.9s64.3 142.9 142.9 142.9c85.3 0 131.9-58.4 136.8-98.2H244v-73.8h236.1c2.3 12.7 3.9 26.1 3.9 40.8z"></path></svg>
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <p className="w-full text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
