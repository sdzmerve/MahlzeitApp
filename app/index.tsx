// app/index.tsx
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { fetchData, Item } from '../lib/firebaseService';

export default function HomeScreen() {
    const [items, setItems] = useState<Item[]>([]);

    useEffect(() => {
        fetchData()
            .then(setItems)
            .catch((error) => console.error('Fehler beim Laden:', error));
    }, []);

    return (
        <View style={{ padding: 20 }}>
            <Text>🚀 App läuft!</Text>
            {items.map((item: Item) => (
                <Text key={item.id}>{JSON.stringify(item)}</Text>
            ))}
        </View>
    );
}