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
import * as Location from 'expo-location';
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
  const [location, setLocation] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loadingMenus, setLoadingMenus] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/auth');
  };

  useEffect(() => {
  const fetchMenus = async () => {
    setLoadingMenus(true);

    const { data, error } = await supabase
      .from('Menü')
      .select(`
        Menü_id,
        HatSalad,
        istVegan,
        Bild,
        Gericht (
          Gericht_Name,
          Beschreibung
        ),
        MenüBewertung (
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
      const ratings = menu.MenüBewertung || [];
      const average =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.Rating, 0) / ratings.length
          : 0;

      return {
        id: menu.Menü_id,
        title: menu.Gericht?.Gericht_Name ?? 'Unbekannt',
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


  const handleLocationPress = async () => {
    try {
      setLoadingLocation(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocation('Keine Berechtigung');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(`📍 ${loc.coords.latitude.toFixed(2)}, ${loc.coords.longitude.toFixed(2)}`);
    } catch (err) {
      setLocation('Fehler beim Laden');
    } finally {
      setLoadingLocation(false);
    }
  };

  const onChangeDate = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  return (
    <View style={styles.container}>
      {/* Navigationsleiste */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={handleLocationPress}>
          <Text style={styles.location}>
            {loadingLocation ? 'Lade Standort...' : location || '📍 Standort wählen'}
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
}
