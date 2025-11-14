
'use client';
import { useMemo } from 'react';
import { initializeFirebase } from '@/firebase';
import { FirebaseProvider } from './provider';

// It is critical that this component is used in a Client Component.
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  // We use useMemo to ensure that Firebase is only initialized once per render.
  const { firebaseApp, firestore, auth } = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
      {children}
    </FirebaseProvider>
  );
}
