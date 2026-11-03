import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://lrvxxgjcdsmjntauuqpj.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxydnh4Z2pjZHNtam50YXV1cXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3MDA1NzAsImV4cCI6MjEwOTI3NjU3MH0.-9D4gSFy3CdSPrZ15S9Y9U6P79B9NsLDLwSa3Umk_hk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
