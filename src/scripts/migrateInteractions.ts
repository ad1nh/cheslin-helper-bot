import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

const testConnection = async () => {
  console.log("Testing Supabase connection...");

  // First authenticate
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: process.env.SUPABASE_USER_EMAIL!,
    password: process.env.SUPABASE_USER_PASSWORD!
  });

  if (authError) {
    console.error("Authentication error:", authError);
    return;
  }

  console.log("Authentication successful");

  // Now try to read campaigns
  const { data: existingCampaigns, error: readError } = await supabase
    .from('campaigns')
    .select('*');

  console.log("Reading existing campaigns:", {
    success: !readError,
    error: readError,
    count: existingCampaigns?.length || 0
  });
};

testConnection(); 