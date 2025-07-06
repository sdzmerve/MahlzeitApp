import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  ScrollView,
  Alert,
} from 'react-native';
import { supabase } from '@/lib/supabaseClient';
import { useUserRole } from '@/lib/useUserRole';
import { useRouter } from 'expo-router';
import { sharedStyles as styles } from '@/styles/sharedStyles';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function TagesmenueScreen() {
  const { role, loading } = useUserRole();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mensen, setMensen] = useState<any[]>([]);
  const [selectedMensa, setSelectedMensa] = useState<number | null>(null);
  const [menues, setMenues] = useState<any[]>([]);
  const [selectedMenue, setSelectedMenue] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchMensen();
    fetchMenues();
  }, []);

  const fetchMensen = async () => {
    const { data, error } = await supabase.from('Mensa').select('Mensa_id, Mensa_name');
    if (!error && data) setMensen(data);
  };

  const fetchMenues = async () => {
    const { data, error } = await supabase.from('Menue').select(`
      Menue_id,
      preis,
      Gericht (
        Gericht_Name
      )
    `);
    if (!error && data) setMenues(data);
  };

  const handleAddTagesmenue = async () => {
    if (!selectedMensa || !selectedMenue || !selectedDate) {
      Alert.alert('Fehler', 'Bitte alle Felder ausfüllen.');
      return;
    }

    const { error } = await supabase.from('TagesMenue').insert({
      mensa_id: selectedMensa,
      menue_id: selectedMenue,
      datum: selectedDate.toISOString().split('T')[0],
    });

    if (error) {
      Alert.alert('Fehler', 'Tagesmenü konnte nicht gespeichert werden.');
      console.error(error);
    } else {
      Alert.alert('Erfolg', 'Tagesmenü hinzugefügt!');
    }
  };

  if (loading) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={{ fontSize: 22, marginBottom: 12 }}>Tagesmenü erstellen</Text>

      <Text style={{ marginBottom: 8 }}>📅 Datum wählen:</Text>
      <Button title={selectedDate.toDateString()} onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      <Text style={{ marginTop: 20, marginBottom: 8 }}>🏫 Mensa wählen:</Text>
      {mensen.map((m) => (
        <Text
          key={m.Mensa_id}
          onPress={() => setSelectedMensa(m.Mensa_id)}
          style={{
            padding: 10,
            borderRadius: 6,
            backgroundColor: selectedMensa === m.Mensa_id ? '#d0e8ff' : '#f5f5f5',
            marginBottom: 6,
          }}
        >
          {m.Mensa_name}
        </Text>
      ))}

      <Text style={{ marginTop: 20, marginBottom: 8 }}>🍽️ Menü wählen:</Text>
      {menues.map((m) => (
        <Text
          key={m.Menue_id}
          onPress={() => setSelectedMenue(m.Menue_id)}
          style={{
            padding: 10,
            borderRadius: 6,
            backgroundColor: selectedMenue === m.Menue_id ? '#d0ffd6' : '#f5f5f5',
            marginBottom: 6,
          }}
        >
          {m.Gericht?.Gericht_Name ?? 'Unbekannt'} – {m.preis} €
        </Text>
      ))}

      <View style={{ marginTop: 20 }}>
        <Button title="Tagesmenü speichern" onPress={handleAddTagesmenue} />
      </View>
    </ScrollView>
  );
}
