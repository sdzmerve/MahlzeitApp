// lib/firebaseService.js
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

export async function fetchData() {
  const querySnapshot = await getDocs(collection(db, 'deineSammlung'));
  const data = [];
  querySnapshot.forEach((doc) => {
    data.push({ id: doc.id, ...doc.data() });
  });
  return data;
}