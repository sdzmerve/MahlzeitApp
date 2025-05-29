// lib/firebaseService.js
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export async function fetchData(): Promise<Item[]>  {
  const querySnapshot = await getDocs(collection(db, 'deineSammlung'));
  const data: any[] = [];
  querySnapshot.forEach((doc) => {
    data.push({ id: doc.id, ...doc.data() });
  });
  return data;
}
export interface Item {
  id: string;
  [key: string]: any;
}
