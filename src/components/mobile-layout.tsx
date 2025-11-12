
"use client";

import { Home, ScanLine, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/shopping", icon: ScanLine, label: "Scan" },
  { href: "#", icon: ShoppingCart, label: "Cart", isSheetTrigger: true },
  { href: "#", icon: User, label: "Profile" },
];

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen w-full max-w-lg mx-auto bg-background">
      <main className="flex-grow overflow-y-auto">{children}</main>
      <nav className="flex items-center justify-around p-2 border-t border-border/50 bg-card/10 backdrop-blur-sm">
        {navItems.map((item) => {
          const isActive = !item.isSheetTrigger && pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.isSheetTrigger ? "#" : item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors w-20",
                isActive
                  ? "text-primary font-bold"
                  : "text-foreground/60 hover:text-primary"
              )}
              // For cart, this could trigger a sheet instead of navigating.
              // For this example, we'll keep it simple.
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
