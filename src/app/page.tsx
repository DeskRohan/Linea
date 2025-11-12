
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
import { LineaLogo } from "@/components/icons/linea-logo";
import { User, Store } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RoleSelectionPage() {

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader className="text-center space-y-4">
           <div className="flex justify-center">
            <LineaLogo className="h-20 w-20" />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to Linea</CardTitle>
          <CardDescription>How would you like to log in?</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          <Link href="/store/login" passHref>
            <Button
              variant="outline"
              className="w-full h-32 flex flex-col gap-2 rounded-xl transition-all hover:scale-105 hover:shadow-lg"
            >
              <Store className="h-10 w-10 text-primary" />
              <span className="font-semibold">Shop Owner</span>
            </Button>
          </Link>
          <Link href="/login" passHref>
            <Button
              variant="outline"
              className="w-full h-32 flex flex-col gap-2 rounded-xl transition-all hover:scale-105 hover:shadow-lg"
            >
              <User className="h-10 w-10 text-primary" />
              <span className="font-semibold">Customer</span>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
