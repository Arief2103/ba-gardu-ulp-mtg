import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://zlwfwqiyvvdhfdloqbph.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsd2Z3cWl5dnZkaGZkbG9xYnBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyOTAwMDQsImV4cCI6MjA5NDg2NjAwNH0.0p-JdUp23_5v02Su2-zNZrlabyMwTo_ocgfMI-9GBKY";

// Pastikan konfigurasi lengkap telah diisi oleh pengguna
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let supabase: any = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error("Supabase initialization failed:", error);
  }
}

export { supabase };
