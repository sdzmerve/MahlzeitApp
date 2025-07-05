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

  // Warten auf gültige Session (nach Registrierung muss user evtl. E-Mail bestätigen)
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !sessionData.session?.user?.id) {
    throw new Error('Benutzer ist nicht authentifiziert. Bitte bestätige deine E-Mail und logge dich ein.');
  }

  const userId = sessionData.session.user.id;

  // Einfügen in die "User"-Tabelle
  const { error: insertError } = await supabase.from('User').insert({
    user_id: userId,
    'E-Mail-Adresse': email,
    Passwort: '', // leer, wird nicht in dieser Tabelle gespeichert
    role: role,
    Hauptmensa: null, // Optional: oder passende ID setzen
  });

  if (insertError) {
    console.error('Fehler beim Einfügen in User-Tabelle:', insertError);
    throw insertError;
  }

  return sessionData.session.user;
}
