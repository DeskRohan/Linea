
import { type FirebaseApp, initializeApp, getApps, getApp } from 'firebase/app';
import { type Auth, getAuth } from 'firebase/auth';
import { type Firestore, getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

export * from './provider';
export * from './auth/use-user';


// This function ensures that we initialize Firebase only once.
function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

// It's singleton.
export const initializeFirebase = () => {
  const firebaseApp = getFirebaseApp();
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);
  
  return { firebaseApp, auth, firestore };
};
