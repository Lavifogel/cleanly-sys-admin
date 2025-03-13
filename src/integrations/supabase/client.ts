
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://evkldsfnndkgpifhgvic.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2a2xkc2ZubmRrZ3BpZmhndmljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1OTY2MzYsImV4cCI6MjA1NzE3MjYzNn0.j9SqdprTo_CZEgjWdRldpp2vgs9jaK5ePBbyOP4_jpc";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-App-Version': '1.0.0',
    },
  },
});

// Helper functions for new schema
export const getUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) throw error;
  return data || [];
};

export const getQrCodes = async () => {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*');
  
  if (error) throw error;
  return data || [];
};

export const getAreas = async () => {
  const { data, error } = await supabase
    .from('areas')
    .select('*');
  
  if (error) throw error;
  return data || [];
};

export const getShifts = async () => {
  const { data, error } = await supabase
    .from('shifts')
    .select('*');
  
  if (error) throw error;
  return data || [];
};

export const getCleanings = async () => {
  const { data, error } = await supabase
    .from('cleanings')
    .select('*');
  
  if (error) throw error;
  return data || [];
};

export const getImages = async () => {
  const { data, error } = await supabase
    .from('images')
    .select('*');
  
  if (error) throw error;
  return data || [];
};
