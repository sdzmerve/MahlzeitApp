import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { sharedStyles as styles } from '@/styles/sharedStyles';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@/lib/supabaseClient';
import StarRating from '@/components/StarRating';
import { colors } from '@/styles/colors';


type Menu = {
  id: string;
  title: string;
  description: string;
  image?: string;
  average_rating: number;
  isVegan?: boolean;
};

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loadingMenus, setLoadingMenus] = useState(false);

  const [mensen, setMensen] = useState<{ id: number; name: string }[]>([]);
  const [selectedMensa, setSelectedMensa] = useState<string | null>(null);
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/auth');
  };

  // 📌 Mensen laden
  useEffect(() => {
    const fetchMensen = async () => {
      const { data, error } = await supabase
        .from('Mensa')
        .select('Mensa_id, Mensa_name');

      if (error) {
        console.error('Fehler beim Laden der Mensen:', error.message);
      } else {
        const formatted = data.map((m) => ({
          id: m.Mensa_id,
          name: m.Mensa_name,
        }));
        setMensen(formatted);
      }
    };

    fetchMensen();
  }, []);

  // 📌 Menüs laden (später kannst du hier nach `selectedMensa` filtern)
  useEffect(() => {
    const fetchMenus = async () => {
      setLoadingMenus(true);

      const { data, error } = await supabase
        .from('Menue')
        .select(`
          Menue_id,
          HatSalad,
          istVegan,
          Bild,
          Gericht (
            Gericht_Name,
            Beschreibung
          ),
          MenueBewertung (
            Rating
          )
        `);

      if (error) {
        console.error('Fehler beim Laden:', error.message);
        setMenus([]);
        setLoadingMenus(false);
        return;
      }

      const formatted = data.map((menu) => {
        const ratings = menu.MenueBewertung || [];
        const average =
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.Rating, 0) / ratings.length
            : 0;

        return {
          id: menu.Menue_id,
          title: menu.Gericht_id?.Gericht_Name ?? 'Unbekannt',
          description: menu.Gericht?.Beschreibung ?? '',
          image: menu.Bild,
          isVegan: menu.istVegan,
          average_rating: Math.round(average),
        };
      });

      setMenus(formatted);
      setLoadingMenus(false);
    };

    fetchMenus();
  }, []);

  const onChangeDate = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  return (
    <View style={styles.container}>
      {/* 📍 Standort-Auswahl Modal */}
      {showLocationSelector && (
        <View style={{
          position: 'absolute',
          top: 100,
          left: 20,
          right: 20,
          backgroundColor: '#fff',
          padding: 16,
          borderRadius: 12,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 10,
          zIndex: 1000,
        }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>Standort auswählen</Text>
          {mensen.map((m) => (
            <TouchableOpacity
              key={m.id}
              onPress={() => {
                setSelectedMensa(m.name);
                setShowLocationSelector(false);
              }}
              style={{ paddingVertical: 10, borderBottomColor: '#eee', borderBottomWidth: 1 }}
            >
              <Text>{m.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => setShowLocationSelector(false)} style={{ marginTop: 10 }}>
            <Text style={{ color: 'red', textAlign: 'right' }}>Abbrechen</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Navigationsleiste */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => setShowLocationSelector(true)}>
          <Text style={styles.location}>
            {selectedMensa ? `📍 ${selectedMensa}` : '📍 Mensa wählen'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/home')}>
          <Image source={require('@/assets/icon.png')} style={styles.logo} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/account')}>
          <Ionicons name="person-circle-outline" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Datumsauswahl */}
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateText}>
          {format(selectedDate, 'EEEE, dd.MM.yyyy')}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      {/* Menü-Liste oder Ladeanzeige */}
      {loadingMenus ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={menus}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.menuList}
          renderItem={({ item }) => (
            <View style={styles.menuCard}>
              <Text style={styles.menuTitle}>
                {item.title} {item.isVegan ? '🌱' : ''}
              </Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
              <StarRating rating={item.average_rating} />
            </View>
          )}
        />
      )}
    </View>
  );
}
