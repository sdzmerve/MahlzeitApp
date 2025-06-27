import { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '../../lib/session'; // Beispiel: Auth-Hook
import { getDishes, addDish, setWeeklyMenu } from '../../lib/api'; // Backend-Funktionen

export default function ChefPage() {
  const { user, isLoading } = useSession();
  const router = useRouter();
  const [dishName, setDishName] = useState('');
  const [dishes, setDishes] = useState([]);
  const [weeklyMenu, setWeeklyMenuState] = useState({});

  useEffect(() => {
    if (!isLoading && user?.role !== 'chef') {
      router.replace('/home');
    }
  }, [user, isLoading]);

  useEffect(() => {
    loadDishes();
  }, []);

  const loadDishes = async () => {
    const data = await getDishes();
    setDishes(data);
  };

  const handleAddDish = async () => {
    await addDish({ name: dishName });
    setDishName('');
    loadDishes();
  };

  const handleSetMenu = async () => {
    await setWeeklyMenu(weeklyMenu);
    alert('Wochenmenü gespeichert');
  };

  if (isLoading) return <Text>Lade...</Text>;

  return (
    <ScrollView>
      <Text className="text-xl font-bold">👨‍🍳 Kochbereich</Text>

      {/* Gericht hinzufügen */}
      <TextInput
        placeholder="Neues Gericht"
        value={dishName}
        onChangeText={setDishName}
        className="border p-2 my-2"
      />
      <Button title="Gericht hinzufügen" onPress={handleAddDish} />

      {/* Wochenplan */}
      <Text className="mt-6 text-lg">🗓️ Wochenplan erstellen</Text>
      {['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'].map((day) => (
        <View key={day} className="my-2">
          <Text>{day}</Text>
          <ScrollView horizontal>
            {dishes.map((dish) => (
              <Button
                key={dish.id}
                title={dish.name}
                onPress={() =>
                  setWeeklyMenuState((prev) => ({ ...prev, [day]: dish.name }))
                }
              />
            ))}
          </ScrollView>
          <Text>Ausgewählt: {weeklyMenu[day]}</Text>
        </View>
      ))}
      <Button title="Wochenmenü speichern" onPress={handleSetMenu} />
    </ScrollView>
  );
}
