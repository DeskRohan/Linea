
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SwiftPayLogo } from "@/components/icons/logo";
import { User, Store, Loader2 } from "lucide-react";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RoleSelectionPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  // This effect will redirect the user if they are already logged in.
  // It's a simple example; a more robust solution might check for a specific role claim.
  useEffect(() => {
    if (!loading && user) {
      // Simple heuristic: if email contains 'store', redirect to store dashboard.
      // In a real app, you'd use custom claims or a user profile document.
      if (user.email?.includes('store')) {
        router.push("/store/dashboard");
      } else {
        router.push("/shopping");
      }
    }
  }, [user, loading, router]);


  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </main>
    );
  }

  // If user is logged in, show loading while redirecting
  if (user) {
    return (
       <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </main>
    );
  }


  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <SwiftPayLogo className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl">Welcome to SwiftPay</CardTitle>
          <CardDescription>How would you like to log in?</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/store/login" passHref>
            <Button
              variant="outline"
              className="w-full h-24 flex flex-col gap-2"
            >
              <Store className="h-8 w-8 text-primary" />
              <span>Shop Owner</span>
            </Button>
          </Link>
          <Link href="/login" passHref>
            <Button
              variant="outline"
              className="w-full h-24 flex flex-col gap-2"
            >
              <User className="h-8 w-8 text-primary" />
              <span>Customer</span>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
