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
  alreadyRated: boolean;
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
  const [userId, setUserId] = useState<string | null>(null);

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
    const fetchUserSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const uid = session?.user?.id;
      if (!uid) return;

      setUserId(uid);

      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('user_id', uid)
        .single();

      if (!error && data?.role) {
        setUserRole(data.role);
      }
    };
    fetchUserSession();
  }, []);

  useEffect(() => {
    const updateUserMensa = async () => {
      if (!selectedMensa || !userId) return;

      const { data: existingUser } = await supabase
        .from('users')
        .select('Hauptmensa')
        .eq('user_id', userId)
        .single();

      if (!existingUser?.Hauptmensa || existingUser.Hauptmensa !== selectedMensa.name) {
        await supabase
          .from('users')
          .update({ Hauptmensa: selectedMensa.name })
          .eq('user_id', userId);
      }
    };
    updateUserMensa();
  }, [selectedMensa, userId]);

  const fetchMenus = async () => {
    setLoadingMenus(true);

    if (!selectedMensa || !userId) {
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
            Rating,
            user_id
          )
        )
      `)
      .eq('datum', format(selectedDate, 'yyyy-MM-dd'))
      .eq('mensa_id', selectedMensa.id);

    if (error || !data) {
      console.log('Menus error:', error);
      console.log('Menus response:', data);
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
      const alreadyRated = ratings.some((r: { user_id: string }) => r.user_id === userId);

      return {
        id: entry.menue?.Menue_id ?? entry.menue_id,
        title: gericht?.Gericht_Name ?? 'Unbekannt',
        description: gericht?.Beschreibung ?? '',
        image: entry.menue?.Bild,
        isVegan: entry.menue?.istVegan,
        average_rating: average,
        alreadyRated,
      };
    });

    setMenus(menusMapped);
    setLoadingMenus(false);
  };

  useEffect(() => {
    fetchMenus();
  }, [selectedDate, selectedMensa, userId]);

  const onChangeDate = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const submitRating = async (menuId: number, rating: number) => {
    if (!userId) {
      Alert.alert('Fehler', 'Du musst eingeloggt sein, um zu bewerten.');
      return;
    }

    console.log('Submitting rating for', menuId, 'by', userId);

    const { data: existing } = await supabase
      .from('MenueBewertung')
      .select('*')
      .eq('user_id', userId)
      .eq('Menue_id', menuId);

    if (existing && existing.length > 0) {
      Alert.alert('Schon bewertet', 'Du hast dieses Menü bereits bewertet.');
      return;
    }

    const { error } = await supabase.from('MenueBewertung').insert([
      {
        Menue_id: menuId,
        Rating: rating,
        user_id: userId,
        Kommentar: '',
      },
    ]);

    if (error) {
      console.log('Insert error:', error);
      Alert.alert('Fehler', 'Bewertung konnte nicht gespeichert werden.');
    } else {
      console.log('Insert success!');
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

              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 6 }}>
                <Text style={{ marginRight: 6 }}>Ø {item.average_rating.toFixed(1)} / 5</Text>
                <StarRatingInput initialRating={item.average_rating} editable={false} />
              </View>

              {item.alreadyRated ? (
                <Text style={{ fontStyle: 'italic', color: 'gray' }}>Du hast bereits bewertet</Text>
              ) : (
                <StarRatingInput
                  onRate={(selectedRating) => submitRating(parseInt(item.id), selectedRating)}
                />
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}
