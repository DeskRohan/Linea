import type { SVGProps } from "react";
import Image from "next/image";

export function LineaLogo(props: SVGProps<SVGSVGElement> & { width?: number; height?: number }) {
  // The user needs to add Linea(2).png to the public/img/ folder
  return (
    <Image
      src="/img/Linea(2).png"
      alt="Linea Logo"
      width={props.width || 64}
      height={props.height || 64}
      className={props.className}
      unoptimized // Add this if the image is static and doesn't need optimization, or if you encounter issues.
    />
  );
}
