import { Slot } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// Globaler Layout-Wrapper mit Safe-Area-Schutz
export default function Layout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Slot /> {/* Platzhalter für geroutete Screens */}
    </SafeAreaView>
  );
}
