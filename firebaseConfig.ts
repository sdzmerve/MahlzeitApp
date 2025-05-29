import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { app, auth, db };
