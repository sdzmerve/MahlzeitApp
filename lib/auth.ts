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

export const register = async (email: string, password: string, role: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  const user = data.user;

  // Rollenspeicherung z. B. in separater users-Tabelle
  if (user) {
    await supabase
      .from('users')
      .insert({ id: user.id, email, role });
  }
};



