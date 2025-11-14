
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { LineaLogo } from "@/components/icons/linea-logo";
import { User, Store } from "lucide-react";

export default function RoleSelectionPage() {

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm card-paper">
        <header className="title-bar">
          <h1 className="text-lg">Welcome to Linea</h1>
        </header>
        <div className="p-6 text-center">
           <div className="flex justify-center mb-4">
            <LineaLogo className="h-16 w-16" />
          </div>
          <p className="mb-6">How would you like to log in?</p>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-0">
            <Link href="/store/login" passHref>
              <Button
                variant="outline"
                className="w-full h-32 flex flex-col gap-2 btn-paper"
              >
                <Store className="h-10 w-10 text-foreground" />
                <span className="font-semibold">Shop Owner</span>
              </Button>
            </Link>
            <Link href="/login" passHref>
              <Button
                variant="outline"
                className="w-full h-32 flex flex-col gap-2 btn-paper"
              >
                <User className="h-10 w-10 text-foreground" />
                <span className="font-semibold">Customer</span>
              </Button>
            </Link>
          </CardContent>
        </div>
      </Card>
    </main>
  );
}
