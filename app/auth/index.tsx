import { View, Text, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { colors } from '@/styles/colors';
import { login } from '@/lib/auth';
import { router } from 'expo-router';



export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/home'); // Weiterleitung nach Login
    } catch (error: any) {
      Alert.alert('Login fehlgeschlagen', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/icon.png')} style={styles.logo} />
      <Text style={styles.title}>Login</Text>

      <Input
        placeholder="E-Mail"
        keyboardType="email-address"
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

      <TouchableOpacity
        onPress={() => router.push('/auth/forgot-password')}
        style={{ marginTop: 12 }}
      >
        <Text style={{ color: '#007AFF', textAlign: 'center' }}>
          Passwort vergessen?
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center' },
  logo: { width: 100, height: 100, resizeMode: 'contain', alignSelf: 'center', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 32, color: colors.text },
  link: { color: colors.primary, marginTop: 12, textAlign: 'center' },
});
