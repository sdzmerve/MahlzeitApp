import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA6LYSdBiQvZbwyVwb4vEEvqB1PgZNqSB8",
  authDomain: "mahlzeitapp-5604a.firebaseapp.com",
  projectId: "mahlzeitapp-5604a",
  storageBucket: "mahlzeitapp-5604a.firebasestorage.app",
  messagingSenderId: "193732551455",
  appId: "1:193732551455:web:523aecbb7ddf691768462a",
  measurementId: "G-ZPS5Q3KJQW"
};

const app = initializeApp(firebaseConfig);

// Expo benötigt KEIN getReactNativePersistence
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
