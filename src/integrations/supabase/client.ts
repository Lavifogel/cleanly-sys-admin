
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://evkldsfnndkgpifhgvic.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2a2xkc2ZubmRrZ3BpZmhndmljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1OTY2MzYsImV4cCI6MjA1NzE3MjYzNn0.j9SqdprTo_CZEgjWdRldpp2vgs9jaK5ePBbyOP4_jpc";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
