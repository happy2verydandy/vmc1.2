import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

export async function getUserFromToken(
  supabase: ReturnType<typeof createClient<Database>>,
  token: string
) {
  try {
    // Use the Supabase client with service role to get user from JWT
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('Error validating token:', error);
      return null;
    }
    
    return data.user;
  } catch (error) {
    console.error('Unexpected error validating token:', error);
    return null;
  }
}