// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vahuuunhjreqjtarmpfr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhaHV1dW5oanJlcWp0YXJtcGZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxMDUwOTYsImV4cCI6MjA0OTY4MTA5Nn0.98_BQoJgcaBizZSU_TdEn8Fv50BqsiJkzCK7V1C8tHs";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);