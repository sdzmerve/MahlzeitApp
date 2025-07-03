import { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { supabase } from '@/lib/supabaseClient'; 

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "myapp://reset-password", // ggf. anpassen
    });

    setLoading(false);

    if (error) {
      Alert.alert("Fehler", error.message);
    } else {
      Alert.alert(
        "E-Mail gesendet",
        "Überprüfe dein Postfach für den Link zum Zurücksetzen deines Passworts."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Passwort vergessen</Text>
      <TextInput
        style={styles.input}
        placeholder="E-Mail-Adresse"
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
      />
      <Button title={loading ? "Sende..." : "Passwort zurücksetzen"} onPress={handleResetPassword} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: "center", padding: 20,
  },
  title: {
    fontSize: 24, fontWeight: "bold", marginBottom: 20,
  },
  input: {
    height: 50, borderColor: "#ccc", borderWidth: 1, marginBottom: 20, paddingHorizontal: 10,
  },
});
