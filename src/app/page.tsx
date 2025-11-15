
"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Store, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RoleSelectionPage() {
  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md card-paper">
        <CardHeader className="text-center items-center p-6">
          {/* Logo Placeholder */}
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-background border-2 border-dashed">
            <span className="text-sm text-muted-foreground">Logo</span>
          </div>
          <CardTitle className="font-headline text-3xl">Welcome to Linea</CardTitle>
          <CardDescription>How would you like to continue?</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-6 pt-0">
          <RoleLink
            href="/store/login"
            icon={Store}
            title="Shop Owner"
            description="Manage inventory, track sales, and view analytics."
          />
          <RoleLink
            href="/login"
            icon={User}
            title="Customer"
            description="Start a new shopping session and scan items."
          />
        </CardContent>
      </Card>
    </main>
  );
}

interface RoleLinkProps {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

const RoleLink = ({ href, icon: Icon, title, description }: RoleLinkProps) => (
  <Link
    href={href}
    className={cn(
        "group flex items-center gap-4 rounded-lg border-2 p-4 transition-all",
        "bg-background hover:bg-muted/80 hover:border-primary",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
    )}
  >
    <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 bg-background group-hover:bg-primary/10 group-hover:border-primary/50 transition-colors">
        <Icon className="h-7 w-7 text-foreground/80 group-hover:text-primary transition-colors" />
    </div>
    <div className="flex-grow">
      <p className="font-semibold text-lg text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <ChevronRight className="h-6 w-6 text-muted-foreground transition-transform group-hover:translate-x-1" />
  </Link>
);
