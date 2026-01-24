/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.VITE_MY_SUPABASE_URL || '';
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Este script corre en el build (pnpm sync). En CI/preview no siempre existen las env.
// Si faltan, salimos sin fallar para no romper el build.
if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    '⚠️ sync-data-planes.ts: faltan variables de entorno (VITE_SUPABASE_URL / VITE_SUPABASE_SERVICE_ROLE_KEY). Se omite sync para no romper el build.'
  );
  process.exit(0);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function syncComoGoogleSheets() {
  console.log('🌐 Iniciando el "Mete y Saca" de datos con relaciones completas...');

  const [p, e, c, r, pp, pm] = await Promise.all([
    supabase.from('planes').select('*'),
    supabase.from('empresas').select('*'),
    supabase.from('clinicas').select('*'),
    supabase.from('plan_clinica').select('*'),
    supabase.from('plan_prestacion').select('*'),
    supabase.from('prestaciones_maestras').select('*')
  ]);

  if (!p.data || !e.data || !c.data || !r.data || !pp.data || !pm.data) {
    console.error("❌ No se pudo succionar la data completa de Supabase");
    return;
  }

  const planesRelacionados = p.data.map(plan => {
    const emp = e.data.find(empresa => empresa.id === plan.empresa_id);
    
    // --- 🏥 MATCH DE CLÍNICAS (Corregido para el Frontend) ---
    const misClinicas = r.data
      .filter(rel => Number(rel.plan_id) === Number(plan.id))
      .map(rel => {
        const cInfo = c.data.find(clin => Number(clin.id) === Number(rel.clinica_id));
        if (!cInfo) return null;

        return {
          plan_id: rel.plan_id,
          clinica_id: rel.clinica_id,
          // IMPORTANTE: La propiedad debe llamarse 'clinicas' (plural) 
          // para coincidir con tu lógica de 'pc.clinicas' en el frontend
          clinicas: {
            ...cInfo,
            // Normalizamos imágenes para que siempre sea un array
            imagenes: Array.isArray(cInfo.imagenes) ? cInfo.imagenes : [],
            // Mantenemos la estructura original de ubicaciones para no romper nada
            ubicaciones: cInfo.ubicaciones 
          }
        };
      }).filter(Boolean);

    // --- 🛠️ MATCH DE PRESTACIONES ---
    const misPrestaciones = pp.data
      .filter(rel => Number(rel.plan_id) === Number(plan.id))
      .map(rel => {
        const pMaestra = pm.data.find(m => m.id === rel.prestacion_id);
        if (!pMaestra) return null;
        return {
          ...rel,
          prestaciones_maestras: pMaestra
        };
      }).filter(Boolean);

    const imgParsed = typeof emp?.imagenes === 'string' ? JSON.parse(emp.imagenes) : emp?.imagenes;
    const slogansParsed = typeof emp?.slogans === 'string' ? JSON.parse(emp.slogans) : emp?.slogans;

    return {
      ...plan,
      id: plan.id,
      empresas: emp ? {
        ...emp,
        imagenes: { logo: imgParsed?.logo || "" },
        slogans: Array.isArray(slogansParsed) ? slogansParsed : [""]
      } : null,
      plan_clinica: misClinicas,
      plan_prestacion: misPrestaciones
    };
  });

  const mockTotal = {
    planes: planesRelacionados,
    tabla_empresas: e.data,
    tabla_clinicas: c.data,
    tabla_plan_clinica: r.data,
    last_update: new Date().toISOString()
  };

  const outputPath = path.resolve('./src/data/planes_mock.json');
  fs.writeFileSync(outputPath, JSON.stringify(mockTotal, null, 2), 'utf-8');
  
  console.log(`✅ ¡ÉXTASIS! Mock generado con ${planesRelacionados.length} planes. Clínicas vinculadas.`);
}

syncComoGoogleSheets();