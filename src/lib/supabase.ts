import { createClient } from '@supabase/supabase-js';

// The import.meta.env object exposes env variables configured in Vite (.env file)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

// Create and export the single Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
