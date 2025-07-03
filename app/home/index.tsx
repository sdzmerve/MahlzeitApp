import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { sharedStyles as styles } from '@/styles/sharedStyles';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@/lib/supabaseClient';
import StarRatingInput from '@/components/StarRatingInput';
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
  const [selectedMensa, setSelectedMensa] = useState<{ id: number; name: string } | null>(null);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/auth');
  };

  const handleLogoutPrompt = () => {
    Alert.alert('Abmelden', 'Möchtest du dich wirklich abmelden?', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Ausloggen', style: 'destructive', onPress: handleLogout },
    ]);
  };

  useEffect(() => {
    const fetchMensen = async () => {
      const { data, error } = await supabase.from('Mensa').select('Mensa_id, Mensa_name');
      if (!error && data) {
        const formatted = data.map((m) => ({
          id: m.Mensa_id,
          name: m.Mensa_name,
        }));
        setMensen(formatted);
        if (formatted.length > 0) {
          setSelectedMensa(formatted[0]);
        }
      }
    };
    fetchMensen();
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const userId = session?.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('User_id', userId)
        .single();

      if (!error && data?.role) {
        setUserRole(data.role);
      }
    };
    fetchUserRole();
  }, []);

  useEffect(() => {
    const updateUserMensa = async () => {
      if (!selectedMensa) return;

      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const { data: existingUser } = await supabase
        .from('users')
        .select('Hauptmensa')
        .eq('User_id', userId)
        .single();

      if (!existingUser?.Hauptmensa || existingUser.Hauptmensa !== selectedMensa.name) {
        await supabase
          .from('users')
          .update({ Hauptmensa: selectedMensa.name })
          .eq('User_id', userId);
      }
    };
    updateUserMensa();
  }, [selectedMensa]);

  const fetchMenus = async () => {
    setLoadingMenus(true);

    if (!selectedMensa) {
      setMenus([]);
      setLoadingMenus(false);
      return;
    }

    const { data, error } = await supabase
      .from('TagesMenue')
      .select(`
        datum,
        menue:Menue (
          Menue_id,
          istVegan,
          Bild,
          Gericht (
            Gericht_Name,
            Beschreibung
          ),
          MenueBewertung (
            Rating
          )
        )
      `)
      .eq('datum', format(selectedDate, 'yyyy-MM-dd'))
      .eq('mensa_id', selectedMensa.id);

    if (error || !data) {
      setMenus([]);
      setLoadingMenus(false);
      return;
    }

    const menusMapped = data.map((entry: any) => {
      const gericht = entry.menue?.Gericht;
      const ratings = Array.isArray(entry.menue?.MenueBewertung) ? entry.menue.MenueBewertung : [];
      const average =
        ratings.length > 0
          ? ratings.reduce((sum: number, r: { Rating: number }) => sum + r.Rating, 0) / ratings.length
          : 0;

      return {
        id: entry.menue?.Menue_id ?? entry.menue_id,
        title: gericht?.Gericht_Name ?? 'Unbekannt',
        description: gericht?.Beschreibung ?? '',
        image: entry.menue?.Bild,
        isVegan: entry.menue?.istVegan,
        average_rating: Math.round(average),
      };
    });

    setMenus(menusMapped);
    setLoadingMenus(false);
  };

  useEffect(() => {
    fetchMenus();
  }, [selectedDate, selectedMensa]);

  const onChangeDate = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const submitRating = async (menuId: number, rating: number) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      Alert.alert('Fehler', 'Du musst eingeloggt sein, um zu bewerten.');
      return;
    }

    const { data: existing } = await supabase
      .from('MenueBewertung')
      .select('*')
      .eq('User_id', userId)
      .eq('Menue_id', menuId);

    if (existing && existing.length > 0) {
      Alert.alert('Schon bewertet', 'Du hast dieses Menü bereits bewertet.');
      return;
    }

    const { error } = await supabase.from('MenueBewertung').insert([
      {
        Menue_id: menuId,
        Rating: rating,
        User_id: userId,
        Kommentar: '',
      },
    ]);

    if (error) {
      Alert.alert('Fehler', 'Bewertung konnte nicht gespeichert werden.');
    } else {
      Alert.alert('Danke!', 'Deine Bewertung wurde gespeichert.');
      fetchMenus(); // Refresh
    }
  };

  return (
    <View style={styles.container}>
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
                setSelectedMensa(m);
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

      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => setShowLocationSelector(true)}>
          <Text style={styles.location}>
            {selectedMensa ? `📍 ${selectedMensa.name}` : '📍 Mensa wählen'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/home')}>
          <Image source={require('@/assets/icon.png')} style={styles.logo} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogoutPrompt}>
          <Ionicons name="person-circle-outline" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

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
              <StarRatingInput
                onRate={(selectedRating) => submitRating(parseInt(item.id), selectedRating)}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}
