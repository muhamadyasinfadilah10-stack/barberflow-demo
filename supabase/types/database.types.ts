// Placeholder. Untuk tipe lengkap jalankan:
// npx supabase gen types typescript --project-id <ID> > supabase/types/database.types.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
export type Database = Record<string, unknown>;
