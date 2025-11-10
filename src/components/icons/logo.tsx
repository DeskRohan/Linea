import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

export function SwiftPayLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      className={cn("w-16 h-16", props.className)}
    >
      <circle cx="12" cy="12" r="11.5" className="stroke-primary" strokeWidth="1" />
      <path
        d="M9.5 7.5L13.5 7.5C14.8807 7.5 16 8.61929 16 10V10C16 11.3807 14.8807 12.5 13.5 12.5H8.5"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 16.5L10.5 16.5C9.11929 16.5 8 15.3807 8 14V14C8 12.6193 9.11929 11.5 10.5 11.5H15.5"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
