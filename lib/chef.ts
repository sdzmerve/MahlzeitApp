// lib/chef.ts
import { supabase } from './supabaseClient';

export async function addGericht(data: { name: string, zutaten: string[] }) {
  return await supabase.from('gerichte').insert([data]);
}

export async function fetchGerichte() {
  return await supabase.from('gerichte').select('*');
}
