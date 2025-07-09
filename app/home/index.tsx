import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView, Platform, } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';
import StarRatingInput from '@/components/StarRatingInput';
import { colors } from '@/styles/colors';
import { sharedStyles as styles } from '@/styles/sharedStyles';
import { getUserRole } from '@/lib/auth';

type Menu = {
  id: string;
  title: string;
  description: string;
  image?: string;
  average_rating: number;
  isVegan?: boolean;
  alreadyRated: boolean;
  price?: number;
};

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [mensen, setMensen] = useState<{ id: number; name: string }[]>([]);
  const [selectedMensa, setSelectedMensa] = useState<{ id: number; name: string } | null>(null);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string>('Gast');

  useEffect(() => {
    const getUserInfo = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const role = await getUserRole(user.id);
        setRole(role);
      }
    };
    getUserInfo();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/auth');
  };

  const handleLogoutPrompt = () => {
    Alert.alert(
      'Abmelden',
      'Möchtest du dich wirklich abmelden?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Ausloggen', style: 'destructive', onPress: handleLogout },
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    const fetchMensen = async () => {
      const { data } = await supabase.from('Mensa').select('Mensa_id, Mensa_name');
      if (data) {
        const formatted = data.map((m) => ({ id: m.Mensa_id, name: m.Mensa_name }));
        setMensen(formatted);
        if (formatted.length > 0) setSelectedMensa(formatted[0]);
      }
    };
    fetchMensen();
  }, []);

  useEffect(() => {
    const updateUserMensa = async () => {
      if (!selectedMensa || !userId) return;
      const { data: existingUser } = await supabase
        .from('"User"')
        .select('Hauptmensa')
        .eq('user_id', userId)
        .single();
      if (!existingUser?.Hauptmensa || existingUser.Hauptmensa !== selectedMensa.name) {
        await supabase.from('"User"').update({ Hauptmensa: selectedMensa.name }).eq('user_id', userId);
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

    const { data } = await supabase
      .from('TagesMenue')
      .select(`
        datum,
        menue:Menue (
          Menue_id,
          istVegan,
          Bild,
          Gericht ( Gericht_Name, Beschreibung ),
          MenueBewertung ( Rating, user_id )
        )
      `)
      .eq('datum', format(selectedDate, 'yyyy-MM-dd'))
      .eq('mensa_id', selectedMensa.id);

    const menusMapped = (data || []).map((entry: any) => {
      let price = 0;
      if (role === 'Student') price = 2.5;
      else if (role === 'Dozent') price = 3.8;
      else if (role === 'Gast') price = 5;

      const gericht = entry.menue?.Gericht;
      const ratings = Array.isArray(entry.menue?.MenueBewertung) ? entry.menue.MenueBewertung : [];
      const avg = ratings.length > 0 ? ratings.reduce((s: number, r: any) => s + r.Rating, 0) / ratings.length : 0;
      const alreadyRated = ratings.some((r: any) => r.user_id === userId);

      return {
        id: entry.menue?.Menue_id ?? entry.menue_id,
        title: gericht?.Gericht_Name ?? 'Unbekannt',
        description: gericht?.Beschreibung ?? '',
        image: entry.menue?.Bild,
        isVegan: entry.menue?.istVegan,
        average_rating: avg,
        alreadyRated,
        price,
      };
    });

    setMenus(menusMapped);
    setLoadingMenus(false);
  };

  useEffect(() => {
    fetchMenus();
  }, [selectedDate, selectedMensa, userId]);

  const onChangeDate = (_: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const submitRating = async (menuId: number, rating: number) => {
    if (!userId) {
      Alert.alert('Fehler', 'Du musst eingeloggt sein.');
      return;
    }
    const { data: existing } = await supabase
      .from('MenueBewertung')
      .select('*')
      .eq('user_id', userId)
      .eq('Menue_id', menuId);
    if (existing && existing.length > 0) {
      Alert.alert('Schon bewertet', 'Du hast dieses Menü bereits bewertet.');
      return;
    }

    await supabase.from('MenueBewertung').insert([
      {
        Menue_id: menuId,
        Rating: rating,
        user_id: userId,
        Kommentar: '',
      },
    ]);
    fetchMenus();
  };

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
    <View style={styles.container}>
      {/* Standort Auswahl */}
      {showLocationSelector && (
        <View style={styles.locationSelector}>
          <Text style={styles.locationTitle}>Standort auswählen</Text>
          {mensen.map((m) => (
            <TouchableOpacity
              key={m.id}
              onPress={() => {
                setSelectedMensa(m);
                setShowLocationSelector(false);
              }}
            >
              <Text style={styles.locationOption}>{m.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => setShowLocationSelector(false)}>
            <Text style={styles.locationCancel}>Abbrechen</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Header */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => setShowLocationSelector(true)}>
          <Ionicons name="location-outline" size={26} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedDate(new Date())}>
          <Image source={require('@/assets/icon.png')} style={styles.logo} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogoutPrompt}>
          <Ionicons name="log-out-outline" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {role === 'Koch' && (
        <TouchableOpacity
          style={[styles.button, { alignSelf: 'center', marginBottom: 10 }]}
          onPress={() => router.push('/chef')}
        >
          <Text style={styles.buttonText}>👨‍🍳 Zum Koch-Dashboard</Text>
        </TouchableOpacity>
      )}

      {/* Datumsauswahl */}
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateText}>{format(selectedDate, 'EEEE, dd.MM.yyyy')}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={selectedDate} mode="date" display="default" onChange={onChangeDate} />
      )}

      {loadingMenus ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={menus}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.menuList}
          renderItem={({ item }) => (
            <View style={styles.menuCard}>
              <Text style={styles.menuTitle}>
                {item.title} {item.isVegan ? '🌱' : ''}
              </Text>
              <Text style={styles.menuDescription}>{item.description}</Text>

              <View style={styles.ratingRow}>
                <Text style={{ fontWeight: 'bold', marginRight: 4 }}>Ø {item.average_rating.toFixed(1)}</Text>
                <StarRatingInput initialRating={item.average_rating} editable={false} />
              </View>

              {item.alreadyRated ? (
                <Text style={styles.ratedText}>Du hast bereits bewertet</Text>
              ) : (
                <View>
                  <Text style={styles.ratePrompt}>Jetzt bewerten:</Text>
                  <StarRatingInput onRate={(val) => submitRating(parseInt(item.id), val)} />
                </View>
              )}
              {role !== 'Koch' && (
                <View style={styles.priceBadge}>
                  <Text style={styles.priceText}>{item.price?.toFixed(2)} €</Text>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}
