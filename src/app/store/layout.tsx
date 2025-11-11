
"use client";

import * as React from "react"
import Link from "next/link";
import {
  Boxes,
  LayoutDashboard,
  BarChart3,
  Settings,
  LogOut,
  Store,
  PanelLeft,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/firebase/auth/use-user";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const auth = getAuth();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/store/login");
    }
  }, [user, loading, router]);


  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };
  
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/store/dashboard"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Store className="h-6 w-6" />
            <span className="sr-only">{user?.displayName || "My Store"}</span>
          </Link>
          <NavLinks />
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="/store/dashboard"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Store className="h-6 w-6" />
                <span className="">{user?.displayName || "My Store"}</span>
              </Link>
              <NavLinks mobile />
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                    <AvatarImage src={user?.photoURL ?? ''} />
                    <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/store/settings')}>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}

const NavLinks = ({ mobile }: { mobile?: boolean }) => {
  const pathname = usePathname();
  const links = [
    { href: "/store/dashboard", text: "Dashboard" },
    { href: "/store/inventory", text: "Inventory" },
    { href: "/store/analytics", text: "Analytics" },
    { href: "/store/customers", text: "Customers" },
  ];

  const mobileClasses = "text-muted-foreground hover:text-foreground";
  const desktopClasses = "text-muted-foreground transition-colors hover:text-foreground";

  return (
    <>
      {links.map(link => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "font-medium",
              mobile ? mobileClasses : desktopClasses,
              isActive && "text-foreground"
            )}
          >
            {link.text}
          </Link>
        )
      })}
    </>
  )
}
