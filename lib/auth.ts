import { supabase } from './supabaseClient';

/**
 * Meldet den Benutzer per E-Mail & Passwort an
 */
export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw error;
  const user = data.user;
  if (!user) throw new Error("Kein Benutzer gefunden");

  // Rolle anhand der E-Mail-Domain ableiten
  let role = 'Gast';
  if (email.endsWith('@student.de')) role = 'Student';
  else if (email.endsWith('@dozent.de')) role = 'Dozent';
  else if (email.endsWith('@mensa.de')) role = 'Koch';

  // Rolle setzen, wenn noch nicht vorhanden
  await insertRoleIfNotExists(user.id, role);

  return data;
};

/**
 * Meldet den Benutzer ab
 */
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Registriert einen neuen Benutzer
 */
export async function register(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) throw error;
  if (!data.user) throw new Error('Benutzer wurde nicht erstellt.');

  // Benutzer muss E-Mail bestätigen – kein automatischer Login
  return data.user;
}

/**
 * Setzt die Rolle des Benutzers, falls noch nicht gesetzt
 */
export const insertRoleIfNotExists = async (user_id: string, role: string) => {
  const { data: existingRoles, error: fetchError } = await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", user_id)
    .maybeSingle();

  if (fetchError) {
    console.error("❌ Fehler beim Abrufen von user_roles:", fetchError);
    throw fetchError;
  }

  if (!existingRoles) {
    const { error: insertError } = await supabase
      .from("user_roles")
      .insert({ user_id, role });

    if (insertError) {
      console.error("❌ Fehler beim Einfügen in user_roles:", insertError);
      throw insertError;
    }

    console.log("✅ Rolle wurde gesetzt:", role);
  } else {
    console.log("ℹ️ Rolle existiert bereits:", existingRoles.role);
  }
};

/**
 * Gibt die Rolle des Benutzers zurück
 */
export const getUserRole = async (user_id: string): Promise<string> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user_id)
    .single();

  if (error) {
    console.error('❌ Fehler beim Abrufen der Rolle:', error);
    throw error;
  }

  return data?.role ?? 'Gast';
};
