/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseData = createClient(
  process.env.VITE_MY_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''
);

const TAMANO_PAGINA = 1000;

async function obtenerPrecios(offset = 0, acumuladas: any[] = []): Promise<any[]> {
  const { data, error } = await supabaseData
    .from('cotizaciones_maestras')
    .select('id, created_at, group, edad_1, edad_2, hijos, tipo, respuesta, updated_at')
    .range(offset, offset + TAMANO_PAGINA - 1)
    .order('id', { ascending: true });

  if (error || !data || data.length === 0) return acumuladas;

  // Filtrado de seguridad
  const validas = data.filter(item => {
    const res = item.respuesta;
    if (!res || res === "null") return false;
    const resStr = typeof res === 'string' ? res : JSON.stringify(res);
    return resStr.trim().startsWith('[');
  });

  const totalActual = [...acumuladas, ...validas];
  console.log(`⏳ Descargando registros... (${totalActual.length})`);

  if (data.length < TAMANO_PAGINA) return totalActual;
  return await obtenerPrecios(offset + TAMANO_PAGINA, totalActual);
}

async function sync() {
  console.log('🚀 Sincronizando: JSON Pretty con Respuesta en String...');

  const precios = await obtenerPrecios();
  
  if (precios.length === 0) return;

  const datosFinales = precios.map(fila => ({
    id: fila.id,
    created_at: fila.created_at,
    group: fila.group,
    edad_1: fila.edad_1,
    edad_2: fila.edad_2,
    tipo: fila.tipo,
    // CLAVE: Forzamos que la respuesta sea un STRING comprimido
    // Si ya es string, lo deja. Si es objeto, lo stringifica sin espacios.
    respuesta: typeof fila.respuesta === 'string' 
      ? fila.respuesta 
      : JSON.stringify(fila.respuesta),
    hijos: fila.hijos,
    updated_at: fila.updated_at
  }));

  const outputPath = path.resolve('./src/data/cotizaciones_maestras_rows.json');
  
  // Guardamos con identación de 2 espacios para el cuerpo del JSON
  // Pero como 'respuesta' es un string, se quedará en una sola línea dentro de las comillas
  fs.writeFileSync(outputPath, JSON.stringify(datosFinales, null, 2), 'utf-8');
  
  console.log(`✅ ¡Archivo generado correctamente!`);
  console.log(`📂 Ruta: ${outputPath}`);
}

sync();