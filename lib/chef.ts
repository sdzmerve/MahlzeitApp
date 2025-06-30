import { SupabaseClient } from '@supabase/supabase-js';

// Typen
type ZutatInput = {
  name: string;
  kcal: string;
  carbs: string;
  protein: string;
  fats: string;
  lmvid: string | null;
};

type GerichtZutat = {
  zutat_id: string;
  menge: string;
  einheit: string;
};

type GerichtInput = {
  name: string;
  beschreibung: string;
  zutaten: GerichtZutat[];
};

type MenuInput = {
  gericht_id: number;
  preis: number;
  bild: string;
  hatSalat: boolean;
  istVegan: boolean;
};

type MenuZuordnungInput = {
  menu_id: number;
  mensa_id: string;
  dates: string[]; // Format: YYYY-MM-DD
};

// Funktionen

export async function createZutat(
  supabase: SupabaseClient,
  { name, kcal, carbs, protein, fats, lmvid }: ZutatInput
) {
  const { data, error } = await supabase.from('Zutaten').insert([{
    Zutat_name: name,
    Zutat_kcal: kcal,
    Zutat_carbs: carbs,
    Zutat_protein: protein,
    Zutat_fats: fats,
    lmvid: lmvid
  }]);
  if (error) throw error;
  return data;
}

export async function createGericht(
  supabase: SupabaseClient,
  { name, beschreibung, zutaten }: GerichtInput
) {
  const { data: gericht, error } = await supabase
    .from('Gericht')
    .insert([{ Gericht_Name: name, Beschreibung: beschreibung }])
    .select()
    .single();

  if (error) throw error;
  const gericht_id = gericht.Gericht_id;

  const zutatenLinks = zutaten.map(z => ({
    Gericht_id: gericht_id,
    Zutaten_id: z.zutat_id,
    Menge: z.menge,
    Einheit: z.einheit
  }));

  const { error: linkError } = await supabase
    .from('GerichtZuZutaten')
    .insert(zutatenLinks);

  if (linkError) throw linkError;
  return gericht;
}

export async function createMenu(
  supabase: SupabaseClient,
  { gericht_id, preis, bild, hatSalat, istVegan }: MenuInput
) {
  const { data, error } = await supabase
    .from('Menue')
    .insert([{
      Gericht_id: gericht_id,
      preis,
      Bild: bild,
      HatSalad: hatSalat,
      istVegan: istVegan
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function assignMenuToDates(
  supabase: SupabaseClient,
  { menu_id, mensa_id, dates }: MenuZuordnungInput
) {
  const eintraege = dates.map(datum => ({
    datum,
    menu_id,
    mensa_id
  }));

  const { data, error } = await supabase
    .from('TagesMenue')
    .insert(eintraege);

  if (error) throw error;
  return data;
}
