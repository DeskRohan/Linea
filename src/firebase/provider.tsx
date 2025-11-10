'use client';
import { type FirebaseApp } from 'firebase/app';
import { type Auth } from 'firebase/auth';
import { type Firestore } from 'firebase/firestore';
import { createContext, useContext } from 'react';

// It is critical that this component is used in a Client Component.

export type FirebaseContextValue = {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
};

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export const FirebaseProvider = ({
  children,
  firebaseApp,
  firestore,
  auth,
}: {
  children: React.ReactNode;
} & FirebaseContextValue) => {
  return (
    <FirebaseContext.Provider value={{ firebaseApp, firestore, auth }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useFirebaseApp = () => useFirebase().firebaseApp;
export const useFirestore = () => useFirebase().firestore;
export const useAuth = () => useFirebase().auth;
