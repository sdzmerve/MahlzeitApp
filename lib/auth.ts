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

  if (error) throw error;
  const user = data.user;
  if (!user) throw new Error("Kein Benutzer gefunden");

  // 🧠 Rolle bestimmen
  let role = 'Gast';
  if (email.endsWith('@student.de')) role = 'Student';
  else if (email.endsWith('@dozent.de')) role = 'Dozent';
  else if (email.endsWith('@mensa.de')) role = 'Koch';

  // 📥 Nur beim ersten Login in user_roles einfügen
  await insertRoleIfNotExists(user.id, role);

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
export async function register(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) throw error;
  if (!data.user) throw new Error('Benutzer wurde nicht erstellt.');

  // Wichtig: NICHT direkt einloggen und KEIN Insert!
  // Stattdessen nur sagen: bitte E-Mail bestätigen

  return data.user;
}

/**
 * Setzt Rolle, wenn nicht bereits vorhanden
 */
export const insertRoleIfNotExists = async (user_id: string, role: string) => {
  // Zuerst prüfen, ob Rolle bereits existiert
  const { data: existingRoles, error: fetchError } = await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", user_id)
    .maybeSingle();

  if (fetchError) {
    console.error("❌ Fehler beim Abrufen von user_roles:", fetchError);
    throw fetchError;
  }

  // Wenn keine Rolle vorhanden → einfügen
  if (!existingRoles) {
    const { error: insertError } = await supabase.from("user_roles").insert({
      user_id,
      role,
    });

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
 * Liest die Rolle eines Benutzers aus der Tabelle user_roles
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




