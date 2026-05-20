import { createClient } from "@supabase/supabase-js";

const metaEnv = (import.meta as any).env || {};

// Safe fallbacks to prevent compile/startup crashes when keys are empty
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const hasSupabaseKeys = () => {
  return (
    !!metaEnv.VITE_SUPABASE_URL &&
    !!metaEnv.VITE_SUPABASE_ANON_KEY &&
    metaEnv.VITE_SUPABASE_URL !== "https://placeholder-url.supabase.co"
  );
};
