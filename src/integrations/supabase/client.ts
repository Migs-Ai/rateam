// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ridxdxxuywbenqgqushw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZHhkeHh1eXdiZW5xZ3F1c2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NTc3ODQsImV4cCI6MjA2NzMzMzc4NH0.6AbgVBBJvATMX0eIKJGCFQvZrKmuAY3KYxzeNawPZ5s";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});