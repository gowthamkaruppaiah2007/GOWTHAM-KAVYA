import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://twzcrkjaooslnpyiuqew.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8atf3WAa2rgkODvVDtjokw_7KDGEQ_Q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export interface ChatMessage {
  id?: string;
  sender_id: string;
  sender_name: string;
  receiver_id: string;
  message: string;
  created_at?: string;
}

export interface Memory {
  id?: string;
  author_id: string;
  author_name: string;
  title?: string;
  content: string;
  created_at?: string;
}
