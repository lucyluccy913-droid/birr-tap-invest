import { createClient } from '@supabase/supabase-js';

// Fallback to placeholders if env vars are missing to prevent startup crash
const supabaseUrl = 'https://qvcseyckvcyjcgvnoeej.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2Y3NleWNrdmN5amNndm5vZWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNTY1NjgsImV4cCI6MjA5NTczMjU2OH0._d-Odfv-mkXR3T21LjLB1_sbMxoQ03k7HWkDKxrbzwc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);