import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://gdqsnkmhoyutyaynkyav.supabase.co';
const supabaseAnonKey = 'sb_publishable_YjpPvL5McrPk0Dvn4S2KLQ_SJsjkdgg';

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
