'use client';
import { initializeFirebase } from '@/firebase';
import { FirebaseProvider } from './provider';

// It is critical that this component is used in a Client Component.
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const { firebaseApp, firestore, auth } = initializeFirebase();
  return (
    <FirebaseProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
      {children}
    </FirebaseProvider>
  );
}
