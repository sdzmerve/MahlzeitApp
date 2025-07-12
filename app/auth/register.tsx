import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { colors } from '@/styles/colors';
import { register } from '@/lib/auth';
import { router } from 'expo-router';

const MIN_PASSWORD_LENGTH = 8;

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [loading, setLoading] = useState(false);

  // Rolle anhand E-Mail-Adresse bestimmen
  const determineRoleFromEmail = (email: string): string => {
    const lower = email.toLowerCase();
    if (lower.endsWith('@student.dhbw-mannheim.de')) return 'student';
    if (lower.endsWith('@dhbw-mannheim.de')) return 'dozent';
    if (lower.endsWith('@mensa.de')) return 'chef';
    return 'gast';
  };

  // Simple E-Mail-Validierung
  const isValidEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.toLowerCase());
  };

  // Registrierung mit Validierung
  const handleRegister = async () => {
    if (!email || !password || !passwordRepeat) {
      Alert.alert('Fehler', 'Bitte fülle alle Felder aus.');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Fehler', 'Bitte gib eine gültige E-Mail-Adresse ein.');
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      Alert.alert('Fehler', `Das Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.`);
      return;
    }

    if (password !== passwordRepeat) {
      Alert.alert('Fehler', 'Die Passwörter stimmen nicht überein.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      Alert.alert('Erfolg', 'Bitte bestätige deine E-Mail.');
      router.replace('/auth'); // Zurück zur Login-Seite
    } catch (error: any) {
      Alert.alert('Registrierung fehlgeschlagen', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Image source={require('@/assets/icon.png')} style={styles.logo} />
        <Text style={styles.title}>Registrieren</Text>

        <Input
          placeholder="E-Mail"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Input
          placeholder="Passwort"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Input
          placeholder="Passwort wiederholen"
          secureTextEntry
          value={passwordRepeat}
          onChangeText={setPasswordRepeat}
        />

        <Button title="Registrieren" onPress={handleRegister} loading={loading} />

        <TouchableOpacity onPress={() => router.push('/auth')}>
          <Text style={styles.link}>Bereits registriert? Zum Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    color: colors.text,
  },
  link: {
    color: colors.primary,
    marginTop: 12,
    textAlign: 'center',
  },
});
