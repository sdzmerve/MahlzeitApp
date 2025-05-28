import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export default function TestConnection() {
  useEffect(() => {
    getDocs(collection(db, 'Test'))
      .then((snap) => console.log('Verbindung funktioniert! Anzahl:', snap.size))
      .catch((err) => console.error('Fehler bei Verbindung:', err));
  }, []);

  return (
    <View>
      <Text>Firebase Test</Text>
    </View>
  );
}
