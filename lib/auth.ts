import { supabase } from './supabaseClient';

/**
 * Meldet einen Benutzer über E-Mail & Passwort an.
 * @param email Die Benutzer-E-Mail
 * @param password Das Passwort
 * @throws Fehler bei ungültigen Login-Daten
 */
export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Logout Funktion
 */
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};

/**
 * Registrierung eines Benutzers + Einfügen in User-Tabelle
 * @param email Die E-Mail-Adresse
 * @param password Das Passwort
 * @param role Die automatisch ermittelte Rolle
 */
export async function register(email: string, password: string, role: string) {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    console.error('Fehler beim SignUp:', signUpError);
    throw signUpError;
  }

  const user = signUpData.user;
  if (!user) {
    throw new Error('Benutzer wurde nicht erstellt.');
  }

  // Insert in eigene User-Tabelle
  const { error: insertError } = await supabase.from("User").insert({
    user_id: user.id,
    "E-Mail-Adresse": email,
    role: role,
  });

  if (insertError) {
    console.error('Fehler beim Einfügen in die User-Tabelle:', insertError);
    throw insertError;
  }

  return user;
}

