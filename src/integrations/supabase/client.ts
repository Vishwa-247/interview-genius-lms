
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mylbvrzjpwbidrqdoakk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15bGJ2cnpqcHdiaWRycWRvYWtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NDk1MDQsImV4cCI6MjA1MjQyNTUwNH0.f55UyY8kRzl7RZrbmVYnIWH0nEx51B42emvLLpiE0wc";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
