// lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';

// Diese Werte musst du in .env-Dateien definieren (siehe unten)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

