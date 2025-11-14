
'use client';
import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { type FirestorePermissionError } from '@/firebase/errors';

/**
 * A client component that listens for Firestore permission errors and throws them
 * to be caught by the Next.js development error overlay. This provides a much
 * better debugging experience than just logging to the console.
 * In production, this component does nothing.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // In development, we want to throw the error to leverage the Next.js error overlay.
      if (process.env.NODE_ENV === 'development') {
        // We throw the error in a timeout to break out of the current React render cycle
        // and ensure it's caught by the global error handler.
        setTimeout(() => {
          throw error;
        }, 0);
      } else {
        // In production, you might want to log this to a service like Sentry.
        console.error('Firestore Permission Error:', error.message);
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null; // This component does not render anything.
}
