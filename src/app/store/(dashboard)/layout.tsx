

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Boxes,
  BarChart3,
  Users,
  Settings,
  Store,
  PanelLeft,
  Mail,
  Instagram,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    router.push("/");
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/store/dashboard"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Store className="h-6 w-6" />
            <span className="sr-only">My Store</span>
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
                <span className="">My Store</span>
              </Link>
              <NavLinks mobile />
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full"
                >
                  <Avatar>
                    <AvatarImage src={""} />
                    <AvatarFallback>S</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DialogTrigger asChild>
                  <DropdownMenuItem>Support</DropdownMenuItem>
                </DialogTrigger>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Contact Support</DialogTitle>
                <DialogDescription>
                  Contact the application architect for support.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                  <div className="font-semibold">
                    <p className="text-lg">Rohan Godakhindi</p>
                    <p className="text-sm text-muted-foreground">Application Architect</p>
                  </div>

                  <div className="space-y-3">
                     <a href="https://wa.me/9110218701" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                      <MessageSquare className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">9110218701</span>
                    </a>
                    <a href="mailto:rohangodakhindi@gmail.com" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <span className="text-sm font-medium">rohangodakhindi@gmail.com</span>
                    </a>
                    <a href="https://www.instagram.com/_irohang" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                      <Instagram className="h-5 w-5 text-pink-500" />
                      <span className="text-sm font-medium">_irohang</span>
                    </a>
                  </div>

              </div>
            </DialogContent>
          </Dialog>
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
    { href: "/store/dashboard", text: "Dashboard", icon: LayoutDashboard },
    { href: "/store/inventory", text: "Inventory", icon: Boxes },
    { href: "/store/analytics", text: "Analytics", icon: BarChart3 },
    { href: "/store/customers", text: "Customers", icon: Users },
    { href: "/store/settings", text: "Settings", icon: Settings },
  ];

  const baseClasses = "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
  const activeClasses = "bg-muted text-primary"

  const mobileClasses = "text-lg font-semibold";
  const desktopClasses = "text-base";

  return (
    <>
      {links.map((link) => {
        const isActive = pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              baseClasses,
              mobile ? mobileClasses : desktopClasses,
              isActive && activeClasses
            )}
          >
            <Icon className="h-5 w-5" />
            {link.text}
          </Link>
        );
      })}
    </>
  );
};
