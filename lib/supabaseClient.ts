import { createClient } from '@supabase/supabase-js'
import type { Database } from '../lib/database.types'

// Check if URL is valid before using it
const isValidUrl = (urlString: string): boolean => {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
}

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Log environment variables for debugging
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Key exists (not shown for security)' : 'Key missing');

// Check if environment variables are properly set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing or invalid. Check your .env.local file.');
}

// Create Supabase client
export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return isValidUrl(supabaseUrl || '') && supabaseAnonKey !== undefined && supabaseAnonKey !== '';
}
