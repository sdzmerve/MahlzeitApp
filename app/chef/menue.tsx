import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'expo-router';
import { sharedStyles as styles } from '@/styles/sharedStyles';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import { Picker } from '@react-native-picker/picker';

export default function MenueScreen() {
  const router = useRouter();

  const [gerichte, setGerichte] = useState<any[]>([]);
  const [menues, setMenues] = useState<any[]>([]);

  const [selectedGericht, setSelectedGericht] = useState<any | null>(null);
  const [isVegan, setIsVegan] = useState(false);
  const [bildUrl, setBildUrl] = useState('');
  const [search, setSearch] = useState('');
  const [selectedMenue, setSelectedMenue] = useState<any | null>(null);

  useEffect(() => {
    fetchGerichte();
    fetchMenues();
  }, []);

  const fetchGerichte = async () => {
    const { data } = await supabase.from('Gericht').select('*');
    if (data) setGerichte(data);
  };

  const fetchMenues = async () => {
    const { data } = await supabase
      .from('Menue')
      .select('*, Gericht(Gericht_Name)');
    if (data) setMenues(data);
  };

  const handleSpeichern = async () => {
    if (!selectedGericht) {
      Alert.alert('Fehler', 'Bitte ein Gericht wählen.');
      return;
    }

    if (selectedMenue) {
      const { error } = await supabase
        .from('Menue')
        .update({
          Gericht_id: selectedGericht.Gericht_id,
          istVegan: isVegan,
          Bild: bildUrl,
        })
        .eq('Menue_id', selectedMenue.Menue_id);

      if (error) Alert.alert('Fehler beim Aktualisieren');
      else {
        Alert.alert('Menü aktualisiert!');
        resetForm();
        fetchMenues();
      }
    } else {
      const { error } = await supabase.from('Menue').insert({
        Gericht_id: selectedGericht.Gericht_id,
        isVegan,
        Bild: bildUrl,
      });

      if (error) Alert.alert('Fehler beim Speichern');
      else {
        Alert.alert('Menü erstellt!');
        resetForm();
        fetchMenues();
      }
    }
  };

  const resetForm = () => {
    setSelectedGericht(null);
    setIsVegan(false);
    setBildUrl('');
    setSelectedMenue(null);
  };

  const handleBearbeiten = (menue: any) => {
    setSelectedMenue(menue);
    setSelectedGericht(gerichte.find((g) => g.Gericht_id === menue.Gericht_id));
    setIsVegan(menue.istVegan);
    setBildUrl(menue.Bild ?? '');
  };

  const handleLöschen = async (id: number) => {
    const { error } = await supabase.from('Menue').delete().eq('Menue_id', id);
    if (!error) fetchMenues();
  };

  const gefiltert = menues.filter((m) =>
    m.Gericht?.Gericht_Name?.toLowerCase().includes(search.toLowerCase())
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
        {selectedMenue ? '✏️ Menü bearbeiten' : '➕ Menü erstellen'}
      </Text>

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

        <TextInput
          placeholder="Bild-URL (optional)"
          value={bildUrl}
          onChangeText={setBildUrl}
          style={styles.input}
        />

        <TouchableOpacity
          onPress={() => setIsVegan(!isVegan)}
          style={[
            styles.menuCard,
            { backgroundColor: isVegan ? '#dcfce7' : '#fef2f2', marginTop: 10 },
          ]}
        >
          <Text style={{ textAlign: 'center', fontWeight: '600' }}>
            {isVegan ? '🌱 Vegan ✔️' : 'Nicht vegan'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSpeichern}
          style={[styles.menuCard, { backgroundColor: colors.primary, marginTop: 10 }]}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
            {selectedMenue ? 'Speichern' : 'Anlegen'}
          </Text>
        </TouchableOpacity>

        {selectedMenue && (
          <TouchableOpacity onPress={resetForm} style={{ marginTop: 10 }}>
            <Text style={{ textAlign: 'center', color: colors.primary }}>Abbrechen</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.menuTitle, { marginTop: 30 }]}>📋 Alle Menüs</Text>

      <TextInput
        placeholder="Nach Gericht suchen..."
        value={search}
        onChangeText={setSearch}
        style={[styles.input, { marginTop: 10 }]}
      />

      {gefiltert.map((m) => (
        <View key={m.Menue_id} style={[styles.menuCard, { marginBottom: 8 }]}>
          <Text style={{ fontWeight: 'bold' }}>{m.Gericht?.Gericht_Name} {m.istVegan ? '🌱' : ''}</Text>
          {m.Bild ? <Text style={{ fontSize: 12, color: '#666' }}>{m.Bild}</Text> : null}

          <View style={{ flexDirection: 'row', marginTop: 8, gap: 12 }}>
            <TouchableOpacity onPress={() => handleBearbeiten(m)}>
              <Text style={{ color: colors.primary }}>Bearbeiten</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleLöschen(m.Menue_id)}>
              <Text style={{ color: 'red' }}>Löschen</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
