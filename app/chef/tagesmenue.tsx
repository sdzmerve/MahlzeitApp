import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'expo-router';
import { sharedStyles as styles } from '@/styles/sharedStyles';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import { Picker } from '@react-native-picker/picker';
import { format } from 'date-fns';

export default function TagesmenueScreen() {
  const router = useRouter();

  const [menues, setMenues] = useState<any[]>([]);
  const [tagesmenues, setTagesmenues] = useState<any[]>([]);
  const [mensen, setMensen] = useState<any[]>([]);
  const [selectedMensaId, setSelectedMensaId] = useState<number | null>(null);  
  const [selectedMenu, setSelectedMenu] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTagesmenue, setSelectedTagesmenue] = useState<any | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMensen();
    fetchMenues();
    fetchTagesmenues();
  }, []);

  const fetchMenues = async () => {
    const { data } = await supabase
      .from('Menue')
      .select('*, Gericht(Gericht_Name)');
    if (data) setMenues(data);
  };

  const fetchTagesmenues = async () => {
    const { data } = await supabase
      .from('TagesMenue')
      .select('*, Menue(Menue_id, Gericht(Gericht_Name)), Mensa(Mensa_name)');
    if (data) setTagesmenues(data);
  };

  const fetchMensen = async () => {
    const { data, error } = await supabase.from('Mensa').select('*');
    if (data) setMensen(data);
    else console.error('Fehler beim Laden der Mensen', error);
  };

  const handleSpeichern = async () => {
    if (!selectedMenu || !selectedMensaId) {
      Alert.alert('Fehler', 'Bitte Menü und Mensa wählen.');
      return;
    }

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');

    if (selectedTagesmenue) {
      const { error } = await supabase
        .from('TagesMenue')
        .update({
          datum: formattedDate,
          Menue_id: selectedMenu.Menue_id,
        })
        .eq('Tagesmenue_id', selectedTagesmenue.Tagesmenue_id);

      if (error) Alert.alert('Fehler beim Aktualisieren');
      else {
        Alert.alert('Tagesmenü aktualisiert!');
        resetForm();
        fetchTagesmenues();
      }
    } else {
      const { error } = await supabase.from('TagesMenue').insert({
        datum: formattedDate,
        Menue_id: selectedMenu.Menue_id,
        Mensa_id: selectedMensaId,
      });

      if (error) Alert.alert('Fehler beim Speichern');
      else {
        Alert.alert('Tagesmenü erstellt!');
        resetForm();
        fetchTagesmenues();
      }
    }
  };

  const resetForm = () => {
    setSelectedMenu(null);
    setSelectedTagesmenue(null);
    setSelectedDate(new Date());
  };

  const handleBearbeiten = (entry: any) => {
    setSelectedDate(new Date(entry.datum));
    setSelectedMenu(menues.find((m) => m.Menue_id === entry.Menue_id));
    setSelectedTagesmenue(entry);
  };

  const handleLöschen = async (id: number) => {
    const { error } = await supabase.from('TagesMenue').delete().eq('Tagesmenue_id', id);
    if (!error) fetchTagesmenues();
  };

  const gefiltert = tagesmenues.filter((t) =>
    t.Menue?.Gericht?.Gericht_Name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: 48, paddingHorizontal: 20, paddingBottom: 50, backgroundColor: colors.background }}
        keyboardShouldPersistTaps="handled"
      >
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
        {selectedTagesmenue ? '✏️ Tagesmenü bearbeiten' : '➕ Tagesmenü erstellen'}
      </Text>

      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateText}>
          📅 {format(selectedDate, 'EEEE, dd.MM.yyyy')}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(_, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      <View style={[styles.menuCard, { marginTop: 20 }]}>
        <Text style={{ fontWeight: '600', marginBottom: 6 }}>Mensa wählen:</Text>
          <Picker
            selectedValue={selectedMensaId}
            onValueChange={(value) => setSelectedMensaId(value)}
          >
            <Picker.Item label="Bitte wählen..." value={null} />
            {mensen.map((m) => (
              <Picker.Item key={m.Mensa_id} label={m.Mensa_name} value={m.Mensa_id} />
            ))}
          </Picker>
          
        <Text style={{ fontWeight: '600', marginBottom: 6 }}>Menü wählen:</Text>
        <TextInput
          placeholder="🔍 Menü suchen..."
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />

        <ScrollView style={{ maxHeight: 200, marginBottom: 10 }}>
          {menues
            .filter((m) =>
              m.Gericht?.Gericht_Name?.toLowerCase().includes(search.toLowerCase())
            )
            .map((m) => (
              <TouchableOpacity
                key={m.Menue_id}
                onPress={() => setSelectedMenu(m)}
                style={{
                  padding: 10,
                  backgroundColor: selectedMenu?.Menue_id === m.Menue_id ? colors.primary : '#eee',
                  marginBottom: 6,
                  borderRadius: 6,
                }}
              >
                <Text
                  style={{
                    color: selectedMenu?.Menue_id === m.Menue_id ? 'white' : 'black',
                  }}
                >
                  {m.Gericht?.Gericht_Name}
                </Text>
              </TouchableOpacity>
            ))}
        </ScrollView>

        <TouchableOpacity
          onPress={handleSpeichern}
          style={[styles.button, { backgroundColor: colors.primary, marginTop: 10 }]}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
            {selectedTagesmenue ? 'Speichern' : 'Anlegen'}
          </Text>
        </TouchableOpacity>

        {selectedTagesmenue && (
          <TouchableOpacity onPress={resetForm} style={{ marginTop: 10 }}>
            <Text style={{ textAlign: 'center', color: colors.primary }}>Abbrechen</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.menuTitle, { marginTop: 30 }]}>📋 Alle Tagesmenüs</Text>

      <TextInput
        placeholder="Nach Gericht suchen..."
        value={search}
        onChangeText={setSearch}
        style={[styles.input, { marginTop: 10 }]}
      />

      {gefiltert.map((t) => (
        <View key={t.Tagesmenue_id} style={[styles.menuCard, { marginBottom: 8 }]}>
          <Text style={{ fontWeight: 'bold' }}>
            {format(new Date(t.datum), 'dd.MM.yyyy')} – {t.Menue?.Gericht?.Gericht_Name} ({t.Mensa?.Mensa_name})
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 8, gap: 12 }}>
            <TouchableOpacity onPress={() => handleBearbeiten(t)}>
              <Text style={{ color: colors.primary }}>Bearbeiten</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleLöschen(t.Tagesmenue_id)}>
              <Text style={{ color: 'red' }}>Löschen</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  </KeyboardAvoidingView>
  );
}
