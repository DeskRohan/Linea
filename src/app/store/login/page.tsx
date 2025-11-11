
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithRedirect, User as FirebaseUser } from "firebase/auth";
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
import { Chrome } from "lucide-react";
import { useUser } from "@/firebase/auth/use-user";

export default function StoreLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const auth = getAuth();
  const { toast } = useToast();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && user) {
      handleLoginSuccess(user);
    }
  }, [user, loading, router]);

  const handleLoginSuccess = async (user: FirebaseUser) => {
    if (user.email === 'root.linea@gmail.com') {
      router.push("/store/dashboard");
      return;
    }
    const idTokenResult = await user.getIdTokenResult();
    if (idTokenResult.claims.admin) {
      router.push("/admin");
    } else if (idTokenResult.claims.shop_owner) {
      router.push("/store/dashboard");
    }
    else {
      // Not a shop owner, maybe redirect to an error page or main login
      router.push("/");
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: error.message,
      });
    }
  };
  
  if (loading || user) {
    return null;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-sm shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <SwiftPayLogo className="h-16 w-16" />
            </div>
            <CardTitle className="text-2xl">Shop Owner Login</CardTitle>
            <CardDescription>Sign in to manage your store.</CardDescription>
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
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
              <Chrome className="mr-2 h-4 w-4" />
              Google
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 justify-center text-center text-sm text-muted-foreground">
              <p>
                  Don't have a store yet?{" "}
                  <Link href="/store/signup" className="text-primary hover:underline">
                      Create your store
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
