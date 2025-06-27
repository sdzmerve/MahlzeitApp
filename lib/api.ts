import { supabase } from './supabaseClient';

export const getDishes = async () => {
  const { data, error } = await supabase
    .from('Gerichte') // <-- Tabellenname ggf. anpassen
    .select('id, name'); // evtl. weitere Felder ergänzen

  if (error) {
    console.error('Fehler beim Laden der Gerichte:', error.message);
    return [];
  }

  return data;
};

export const addDish = async ({ name }: { name: string }) => {
  const { error } = await supabase
    .from('Gerichte') // <-- Tabellenname ggf. anpassen
    .insert([{ name }]);

  if (error) {
    console.error('Fehler beim Hinzufügen des Gerichts:', error.message);
  }
};

export const setWeeklyMenu = async (menu: Record<string, string>) => {
  const days = Object.keys(menu);

  // Beispiel: lösche alten Plan, ersetze durch neuen
  const { error: deleteError } = await supabase
    .from('Wochenmenue') // <-- Tabellenname ggf. anpassen
    .delete()
    .neq('tag', ''); // Alle löschen

  if (deleteError) {
    console.error('Fehler beim Zurücksetzen des Menüs:', deleteError.message);
    return;
  }

  const inserts = days.map((day) => ({
    tag: day,
    gericht: menu[day],
  }));

  const { error: insertError } = await supabase
    .from('Wochenmenue') // <-- Tabellenname ggf. anpassen
    .insert(inserts);

  if (insertError) {
    console.error('Fehler beim Speichern des Wochenmenüs:', insertError.message);
  }
};
