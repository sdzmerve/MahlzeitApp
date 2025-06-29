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

export async function register(email: string, password: string, role: string) {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    console.error('Fehler beim SignUp:', signUpError);
    throw signUpError;
  }

  const user = signUpData?.user;
  if (!user) throw new Error('Benutzer konnte nicht erstellt werden.');

  const { error: insertError } = await supabase.from('User').insert({
    User_id: user.id,
    EMailAdresse: user.email,
    role: role,
    Hauptmensa: selectedMensa,
  });

  if (insertError) {
    console.error('Fehler beim Einfügen in users:', insertError);
    throw insertError;
  }

  return user;
}