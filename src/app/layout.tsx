
"use client";

import "./globals.css";
import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { Playfair_Display, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import SplashScreen from "@/components/SplashScreen";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-playfair-display",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-ibm-plex-mono'
})


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <html lang="en" suppressHydrationWarning className={`${playfairDisplay.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <head>
        <title>Linea Mobile</title>
        <meta name="description" content="A contactless scan-as-you-go shopping experience." />
      </head>
      <body className="font-body antialiased">
        {isLoading ? (
          <SplashScreen onFinished={() => setIsLoading(false)} />
        ) : (
          <FirebaseClientProvider>
            {children}
            <Toaster />
          </FirebaseClientProvider>
        )}
      </body>
    </html>
  );
}
