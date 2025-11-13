
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider, User } from "firebase/auth";
import { useAuth, useFirestore } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

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
import { LineaLogo } from "@/components/icons/linea-logo";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  // Function to create a user document in Firestore
  const createUserDocument = async (user: User) => {
    if (!user) return;
    const userRef = doc(firestore, "users", user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
    }, { merge: true });
  };

  const handleEmailSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      
      await createUserDocument(userCredential.user);

      toast({
        title: "Signup Successful",
        description: "You can now log in.",
      });
      router.push("/login");
    } catch (error: any) {
      console.error("Signup failed:", error);
      let description = "Could not create your account.";
       if (error.code === 'auth/operation-not-allowed') {
        description = "Email/Password sign-up is not enabled. Please enable it in the Firebase console.";
      } else if (error.message) {
        description = error.message;
      }
      toast({
        variant: "destructive",
        title: "Signup Failed",
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
      const result = await signInWithPopup(auth, provider);
      
      await createUserDocument(result.user);

      toast({ title: "Sign-up Successful" });
      router.push("/shopping");
    } catch (error: any) {
       if (error.code === 'auth/popup-closed-by-user') {
            // User closed the popup, do nothing.
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
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-100 p-4">
      <div className="absolute top-8">
        <LineaLogo className="h-20 w-20" />
      </div>
      <Card className="w-full max-w-sm shadow-xl rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>
            Join Linea and enjoy seamless shopping.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Full Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="John Doe"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isLoading}
              />
            </div>
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
              Sign Up with Email
            </Button>
          </form>
           <Button variant="outline" className="w-full mt-4" onClick={handleGoogleSignIn} disabled={isLoading}>
             <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.1 512 0 401.9 0 265.8 0 129.7 110.1 20 244 20c66.5 0 125.1 24.4 169.6 63.7L373.1 120.1C338.3 89.2 295.6 70 244 70c-78.6 0-142.9 64.3-142.9 142.9s64.3 142.9 142.9 142.9c85.3 0 131.9-58.4 136.8-98.2H244v-73.8h236.1c2.3 12.7 3.9 26.1 3.9 40.8z"></path></svg>
            Sign up with Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 justify-center text-center text-sm text-muted-foreground">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
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
