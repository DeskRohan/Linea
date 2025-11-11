
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SwiftPayLogo } from "@/components/icons/logo";
import { User, Store } from "lucide-react";
import { useUser } from "@/firebase/auth/use-user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RoleSelectionPage() {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            // User is already logged in, decide where to send them
            const idTokenResult = user.getIdTokenResult();
            idTokenResult.then(token => {
                if (token.claims.admin) {
                    router.push("/admin");
                } else if (token.claims.shop_owner) {
                    router.push("/store/dashboard");
                } else {
                    router.push("/shopping");
                }
            });
        }
    }, [user, loading, router]);
    
    if (loading || user) {
        return null;
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
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                    <Store className="h-8 w-8 text-primary" />
                    <span>Shop Owner</span>
                </Button>
            </Link>
            <Link href="/login" passHref>
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                    <User className="h-8 w-8 text-primary" />
                    <span>Customer</span>
                </Button>
            </Link>
        </CardContent>
      </Card>
    </main>
  );
}
