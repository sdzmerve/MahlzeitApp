import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ChefPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Chef Dashboard</Text>
      <Button title="Gerichte verwalten" onPress={() => router.push('/chef/gerichte')} />
      <Button title="Zutaten verwalten" onPress={() => router.push('/chef/zutaten')} />
      <Button title="Tagesmenü erstellen" onPress={() => router.push('/chef/tagesmenue')} />
    </View>
  );
}
