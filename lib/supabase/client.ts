import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Win = {
  id: string;
  user_id?: string | null;
  text_raw: string;
  text_polished: string | null;
  polish_style: 'resume' | 'review' | 'linkedin' | null;
  tag: string | null;
  win_date: string;
  created_at: string;
};
