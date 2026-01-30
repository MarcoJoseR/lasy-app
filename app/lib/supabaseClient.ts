// app/lib/supabaseClient.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON!;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_ANON in env");
}

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON);
