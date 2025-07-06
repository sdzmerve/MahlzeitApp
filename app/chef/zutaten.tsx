import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Button,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabaseClient';
import { useUserRole } from '@/lib/useUserRole';
import { sharedStyles as styles } from '@/styles/sharedStyles';
import { colors } from '@/styles/colors';

type Zutat = {
  id: number;
  name: string;
  kcal: number;
  carbs: number;
  protein: number;
  fats: number;
};

export default function ZutatenScreen() {
  const router = useRouter();
  const { role, loading } = useUserRole();

  const [zutaten, setZutaten] = useState<Zutat[]>([]);
  const [name, setName] = useState('');
  const [kcal, setKcal] = useState('');
  const [carbs, setCarbs] = useState('');
  const [protein, setProtein] = useState('');
  const [fats, setFats] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchZutaten();
  }, []);

  const fetchZutaten = async () => {
    const { data, error } = await supabase.from('Zutaten').select('*');
    if (!error && data) {
      const mapped = data.map((z) => ({
        id: z.Zutat_id,
        name: z.Zutat_name,
        kcal: z.Zutat_kcal,
        carbs: z.Zutat_carbs,
        protein: z.Zutat_protein,
        fats: z.Zutat_fats,
      }));
      setZutaten(mapped);
    }
  };

  const handleAddZutat = async () => {
    if (!name.trim()) {
      Alert.alert('Fehler', 'Name darf nicht leer sein.');
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from('Zutaten').insert({
      Zutat_name: name,
      Zutat_kcal: parseFloat(kcal) || 0,
      Zutat_carbs: parseFloat(carbs) || 0,
      Zutat_protein: parseFloat(protein) || 0,
      Zutat_fats: parseFloat(fats) || 0,
    });

    if (error) {
      Alert.alert('Fehler', 'Zutat konnte nicht gespeichert werden.');
      console.error(error);
    } else {
      Alert.alert('Erfolg', 'Zutat hinzugefügt!');
      setName('');
      setKcal('');
      setCarbs('');
      setProtein('');
      setFats('');
      fetchZutaten();
    }

    setSubmitting(false);
  };

  if (loading) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={{ fontSize: 22, marginBottom: 12 }}>Zutaten verwalten</Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="kcal"
        value={kcal}
        onChangeText={setKcal}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Kohlenhydrate (g)"
        value={carbs}
        onChangeText={setCarbs}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Protein (g)"
        value={protein}
        onChangeText={setProtein}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Fett (g)"
        value={fats}
        onChangeText={setFats}
        keyboardType="numeric"
        style={styles.input}
      />

      <Button
        title="Zutat hinzufügen"
        onPress={handleAddZutat}
        disabled={submitting}
        color={colors.primary}
      />

      <View style={{ marginTop: 24 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>
          Vorhandene Zutaten:
        </Text>
        <FlatList
          data={zutaten}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View
              style={{
                padding: 12,
                borderWidth: 1,
                borderColor: '#eee',
                borderRadius: 8,
                marginBottom: 8,
                backgroundColor: '#fafafa',
              }}
            >
              <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
              <Text>{item.kcal} kcal – C:{item.carbs}g / P:{item.protein}g / F:{item.fats}g</Text>
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
}
