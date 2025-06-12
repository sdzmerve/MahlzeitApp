import { supabase } from '../../lib/supabaseClient';
import { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Erfolgreich eingeloggt!');
    }
  };

  return (
    <View>
      <TextInput placeholder="E-Mail" onChangeText={setEmail} value={email} />
      <TextInput placeholder="Passwort" secureTextEntry onChangeText={setPassword} value={password} />
      <Button title="Login" onPress={handleLogin} />
      <Text>{message}</Text>
    </View>
  );
}
