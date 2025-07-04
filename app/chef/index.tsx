import { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabaseClient';
import { getDishes, addDish, setWeeklyMenu } from '@/lib/api';
import { Session } from '@supabase/supabase-js';

export default function ChefPage() {
  const router = useRouter();
  const [dishName, setDishName] = useState('');
  const [dishes, setDishes] = useState<any[]>([]);
  const [weeklyMenu, setWeeklyMenuState] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // ✅ Rolle checken (neue Version mit getUser)
  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace('/auth');
        return;
      }

      // Optional zum Debuggen
      console.log('User ID:', user.id);

      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || data?.role !== 'chef') {
        console.warn('Keine Berechtigung:', error || data?.role);
        router.replace('/home');
      } else {
        setLoading(false);
      }
    };

    checkUserRole();
  }, []);

  useEffect(() => {
    if (!loading) loadDishes();
  }, [loading]);

  const loadDishes = async () => {
    const data = await getDishes();
    setDishes(data);
  };

  const handleAddDish = async () => {
    if (!dishName.trim()) return;
    await addDish({ name: dishName });
    setDishName('');
    loadDishes();
  };

  const handleSetMenu = async () => {
    await setWeeklyMenu(weeklyMenu);
    Alert.alert('Erfolg', 'Wochenmenü gespeichert');
  };

  if (loading) return <Text style={{ padding: 20 }}>🔐 Zugriffsprüfung...</Text>;

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>👨‍🍳 Kochbereich</Text>

      {/* Gericht hinzufügen */}
      <TextInput
        placeholder="Neues Gericht eingeben"
        value={dishName}
        onChangeText={setDishName}
        style={{
          borderColor: '#ccc',
          borderWidth: 1,
          padding: 8,
          marginBottom: 8,
          borderRadius: 6,
        }}
      />
      <Button title="Gericht hinzufügen" onPress={handleAddDish} />

      {/* Wochenplan */}
      <Text style={{ fontSize: 18, marginTop: 24, marginBottom: 8 }}>🗓️ Wochenplan erstellen</Text>

      {['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'].map((day) => (
        <View key={day} style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: 'bold' }}>{day}</Text>
          <ScrollView horizontal style={{ marginVertical: 4 }}>
            {dishes.map((dish) => (
              <View key={dish.id} style={{ marginRight: 8 }}>
                <Button
                  title={dish.name}
                  onPress={() =>
                    setWeeklyMenuState((prev) => ({ ...prev, [day]: dish.name }))
                  }
                />
              </View>
            ))}
          </ScrollView>
          <Text style={{ fontStyle: 'italic' }}>
            Ausgewählt: {weeklyMenu[day] || 'Kein Gericht'}
          </Text>
        </View>
      ))}

      <Button title="Wochenmenü speichern" onPress={handleSetMenu} />
    </ScrollView>
  );
}
