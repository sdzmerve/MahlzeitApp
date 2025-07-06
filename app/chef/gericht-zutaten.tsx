import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '@/lib/supabaseClient';
import { useUserRole } from '@/lib/useUserRole';
import { useRouter } from 'expo-router';
import { sharedStyles as styles } from '@/styles/sharedStyles';

export default function GerichtZutatenScreen() {
  const { role, loading } = useUserRole();
  const router = useRouter();

  const [gerichte, setGerichte] = useState<any[]>([]);
  const [zutaten, setZutaten] = useState<any[]>([]);

  const [selectedGericht, setSelectedGericht] = useState<number | null>(null);
  const [selectedZutat, setSelectedZutat] = useState<number | null>(null);
  const [menge, setMenge] = useState('');
  const [einheit, setEinheit] = useState('');

  const [zuweisungen, setZuweisungen] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedGericht) {
      fetchZugewieseneZutaten(selectedGericht);
    }
  }, [selectedGericht]);

  const fetchData = async () => {
    const g = await supabase.from('Gericht').select('Gericht_id, Gericht_Name');
    const z = await supabase.from('Zutaten').select('Zutat_id, Zutat_name');
    if (g.data) setGerichte(g.data);
    if (z.data) setZutaten(z.data);
  };

  const fetchZugewieseneZutaten = async (gerichtId: number) => {
    const { data, error } = await supabase
      .from('GerichtZutaten')
      .select(`
        Zutaten_id,
        Menge,
        Einheit,
        Zutaten (
          Zutat_name
        )
      `)
      .eq('Gericht_id', gerichtId);

    if (!error && data) {
      setZuweisungen(data);
    }
  };

  const handleZuweisung = async () => {
    if (!selectedGericht || !selectedZutat || !menge.trim() || !einheit.trim()) {
      Alert.alert('Fehler', 'Bitte alle Felder ausfüllen.');
      return;
    }

    const { error } = await supabase.from('GerichtZutaten').insert({
      Gericht_id: selectedGericht,
      Zutaten_id: selectedZutat,
      Menge: parseFloat(menge),
      Einheit: einheit,
    });

    if (error) {
      Alert.alert('Fehler', 'Zutat konnte nicht zugewiesen werden.');
      console.error(error);
    } else {
      Alert.alert('Erfolg', 'Zutat zugewiesen!');
      setMenge('');
      setEinheit('');
      fetchZugewieseneZutaten(selectedGericht);
    }
  };

  if (loading) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={{ fontSize: 22, marginBottom: 12 }}>Zutaten zu Gericht zuweisen</Text>

      <Text>Gericht wählen:</Text>
      <Picker
        selectedValue={selectedGericht}
        onValueChange={(value) => setSelectedGericht(value)}
      >
        <Picker.Item label="Bitte wählen..." value={null} />
        {gerichte.map((g) => (
          <Picker.Item key={g.Gericht_id} label={g.Gericht_Name} value={g.Gericht_id} />
        ))}
      </Picker>

      <Text>Zutat wählen:</Text>
      <Picker
        selectedValue={selectedZutat}
        onValueChange={(value) => setSelectedZutat(value)}
      >
        <Picker.Item label="Bitte wählen..." value={null} />
        {zutaten.map((z) => (
          <Picker.Item key={z.Zutat_id} label={z.Zutat_name} value={z.Zutat_id} />
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
        placeholder="Einheit (z. B. g, ml, Stück)"
        value={einheit}
        onChangeText={setEinheit}
        style={styles.input}
      />

      <Button title="Zutat zuweisen" onPress={handleZuweisung} />

      {zuweisungen.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>
            Zugewiesene Zutaten:
          </Text>
          {zuweisungen.map((z, i) => (
            <View
              key={i}
              style={{
                padding: 10,
                backgroundColor: '#f2f2f2',
                borderRadius: 6,
                marginBottom: 6,
              }}
            >
              <Text>{z.Zutaten?.Zutat_name}: {z.Menge} {z.Einheit}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
