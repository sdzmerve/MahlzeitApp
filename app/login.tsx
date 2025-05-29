import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { login } from '../lib/authService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login(email, password);
      Alert.alert('Erfolg', 'Login erfolgreich');
    } catch (error: any) {
      Alert.alert('Fehler', error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Email:</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />

      <Text>Passwort:</Text>
      <TextInput
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderBottomWidth: 1, marginBottom: 20 }}
      />

      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
