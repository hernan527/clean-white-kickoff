/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseData = createClient(
  process.env.VITE_MY_SUPABASE_URL || '',
  process.env.VITE_MY_SUPABASE_ANON_KEY || ''
);

const TAMANO_PAGINA = 1000;

async function bajarTabla(nombreTabla: string) {
  console.log(`📥 Bajando tabla: ${nombreTabla}...`);
  try {
    const { data, error } = await supabaseData.from(nombreTabla).select('*');
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error(`⚠️  Tabla ${nombreTabla} no disponible o vacía.`);
    return [];
  }
}

// IMPORTANTE: Aseguramos que la recursión devuelva los datos correctamente
async function obtenerPrecios(offset = 0, acumuladas: any[] = []): Promise<any[]> {
  const { data, error } = await supabaseData
    .from('cotizaciones_maestras')
    .select('*')
    .range(offset, offset + TAMANO_PAGINA - 1)
    .order('id', { ascending: true });

  if (error || !data || data.length === 0) return acumuladas;

  const validas = data.filter(item => {
    const res = item.respuesta;
    if (!res || res === "null") return false;
    const resStr = typeof res === 'string' ? res : JSON.stringify(res);
    return !resStr.includes("ERROR_GET_ITEMS") && resStr !== "[]" && resStr.trim().startsWith('[');
  });

  const totalActual = [...acumuladas, ...validas];
  console.log(`⏳ Procesando precios... (Válidas: ${totalActual.length})`);

  if (data.length < TAMANO_PAGINA) return totalActual;
  
  // Agregamos el AWAIT aquí para que la recursión no se pierda
  return await obtenerPrecios(offset + TAMANO_PAGINA, totalActual);
}

async function syncTotalDesdeSupabase() {
  console.log('🚀 Iniciando Sincronización Maestra...');

  // 1. Obtener los precios primero (es lo más pesado)
  const precios = await obtenerPrecios();
  
  if (precios.length === 0) {
    console.error("❌ No se encontraron precios válidos en Supabase. Abortando.");
    return;
  }

  // 2. Obtener tablas de apoyo
  const planes = await bajarTabla('planes');
  const clinicas = await bajarTabla('clinicas');
  const empresas = await bajarTabla('empresas');
  const relaciones = await bajarTabla('plan_clinica');
  const atributos = await bajarTabla('atributos');
  const planAtributos = await bajarTabla('plan_atributo');

  console.log('🏗️  Cruzando datos enriquecidos...');

  const datosFinales = precios.map(fila => {
    let planesConPrecio = [];
    try {
      planesConPrecio = typeof fila.respuesta === 'string' ? JSON.parse(fila.respuesta) : fila.respuesta;
    } catch (e) { return null; }

    const respuestaEnriquecida = planesConPrecio.map((itemPrecio: any) => {
      const infoPlan = planes.find((p: any) => p.item_id === itemPrecio.item_id);
      if (!infoPlan) return itemPrecio;

      const empresa = empresas.find((e: any) => e.id === infoPlan.empresa_id);
      
      const clinicasDelPlan = relaciones
        .filter((r: any) => r.plan_id === infoPlan.id)
        .map((r: any) => clinicas.find((c: any) => c.id === r.clinica_id))
        .filter(Boolean);

      const atributosDelPlan = planAtributos
        .filter((pa: any) => pa.plan_id === infoPlan.id)
        .map((pa: any) => {
          const det = atributos.find((a: any) => a.id === pa.atributo_id);
          return det ? { etiqueta: det.nombre, valor: pa.valor } : null;
        })
        .filter(Boolean);

      return {
        ...itemPrecio,
        logo: empresa?.imagenes?.logo || "",
        empresa_nombre: empresa?.nombre || "",
        clinicas: clinicasDelPlan,
        atributos: atributosDelPlan,
        categoria: infoPlan.categoria
      };
    });

    return {
      ...fila,
      respuesta: JSON.stringify(respuestaEnriquecida)
    };
  }).filter(Boolean);

  // 3. Guardar archivo final
  const outputPath = path.resolve('./src/data/cotizaciones_final.json');
  fs.writeFileSync(outputPath, JSON.stringify(datosFinales, null, 2), 'utf-8');
  
  console.log(`---`);
  console.log(`✅ ¡Sincronización terminada!`);
  console.log(`📂 Archivo generado: ${outputPath}`);
  console.log(`💎 Registros finales: ${datosFinales.length}`);
}

syncTotalDesdeSupabase();