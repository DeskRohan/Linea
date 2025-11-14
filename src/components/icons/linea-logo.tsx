
import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

export function LineaLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      className={cn("w-16 h-16", props.className)}
    >
      <circle cx="12" cy="12" r="11.5" className="stroke-foreground" strokeWidth="1" />
      <path
        d="M9 8V16H15"
        stroke="hsl(var(--foreground))"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
