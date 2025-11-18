
'use client';

import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { cn } from '@/lib/utils';
// The import was removed as it's incorrect for public assets.

export default function SplashScreen({ onFinished }: { onFinished: () => void }) {
  const [isMounted, setIsMounted] = useState(false);
  const [showText, setShowText] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    // Fetch animation data from the public directory
    fetch('/animations/splash.json')
      .then((response) => response.json())
      .then((data) => {
        setAnimationData(data);
      })
      .catch((error) => console.error('Error loading animation:', error));

    setIsMounted(true);
    
    const textTimer = setTimeout(() => {
        setShowText(true);
    }, 1000); // Show text 1 second after component mounts

    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 4200); // Start fading out after 4.2 seconds

    const finishTimer = setTimeout(() => {
      onFinished();
    }, 5000); // Fully hide after 5 seconds

    return () => {
      clearTimeout(textTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinished]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-700 ease-out p-4',
        isFadingOut ? 'opacity-0' : 'opacity-100'
      )}
    >
      <div
        className={cn(
          'w-full max-w-md transition-all duration-1000 ease-out',
          isMounted ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        )}
      >
        {animationData && <Lottie animationData={animationData} className="w-full h-auto" loop={false} />}
      </div>
      <div
        className={cn(
          'text-center transition-all duration-1000 ease-out mt-4',
           showText ? 'opacity-100' : 'opacity-0'
        )}
      >
        <p className="text-lg font-headline text-foreground">Linea</p>
        <p className="text-sm text-muted-foreground">built by Simplinovus</p>
      </div>
    </div>
  );
}
