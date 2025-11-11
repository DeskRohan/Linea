
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
  PanelLeft
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
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col h-full">
          <div className="flex items-center gap-2 p-4 border-b">
              <Store className="w-8 h-8 text-primary" />
              <span className="text-lg font-semibold">{user?.displayName || "My Store"}</span>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <div className="flex flex-col gap-1 px-4">
              <NavLinks />
            </div>
          </div>
          <div className="mt-auto p-4 border-t">
              <div className="flex items-center gap-4">
                  {loading ? (
                  <Skeleton className="h-10 w-10 rounded-full" />
                  ) : user ? (
                  <Avatar>
                      <AvatarImage src={user.photoURL ?? ''} />
                      <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  ) : null}
                  <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{user?.displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                      <LogOut className="h-5 w-5" />
                  </Button>
              </div>
          </div>
        </nav>
      </aside>
      <div className="flex flex-col sm:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:hidden">
           <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs flex flex-col p-0">
              <nav className="flex flex-col h-full">
                <div className="flex items-center gap-2 p-4 border-b">
                    <Store className="w-8 h-8 text-primary" />
                    <span className="text-lg font-semibold">{user?.displayName || "My Store"}</span>
                </div>
                <div className="flex-1 overflow-auto py-2">
                  <div className="flex flex-col gap-1 px-4">
                    <NavLinks />
                  </div>
                </div>
                 <div className="mt-auto p-4 border-t">
                    <div className="flex items-center gap-4">
                        {loading ? (
                        <Skeleton className="h-10 w-10 rounded-full" />
                        ) : user ? (
                        <Avatar>
                            <AvatarImage src={user.photoURL ?? ''} />
                            <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        ) : null}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{user?.displayName}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleLogout}>
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

const NavLinks = () => {
  const pathname = usePathname();
  const links = [
    { href: "/store/dashboard", icon: LayoutDashboard, text: "Dashboard" },
    { href: "/store/inventory", icon: Boxes, text: "Manage Inventory" },
    { href: "#", icon: BarChart3, text: "Analytics" },
    { href: "/store/settings", icon: Settings, text: "Shop Settings" },
  ];

  return (
    <>
      {links.map(link => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              isActive && "bg-muted text-primary"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.text}
          </Link>
        )
      })}
    </>
  )
}
