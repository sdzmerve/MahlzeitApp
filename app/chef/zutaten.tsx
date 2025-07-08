import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'expo-router';
import { sharedStyles as styles } from '@/styles/sharedStyles';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';

export default function ZutatenScreen() {
  const router = useRouter();

  const [zutaten, setZutaten] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [zutatName, setZutatName] = useState('');
  const [selectedZutat, setSelectedZutat] = useState<any | null>(null);

  useEffect(() => {
    fetchZutaten();
  }, []);

  const fetchZutaten = async () => {
    const { data } = await supabase.from('Zutaten').select('*');
    if (data) setZutaten(data);
  };

  const resetForm = () => {
    setZutatName('');
    setSelectedZutat(null);
  };

  const handleSpeichern = async () => {
    if (!zutatName.trim()) {
      Alert.alert('Fehler', 'Name darf nicht leer sein.');
      return;
    }

    if (selectedZutat) {
      // Bearbeiten
      const { error } = await supabase
        .from('Zutaten')
        .update({ Zutat_name: zutatName })
        .eq('Zutat_id', selectedZutat.Zutat_id);

      if (error) Alert.alert('Fehler beim Aktualisieren');
      else {
        Alert.alert('Zutat aktualisiert!');
        resetForm();
        fetchZutaten();
      }
    } else {
      // Neu
      const { error } = await supabase.from('Zutaten').insert({ Zutat_name: zutatName });
      if (error) Alert.alert('Fehler beim Speichern');
      else {
        Alert.alert('Zutat hinzugefügt!');
        resetForm();
        fetchZutaten();
      }
    }
  };

  const handleBearbeiten = (z: any) => {
    setSelectedZutat(z);
    setZutatName(z.Zutat_name);
  };

  const handleLöschen = async (id: number) => {
    Alert.alert('Löschen?', 'Zutat wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('Zutaten').delete().eq('Zutat_id', id);
          if (!error) fetchZutaten();
        },
      },
    ]);
  };

  const gefiltert = zutaten.filter((z) =>
    z.Zutat_name.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 🧭 Navbar */}
      <View style={[styles.navBar, { justifyContent: 'space-between', alignItems: 'center', gap: 20 }]}>
        <TouchableOpacity onPress={() => router.replace('/chef')} style={{ flex: 1 }}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('/home')} style={{ flex: 1, alignItems: 'center' }}>
          <Image source={require('@/assets/icon.png')} style={styles.logo} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
      </View>

      <Text style={styles.menuTitle}>
        {selectedZutat ? '✏️ Zutat bearbeiten' : '➕ Neue Zutat'}
      </Text>

      <View style={[styles.menuCard, { marginTop: 20 }]}>
        <TextInput
          placeholder="Zutat"
          value={zutatName}
          onChangeText={setZutatName}
          style={styles.input}
        />

        <TouchableOpacity
          onPress={handleSpeichern}
          style={[styles.menuCard, { backgroundColor: colors.primary, marginTop: 10 }]}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
            {selectedZutat ? 'Speichern' : 'Anlegen'}
          </Text>
        </TouchableOpacity>

        {selectedZutat && (
          <TouchableOpacity onPress={resetForm} style={{ marginTop: 10 }}>
            <Text style={{ textAlign: 'center', color: colors.primary }}>Abbrechen</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.menuTitle, { marginTop: 30 }]}>🧂 Zutatenliste</Text>

      <TextInput
        placeholder="Suchen..."
        value={search}
        onChangeText={setSearch}
        style={[styles.input, { marginTop: 10 }]}
      />

      {gefiltert.map((z) => (
        <View key={z.Zutat_id} style={[styles.menuCard, { marginBottom: 8 }]}>
          <Text>{z.Zutat_name}</Text>
          <View style={{ flexDirection: 'row', marginTop: 8, gap: 12 }}>
            <TouchableOpacity onPress={() => handleBearbeiten(z)}>
              <Text style={{ color: colors.primary }}>Bearbeiten</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleLöschen(z.Zutat_id)}>
              <Text style={{ color: 'red' }}>Löschen</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
