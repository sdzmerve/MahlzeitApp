// lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';

// 🔑 Supabase-Zugangsdaten aus Umgebungsvariablen
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// 🔌 Supabase-Client erstellen und exportieren
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
