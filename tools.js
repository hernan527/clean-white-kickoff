import { createClient } from '@supabase/supabase-js';

// Los datos de tu .env
const supabaseUrl = "https://gbclrbofmfwobopywyiz.supabase.co";
const supabaseKey = "TU_VITE_SUPABASE_PUBLISHABLE_KEY"; // Pegala acá

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspeccionar() {
    console.log("🔍 Investigando la estructura de usuarios...");
    
    // 1. Intentamos leer la tabla de perfiles (donde suelen estar los roles)
    const { data: perfiles, error } = await supabase
        .from('profiles') // o 'users', probá ambos
        .select('*');

    if (error) {
        console.log("❌ No pude leer perfiles, probando otra tabla...");
        // Intentar con otra tabla común
    } else {
        console.table(perfiles);
    }

    // 2. Ver funciones activas (esto es más difícil sin service_key, 
    // pero podemos ver si responden)
    const functionUrl = "https://gbclrbofmfwobopywyiz.supabase.co/functions/v1/hello"; // Probá un nombre de función que conozcas
    console.log("📡 Testeando función en:", functionUrl);
}

inspeccionar();