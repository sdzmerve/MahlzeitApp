import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'expo-router';
import { sharedStyles as styles } from '@/styles/sharedStyles';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import { useUserRole } from '@/lib/useUserRole';

export default function GerichtZutatenScreen() {
  const { loading } = useUserRole();
  const router = useRouter();

  const [gerichte, setGerichte] = useState<any[]>([]);
  const [zutaten, setZutaten] = useState<any[]>([]);

  const [selectedGericht, setSelectedGericht] = useState<any | null>(null);
  const [selectedZutat, setSelectedZutat] = useState<any | null>(null);
  const [menge, setMenge] = useState('');
  const [einheit, setEinheit] = useState('');

  const [zuweisungen, setZuweisungen] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedGericht) {
      fetchZugewieseneZutaten(selectedGericht.Gericht_id);
    }
  }, [selectedGericht]);

  const fetchData = async () => {
    const g = await supabase.from('Gericht').select('Gericht_id, Gericht_Name');
    const z = await supabase.from('Zutaten').select('Zutat_id, Zutat_name');
    if (g.data) setGerichte(g.data);
    if (z.data) setZutaten(z.data);
  };

  const fetchZugewieseneZutaten = async (gerichtId: number) => {
    const { data } = await supabase
      .from('GerichtZutaten')
      .select(`*, Zutaten (Zutat_name)`)
      .eq('Gericht_id', gerichtId);

    if (data) setZuweisungen(data);
  };

  const handleZuweisung = async () => {
    if (!selectedGericht || !selectedZutat || !menge.trim() || !einheit.trim()) {
      Alert.alert('Fehler', 'Bitte alle Felder ausfüllen.');
      return;
    }

    const { error } = await supabase.from('GerichtZutaten').insert({
      Gericht_id: selectedGericht.Gericht_id,
      Zutaten_id: selectedZutat.Zutat_id,
      Menge: parseFloat(menge),
      Einheit: einheit,
    });

    if (error) {
      Alert.alert('Fehler', 'Zutat konnte nicht zugewiesen werden.');
    } else {
      Alert.alert('Erfolg', 'Zutat zugewiesen!');
      setMenge('');
      setEinheit('');
      fetchZugewieseneZutaten(selectedGericht.Gericht_id);
    }
  };

  const handleLöschen = async (zutatenId: number) => {
    if (!selectedGericht) return;

    const { error } = await supabase
      .from('GerichtZutaten')
      .delete()
      .eq('Gericht_id', selectedGericht.Gericht_id)
      .eq('Zutaten_id', zutatenId);

    if (!error) fetchZugewieseneZutaten(selectedGericht.Gericht_id);
  };

  if (loading) return null;

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

      <Text style={styles.menuTitle}>🥣 Zutat zu Gericht zuweisen</Text>

      <View style={[styles.menuCard, { marginTop: 20 }]}>
        <Text style={{ fontWeight: '600', marginBottom: 6 }}>Gericht wählen:</Text>
        <Picker
          selectedValue={selectedGericht}
          onValueChange={(value) => setSelectedGericht(value)}
        >
          <Picker.Item label="Bitte wählen..." value={null} />
          {gerichte.map((g) => (
            <Picker.Item key={g.Gericht_id} label={g.Gericht_Name} value={g} />
          ))}
        </Picker>

        <Text style={{ fontWeight: '600', marginTop: 12 }}>Zutat wählen:</Text>
        <Picker
          selectedValue={selectedZutat}
          onValueChange={(value) => setSelectedZutat(value)}
        >
          <Picker.Item label="Bitte wählen..." value={null} />
          {zutaten.map((z) => (
            <Picker.Item key={z.Zutat_id} label={z.Zutat_name} value={z} />
          ))}
        </Picker>

        <TextInput
          placeholder="Menge (z. B. 200)"
          value={menge}
          onChangeText={setMenge}
          keyboardType="numeric"
          style={styles.input}
        />

        <TextInput
          placeholder="Einheit (z. B. g, ml)"
          value={einheit}
          onChangeText={setEinheit}
          style={styles.input}
        />

        <TouchableOpacity
          onPress={handleZuweisung}
          style={[styles.menuCard, { backgroundColor: colors.primary, marginTop: 10 }]}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Zuweisen</Text>
        </TouchableOpacity>
      </View>

      {zuweisungen.length > 0 && (
        <View style={{ marginTop: 30 }}>
          <Text style={[styles.menuTitle, { marginBottom: 10 }]}>📋 Zugewiesene Zutaten</Text>

          {zuweisungen.map((z, i) => (
            <View key={i} style={[styles.menuCard, { marginBottom: 8 }]}>
              <Text>{z.Zutaten?.Zutat_name}: {z.Menge} {z.Einheit}</Text>

              <TouchableOpacity onPress={() => handleLöschen(z.Zutaten_id)} style={{ marginTop: 8 }}>
                <Text style={{ color: 'red' }}>Löschen</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
