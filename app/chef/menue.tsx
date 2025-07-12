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
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'expo-router';
import { sharedStyles as styles } from '@/styles/sharedStyles';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';

export default function MenuErstellenScreen() {
  const router = useRouter();

  const [gerichte, setGerichte] = useState<any[]>([]);
  const [selectedGerichteIds, setSelectedGerichteIds] = useState<number[]>([]);
  const [isVegan, setIsVegan] = useState(false);
  const [hasSalat, setHasSalat] = useState(false);

  // Gerichte beim ersten Laden holen
  useEffect(() => {
    fetchGerichte();
  }, []);

  const fetchGerichte = async () => {
    const { data, error } = await supabase.from('Gericht').select('Gericht_id, Gericht_Name');
    if (data) setGerichte(data);
    else console.error('Fehler beim Laden der Gerichte', error);
  };

  const toggleGericht = (id: number) => {
    setSelectedGerichteIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  // Menü speichern
  const handleSaveMenu = async () => {
    if (selectedGerichteIds.length === 0) {
      Alert.alert('Fehler', 'Bitte mindestens ein Gericht auswählen.');
      return;
    }

    const payload = selectedGerichteIds.map((gerichtId) => ({
      Gericht_id: gerichtId,
      istVegan: isVegan,
      HatSalad: hasSalat,
    }));

    const { error } = await supabase.from('Menue').insert(payload);

    if (error) {
      console.error('Fehler beim Speichern', error);
      Alert.alert('Fehler beim Speichern');
    } else {
      Alert.alert('Erfolg', 'Menü gespeichert!');
      setSelectedGerichteIds([]);
      setIsVegan(false);
      setHasSalat(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 20, backgroundColor: colors.background }}
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

        <Text style={styles.menuTitle}>📅 Menü erstellen</Text>

        {/* Optionen: vegan / mit Salat */}
        <View style={[styles.menuCard, { marginTop: 20 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10, gap: 20 }}>
            <TouchableOpacity onPress={() => setIsVegan(!isVegan)}>
              <Text>{isVegan ? '✅ Vegan' : '⬜️ Vegan'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setHasSalat(!hasSalat)}>
              <Text>{hasSalat ? '✅ Salat' : '⬜️ Salat'}</Text>
            </TouchableOpacity>
          </View>

          {/* Gerichtauswahl */}
          <Text style={[styles.menuTitle, { marginTop: 20 }]}>🍽️ Gerichte wählen</Text>
          {gerichte.map((g) => (
            <TouchableOpacity
              key={g.Gericht_id}
              onPress={() => toggleGericht(g.Gericht_id)}
              style={{
                padding: 10,
                marginVertical: 6,
                backgroundColor: selectedGerichteIds.includes(g.Gericht_id) ? colors.primary : '#eee',
                borderRadius: 6,
              }}
            >
              <Text style={{ color: selectedGerichteIds.includes(g.Gericht_id) ? 'white' : 'black' }}>
                {g.Gericht_Name}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Speichern-Button */}
          <TouchableOpacity
            onPress={handleSaveMenu}
            style={[styles.button, { backgroundColor: colors.primary, marginTop: 20 }]}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Speichern</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
