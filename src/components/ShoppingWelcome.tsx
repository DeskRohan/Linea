
'use client';

import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { cn } from '@/lib/utils';

export default function ShoppingWelcome({ onFinished }: { onFinished: () => void }) {
  const [animationData, setAnimationData] = useState(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    fetch('/animations/shop.json')
      .then((response) => response.json())
      .then((data) => {
        setAnimationData(data);
      })
      .catch((error) => console.error('Error loading shop animation:', error));
    
    const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
    }, 2500);

    const finishTimer = setTimeout(() => {
      onFinished();
    }, 3000);

    return () => {
        clearTimeout(fadeTimer);
        clearTimeout(finishTimer);
    }

  }, [onFinished]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-500 ease-out',
        isFadingOut ? 'opacity-0' : 'opacity-100'
      )}
    >
      <div className="w-full max-w-sm">
        {animationData && (
          <Lottie animationData={animationData} loop={false} />
        )}
      </div>
       <p className="mt-4 text-xl font-semibold text-foreground">
        Let the shopping begin!
      </p>
    </div>
  );
}
