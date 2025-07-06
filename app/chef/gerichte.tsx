import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '@/lib/supabaseClient';
import { useUserRole } from '@/lib/useUserRole';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sharedStyles as styles } from '@/styles/sharedStyles';
import { colors } from '@/styles/colors';

export default function GerichteScreen() {
  const { role, loading } = useUserRole();
  const router = useRouter();

  const [gerichte, setGerichte] = useState<{ id: number; name: string; beschreibung: string }[]>([]);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGerichte();
  }, []);

  const fetchGerichte = async () => {
    const { data, error } = await supabase.from('Gericht').select('*');
    if (!error && data) {
      const mapped = data.map((g) => ({
        id: g.Gericht_id,
        name: g.Gericht_Name,
        beschreibung: g.Beschreibung,
      }));
      setGerichte(mapped);
    } else {
      console.error('Fehler beim Laden:', error);
    }
  };

  const handleAddGericht = async () => {
    if (!newName.trim()) {
      Alert.alert('Fehler', 'Der Name darf nicht leer sein.');
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from('Gericht').insert({
      Gericht_Name: newName,
      Beschreibung: newDescription,
    });

    if (error) {
      Alert.alert('Fehler', 'Gericht konnte nicht gespeichert werden.');
      console.error(error);
    } else {
      Alert.alert('Erfolg', 'Gericht hinzugefügt!');
      setNewName('');
      setNewDescription('');
      fetchGerichte();
    }

    setSubmitting(false);
  };

  if (loading) return null;

  return (
    <View style={styles.container}>
      {/* ✅ NAVBAR */}
      <View style={[styles.navBar, { justifyContent: 'space-between', alignItems: 'center', gap: 20 }]}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => router.replace('/home')} style={{ flex: 1, alignItems: 'center' }}>
          <Image source={require('@/assets/icon.png')} style={[styles.logo, { alignSelf: 'center' }]} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('/home')} style={{ flex: 1, alignItems: 'flex-end' }}>
          <Ionicons name="arrow-back-circle-outline" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ✅ Eingabeformular */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 22, marginBottom: 12 }}>Neues Gericht hinzufügen</Text>

        <TextInput
          placeholder="Name"
          value={newName}
          onChangeText={setNewName}
          style={styles.input}
        />
        <TextInput
          placeholder="Beschreibung"
          value={newDescription}
          onChangeText={setNewDescription}
          multiline
          numberOfLines={3}
          style={[styles.input, { height: 80 }]}
        />

        <Button
          title="Gericht speichern"
          onPress={handleAddGericht}
          disabled={submitting}
          color={colors.primary}
        />
      </View>

      {/* ✅ Liste */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Alle Gerichte:</Text>
        <FlatList
          data={gerichte}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={{
              padding: 12,
              borderWidth: 1,
              borderColor: '#eee',
              borderRadius: 8,
              marginBottom: 8,
              backgroundColor: '#fafafa',
            }}>
              <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
              <Text>{item.beschreibung}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}
