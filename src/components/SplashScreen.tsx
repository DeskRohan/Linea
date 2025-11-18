
'use client';

import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { cn } from '@/lib/utils';
import splashAnimation from '../../../public/animations/splash.json';

export default function SplashScreen({ onFinished }: { onFinished: () => void }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2500); // Start fading out after 2.5 seconds

    const finishTimer = setTimeout(() => {
      onFinished();
    }, 3300); // Fully hide after fade out animation (800ms)

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinished]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-700 ease-out',
        isFadingOut ? 'opacity-0' : 'opacity-100'
      )}
    >
      <div
        className={cn(
          'transition-all duration-1000 ease-out',
          isMounted ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        )}
      >
        <Lottie animationData={splashAnimation} className="w-64 h-64" loop={false} />
      </div>
      <div
        className={cn(
          'text-center transition-all duration-1000 ease-out mt-4',
           isMounted ? 'opacity-100' : 'opacity-0'
        )}
      >
        <p className="text-lg font-headline text-foreground">Linea</p>
        <p className="text-sm text-muted-foreground">built by Simplinovus</p>
      </div>
    </div>
  );
}
