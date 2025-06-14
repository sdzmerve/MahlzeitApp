import { View, Text, TextInput, Button, StyleSheet, Alert, Image } from 'react-native';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Login fehlgeschlagen', error.message);
    } else {
      const isStudent = email.endsWith('@student.dhbw-mannheim.de');
      const isDozent = email.endsWith('@dhbw-mannheim.de');
      const isGast = !isStudent && !isDozent;

      const userType = isStudent
        ? 'Student/in'
        : isDozent
        ? 'Dozent/in'
        : 'Gast';

      Alert.alert('Willkommen!', `Erfolgreich eingeloggt als ${userType}`);
        }
  };

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/icon.png')} style={styles.logo} />
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="E-Mail"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
      />

      <TextInput
        placeholder="Passwort"
        style={styles.input}
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <Button title={loading ? 'Einloggen...' : 'Login'} onPress={handleLogin} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  logo: { width: 100, height: 100, resizeMode: 'contain', alignSelf: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 16 },
});
