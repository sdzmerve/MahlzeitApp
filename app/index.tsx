// app/index.tsx
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { auth } from '../firebaseConfig';

export default function HomeScreen() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) setUserEmail(user.email);
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text>👤 Eingeloggt als: {userEmail || 'Unbekannt'}</Text>
    </View>
  );
}
