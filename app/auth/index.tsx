import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { useState } from 'react';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { colors } from '@/styles/colors';
import { login, insertRoleIfNotExists } from '@/lib/auth';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabaseClient';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Rolle anhand der E-Mail-Domain bestimmen
  const determineRoleFromEmail = (email: string): string => {
    const lower = email.toLowerCase();
    if (lower.endsWith('@student.dhbw-mannheim.de')) return 'Student';
    if (lower.endsWith('@dhbw-mannheim.de')) return 'Dozent';
    if (lower.endsWith('@mensa.de')) return 'Koch';
    return 'Gast';
  };

  // Login-Handler mit Session-Abruf und Rollenzuweisung
  const handleLogin = async () => {
    setLoading(true);
    try {
      const loginData = await login(email, password);
      console.log('🔐 Login erfolgreich', loginData);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      if (sessionError || !userId) throw new Error('Fehler beim Abrufen der Benutzer-ID.');

      const role = determineRoleFromEmail(email);
      await insertRoleIfNotExists(userId, role);

      router.replace('/home'); // Weiterleitung nach erfolgreichem Login
    } catch (error: any) {
      console.error('❌ Login fehlgeschlagen:', error);
      Alert.alert('Login fehlgeschlagen', error.message || 'Unbekannter Fehler.');
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
        <Text style={styles.title}>Login</Text>

        <Input
          placeholder="E-Mail"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          placeholder="Passwort"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Button title="Login" onPress={handleLogin} loading={loading} />

        <TouchableOpacity onPress={() => router.push('/auth/register')}>
          <Text style={styles.link}>Noch keinen Account? Registrieren</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/forgot-password')} style={{ marginTop: 12 }}>
          <Text style={{ color: '#007AFF', textAlign: 'center' }}>
            Passwort vergessen?
          </Text>
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
