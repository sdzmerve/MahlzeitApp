// app/index.tsx
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { fetchData, Item } from '../firebaseService';

export default function HomeScreen() {
    const [items, setItems] = useState<Item[]>([]);

    useEffect(() => {
        fetchData()
            .then(setItems)
            .catch((error) => console.error('Fehler beim Laden:', error));
    }, []);

    return (
        <View style={{ padding: 20 }}>
            {items.map((item) => (
                <Text key={item.id}>{JSON.stringify(item)}</Text>
            ))}
        </View>
    );
}