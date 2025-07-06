import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, Switch, Alert } from 'react-native';
import { supabase } from '@/lib/supabaseClient';
import { useUserRole } from '@/lib/useUserRole';
import { useRouter } from 'expo-router';
import { sharedStyles as styles } from '@/styles/sharedStyles';
import { colors } from '@/styles/colors';

export default function MenueScreen() {
  const { role, loading } = useUserRole();
  const router = useRouter();

  const [gerichte, setGerichte] = useState<any[]>([]);
  const [gerichtId, setGerichtId] = useState<number | null>(null);
  const [preis, setPreis] = useState('');
  const [bildUrl, setBildUrl] = useState('');
  const [istVegan, setIstVegan] = useState(false);
  const [istHalSalad, setIstHalSalad] = useState(false);

  useEffect(() => {
    fetchGerichte();
  }, []);

  const fetchGerichte = async () => {
    const { data, error } = await supabase.from('Gericht').select('Gericht_id, Gericht_Name');
    if (!error && data) {
      setGerichte(data);
    }
  };

  const handleAddMenue = async () => {
    if (!gerichtId || !preis) {
      Alert.alert('Fehler', 'Bitte Gericht und Preis angeben.');
      return;
    }

    const { error } = await supabase.from('Menue').insert({
      Gericht_id: gerichtId,
      preis: parseFloat(preis),
      Bild: bildUrl,
      istVegan,
      HalSalad: istHalSalad,
    });

    if (error) {
      Alert.alert('Fehler', 'Menü konnte nicht gespeichert werden.');
      console.error(error);
    } else {
      Alert.alert('Erfolg', 'Menü hinzugefügt!');
      setPreis('');
      setBildUrl('');
      setIstVegan(false);
      setIstHalSalad(false);
    }
  };

  if (loading) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={{ fontSize: 22, marginBottom: 12 }}>Menü erstellen</Text>

      <Text>Gericht wählen:</Text>
      <View style={{ borderWidth: 1, borderRadius: 6, borderColor: '#ccc', marginBottom: 12 }}>
        {gerichte.map((g) => (
          <Text
            key={g.Gericht_id}
            onPress={() => setGerichtId(g.Gericht_id)}
            style={{
              padding: 10,
              backgroundColor: g.Gericht_id === gerichtId ? colors.primary : 'transparent',
              color: g.Gericht_id === gerichtId ? '#fff' : '#000',
            }}
          >
            {g.Gericht_Name}
          </Text>
        ))}
      </View>

      <TextInput
        placeholder="Preis (€)"
        value={preis}
        onChangeText={setPreis}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Bild-URL (optional)"
        value={bildUrl}
        onChangeText={setBildUrl}
        style={styles.input}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Switch value={istVegan} onValueChange={setIstVegan} />
        <Text style={{ marginLeft: 8 }}>Vegan</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Switch value={istHalSalad} onValueChange={setIstHalSalad} />
        <Text style={{ marginLeft: 8 }}>HalSalad</Text>
      </View>

      <Button title="Menü speichern" onPress={handleAddMenue} color={colors.primary} />
    </ScrollView>
  );
}
