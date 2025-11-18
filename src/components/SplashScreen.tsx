'use client';

import { useState, useEffect } from 'react';
import { LineaLogo } from '@/components/icons/linea-logo';
import { cn } from '@/lib/utils';

export default function SplashScreen({ onFinished }: { onFinished: () => void }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2000); // Start fading out after 2 seconds

    const finishTimer = setTimeout(() => {
      onFinished();
    }, 2800); // Fully hide after fade out animation (800ms)

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinished]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-700 ease-out',
        isFadingOut ? 'opacity-0' : 'opacity-100'
      )}
    >
      <div
        className={cn(
          'transition-all duration-1000 ease-out',
          isMounted ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        )}
      >
        <LineaLogo className="h-32 w-32" />
      </div>
    </div>
  );
}
