// En tu archivo de cliente de Supabase
import { createClient } from '@supabase/supabase-js'
import { Database } from './types' // tus tipos generados

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Forzamos el tipo para evitar la recursión infinita en la inicialización
export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) as any 

// Luego lo exportas con un tipo más simple si es necesario
import { SupabaseClient } from '@supabase/supabase-js'
export const safeSupabase = supabase as SupabaseClient<Database>