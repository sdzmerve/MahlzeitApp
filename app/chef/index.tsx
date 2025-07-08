import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabaseClient';
import { sharedStyles as styles } from '@/styles/sharedStyles';
import { colors } from '@/styles/colors';

export default function KochDashboard() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      const { data: user } = await supabase.auth.getUser();
      const userId = user?.user?.id;
      if (!userId) return router.replace('/auth');

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error || !data || data.role !== 'Koch') {
        Alert.alert('Zugriff verweigert', 'Nur Köche dürfen diese Seite sehen.');
        return router.replace('/home');
      }

      setAllowed(true);
    };

    checkRole();
  }, []);

  if (!allowed) return null; 

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 🧭 Navbar */}
      <View style={[styles.navBar, { justifyContent: 'space-between', alignItems: 'center', gap: 20 }]}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => router.replace('/home')} style={{ flex: 1, alignItems: 'center' }}>
          <Image source={require('@/assets/icon.png')} style={styles.logo} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogoutPrompt} style={{ flex: 1, alignItems: 'flex-end' }}>
          <Ionicons name="person-circle-outline" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.menuTitle}>👨‍🍳 Koch-Dashboard</Text>

      <View style={{ gap: 12, marginTop: 24 }}>
        <TouchableOpacity
          onPress={() => router.push('/chef/gerichte')}
          style={[styles.menuCard, { backgroundColor: '#fef3ec' }]}
        >
          <Text style={styles.menuTitle}>🍲 Gerichte verwalten</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/chef/zutaten')}
          style={[styles.menuCard, { backgroundColor: '#ecfdf5' }]}
        >
          <Text style={styles.menuTitle}>🧂 Zutaten verwalten</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/chef/gericht-zutaten')}
          style={[styles.menuCard, { backgroundColor: '#eef2ff' }]}
        >
          <Text style={styles.menuTitle}>🥣 Gericht-Zutaten zuweisen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/chef/menue')}
          style={[styles.menuCard, { backgroundColor: '#fff7ed' }]}
        >
          <Text style={styles.menuTitle}>🍽 Menü erstellen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/chef/tagesmenue')}
          style={[styles.menuCard, { backgroundColor: '#fefce8' }]}
        >
          <Text style={styles.menuTitle}>📅 Tagesmenü erstellen</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
