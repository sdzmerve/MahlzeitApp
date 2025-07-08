import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'expo-router';
import { sharedStyles as styles } from '@/styles/sharedStyles';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';

export default function GerichteScreen() {
  const router = useRouter();

  const [gerichte, setGerichte] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedGericht, setSelectedGericht] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [beschreibung, setBeschreibung] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchGerichte();
  }, []);

  const fetchGerichte = async () => {
    const { data, error } = await supabase.from('Gericht').select('*');
    if (!error && data) {
      console.log('Geladene Gerichte:', data);
      const mapped = data.map((g) => ({
        id: g.Gericht_id,
        name: g.Gericht_Name,
        beschreibung: g.Beschreibung,
      }));
      setGerichte(mapped);
    } else {
      console.error('Fehler beim Laden:', error);
    }
  };

  const handleSpeichern = async () => {
    if (!name.trim()) {
      Alert.alert('Fehler', 'Name darf nicht leer sein.');
      return;
    }

    setIsSubmitting(true);

    if (selectedGericht) {
      // Bearbeiten
      const { data, error } = await supabase
        .from('Gericht')
        .update({ Gericht_Name: name, Beschreibung: beschreibung })
        .eq('Gericht_id', selectedGericht.id);

      console.log('Update response:', data);
      if (error) {
        console.error('Fehler beim Aktualisieren:', error);
        Alert.alert('Fehler beim Aktualisieren');
      } else {
        Alert.alert('Aktualisiert', 'Gericht wurde gespeichert.');
        resetForm();
        fetchGerichte();
      }
    } else {
      // Neu anlegen
      const { data, error } = await supabase
        .from('Gericht')
        .insert({ Gericht_Name: name, Beschreibung: beschreibung });

      console.log('Insert response:', data);
      if (error) {
        console.error('Fehler beim Anlegen:', error);
        Alert.alert('Fehler beim Anlegen');
      } else {
        Alert.alert('Erstellt', 'Gericht wurde hinzugefügt.');
        resetForm();
        fetchGerichte();
      }
    }

    setIsSubmitting(false);
  };

  const handleBearbeiten = (gericht: any) => {
    setSelectedGericht(gericht);
    setName(gericht.name);
    setBeschreibung(gericht.beschreibung);
  };

  const handleLöschen = async (id: number) => {
    Alert.alert('Löschen?', 'Möchtest du dieses Gericht wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          const { data, error } = await supabase
            .from('Gericht')
            .delete()
            .eq('Gericht_id', id);

          console.log('Delete response:', data);
          if (error) {
            console.error('Fehler beim Löschen:', error);
            Alert.alert('Fehler beim Löschen');
          } else {
            Alert.alert('Gelöscht');
            fetchGerichte();
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setSelectedGericht(null);
    setName('');
    setBeschreibung('');
  };

  const gefilterteGerichte = gerichte.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 🧭 Navigation */}
      <View
        style={[
          styles.navBar,
          { justifyContent: 'space-between', alignItems: 'center', gap: 20 },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.replace('/chef')}
          style={{ flex: 1 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace('/home')}
          style={{ flex: 1, alignItems: 'center' }}
        >
          <Image
            source={require('@/assets/icon.png')}
            style={styles.logo}
          />
        </TouchableOpacity>

        <View style={{ flex: 1 }} />
      </View>

      <Text style={styles.menuTitle}>
        {selectedGericht ? '✏️ Gericht bearbeiten' : '➕ Neues Gericht'}
      </Text>

      <View style={[styles.menuCard, { marginTop: 20 }]}>
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Beschreibung"
          value={beschreibung}
          onChangeText={setBeschreibung}
          style={[styles.input, { height: 80 }]}
          multiline
        />

        <TouchableOpacity
          onPress={handleSpeichern}
          disabled={isSubmitting}
          style={[
            styles.button,
            { backgroundColor: colors.primary, marginTop: 10 },
          ]}
        >
          <Text
            style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}
          >
            {selectedGericht ? 'Änderungen speichern' : 'Gericht anlegen'}
          </Text>
        </TouchableOpacity>

        {selectedGericht && (
          <TouchableOpacity onPress={resetForm} style={{ marginTop: 10 }}>
            <Text style={{ textAlign: 'center', color: colors.primary }}>
              Abbrechen
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.menuTitle, { marginTop: 30 }]}>
        📋 Alle Gerichte
      </Text>

      <TextInput
        placeholder="Nach Namen suchen..."
        value={search}
        onChangeText={setSearch}
        style={[styles.input, { marginTop: 10 }]}
      />

      <View style={{ marginTop: 10 }}>
        {gefilterteGerichte.length === 0 ? (
          <Text style={{ fontStyle: 'italic', color: 'gray' }}>
            Keine Treffer
          </Text>
        ) : (
          gefilterteGerichte.map((gericht) => (
            <View
              key={gericht.id}
              style={[styles.menuCard, { marginBottom: 8 }]}
            >
              <Text style={{ fontWeight: 'bold' }}>{gericht.name}</Text>
              <Text>{gericht.beschreibung}</Text>

              <View style={{ flexDirection: 'row', marginTop: 8, gap: 12 }}>
                <TouchableOpacity onPress={() => handleBearbeiten(gericht)}>
                  <Text style={{ color: colors.primary }}>Bearbeiten</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleLöschen(gericht.id)}>
                  <Text style={{ color: 'red' }}>Löschen</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
