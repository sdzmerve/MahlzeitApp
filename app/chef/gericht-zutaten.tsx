import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'expo-router';
import { sharedStyles as styles } from '@/styles/sharedStyles';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';

export default function GerichtZutatenScreen() {
  const router = useRouter();

  const [gerichte, setGerichte] = useState<any[]>([]);
  const [zutaten, setZutaten] = useState<any[]>([]);
  const [selectedGerichtId, setSelectedGerichtId] = useState<number | null>(null);
  const [zutatenZuweisung, setZutatenZuweisung] = useState<{ id: number; menge: string; einheit: string }[]>([]);
  const [zuweisungen, setZuweisungen] = useState<any[]>([]);

  // Daten laden beim Start
  useEffect(() => {
    fetchData();
  }, []);

  // Zutatenzuweisungen laden, wenn Gericht ausgewählt wurde
  useEffect(() => {
    if (selectedGerichtId) fetchZugewieseneZutaten(selectedGerichtId);
  }, [selectedGerichtId]);

  const fetchData = async () => {
    const g = await supabase.from('Gericht').select('Gericht_id, Gericht_Name');
    const z = await supabase.from('Zutaten').select('Zutat_id, Zutat_name');

    if (g.data) setGerichte(g.data);
    if (z.data) setZutaten(z.data);
  };

  const fetchZugewieseneZutaten = async (gerichtId: number) => {
    const { data } = await supabase
      .from('GerichtZutaten')
      .select('*, Zutaten (Zutat_name)')
      .eq('Gericht_id', gerichtId);
    if (data) setZuweisungen(data);
  };

  const toggleZutat = (id: number) => {
    setZutatenZuweisung((prev) =>
      prev.some((z) => z.id === id)
        ? prev.filter((z) => z.id !== id)
        : [...prev, { id, menge: '', einheit: '' }]
    );
  };

  // Neue Zutaten-Zuweisungen speichern
  const handleZuweisung = async () => {
    if (!selectedGerichtId || zutatenZuweisung.length === 0) {
      Alert.alert('Fehler', 'Bitte Gericht und mindestens eine Zutat wählen.');
      return;
    }

    const payload = zutatenZuweisung.map((z) => ({
      Gericht_id: selectedGerichtId,
      Zutaten_id: z.id,
      Menge: parseFloat(z.menge),
      Einheit: z.einheit,
    }));

    const invalid = payload.some((p) => isNaN(p.Menge) || !p.Einheit.trim());
    if (invalid) {
      Alert.alert('Fehler', 'Alle Mengen und Einheiten müssen gültig sein.');
      return;
    }

    const { error } = await supabase.from('GerichtZutaten').insert(payload);
    if (error) {
      Alert.alert('Fehler', 'Zuweisung fehlgeschlagen.');
    } else {
      Alert.alert('Erfolg', 'Zutaten erfolgreich zugewiesen.');
      setZutatenZuweisung([]);
      fetchZugewieseneZutaten(selectedGerichtId);
    }
  };

  // Einzelne Zutat-Zuweisung löschen
  const handleLöschen = async (zutatenId: number) => {
    if (!selectedGerichtId) return;

    const { error } = await supabase
      .from('GerichtZutaten')
      .delete()
      .eq('Gericht_id', selectedGerichtId)
      .eq('Zutaten_id', zutatenId);

    if (!error) fetchZugewieseneZutaten(selectedGerichtId);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 48,
          paddingHorizontal: 20,
          paddingBottom: 50,
          backgroundColor: colors.background,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Navigation */}
        <View style={[styles.navBar, { justifyContent: 'space-between', alignItems: 'center', gap: 20 }]}>
          <TouchableOpacity onPress={() => router.replace('/chef')} style={{ flex: 1 }}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/home')} style={{ flex: 1, alignItems: 'center' }}>
            <Image source={require('@/assets/icon.png')} style={styles.logo} />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
        </View>

        <Text style={styles.menuTitle}>🥣 Zutaten zu Gericht zuweisen</Text>

        {/* Gericht-Auswahl & Zutat-Zuweisung */}
        <View style={[styles.menuCard, { marginTop: 20 }]}>
          <Text style={{ fontWeight: '600', marginBottom: 6 }}>Gericht wählen:</Text>
          <Picker
            selectedValue={selectedGerichtId}
            onValueChange={(value) => setSelectedGerichtId(value)}
          >
            <Picker.Item label="Bitte wählen..." value={null} />
            {gerichte.map((g) => (
              <Picker.Item key={g.Gericht_id} label={g.Gericht_Name} value={g.Gericht_id} />
            ))}
          </Picker>

          <Text style={{ fontWeight: '600', marginTop: 12 }}>Zutaten wählen und Details angeben:</Text>

          {zutaten.map((z) => {
            const selected = zutatenZuweisung.find((entry) => entry.id === z.Zutat_id);
            return (
              <View key={z.Zutat_id} style={{ marginBottom: 12 }}>
                <TouchableOpacity
                  onPress={() => toggleZutat(z.Zutat_id)}
                  style={{
                    padding: 8,
                    backgroundColor: selected ? colors.primary : '#eee',
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: selected ? 'white' : 'black' }}>{z.Zutat_name}</Text>
                </TouchableOpacity>

                {selected && (
                  <View style={{ marginTop: 6 }}>
                    <TextInput
                      placeholder="Menge (z. B. 200)"
                      keyboardType="numeric"
                      value={selected.menge}
                      onChangeText={(text) =>
                        setZutatenZuweisung((prev) =>
                          prev.map((entry) =>
                            entry.id === z.Zutat_id ? { ...entry, menge: text } : entry
                          )
                        )
                      }
                      style={styles.input}
                    />
                    <TextInput
                      placeholder="Einheit (z. B. g, ml)"
                      value={selected.einheit}
                      onChangeText={(text) =>
                        setZutatenZuweisung((prev) =>
                          prev.map((entry) =>
                            entry.id === z.Zutat_id ? { ...entry, einheit: text } : entry
                          )
                        )
                      }
                      style={styles.input}
                    />
                  </View>
                )}
              </View>
            );
          })}

          <TouchableOpacity
            onPress={handleZuweisung}
            style={[styles.button, { backgroundColor: colors.primary, marginTop: 10 }]}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Zuweisen</Text>
          </TouchableOpacity>
        </View>

        {/* Bereits zugewiesene Zutaten */}
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
    </KeyboardAvoidingView>
  );
}
