import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFirebaseConfig, isFirebaseConfigured } from '@/lib/firebaseConfig';

let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

if (isFirebaseConfigured()) {
  app = initializeApp(getFirebaseConfig());
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };
