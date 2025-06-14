import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Willkommen bei Mahlzeit! 🎉</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, textAlign: 'center', color: colors.text },
});
