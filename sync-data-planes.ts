/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_MY_SUPABASE_URL || '',
  process.env.VITE_MY_SUPABASE_ANON_KEY || ''
);

async function syncComoGoogleSheets() {
  console.log('🌐 Iniciando el "Mete y Saca" de datos nivel Google Sheets...');

  // 1. Traemos todas las tablas (El "SpreadsheetApp.getActiveSpreadsheet()")
  const [p, e, c, r] = await Promise.all([
    supabase.from('planes').select('*'),
    supabase.from('empresas').select('*'),
    supabase.from('clinicas').select('*'),
    supabase.from('plan_clinica').select('*')
  ]);

  if (!p.data || !e.data || !c.data || !r.data) {
    console.error("❌ No se pudo succionar la data de Supabase");
    return;
  }

  // 2. Procesamos los planes igual que tu función obtenerDataPlanes
  const planesRelacionados = p.data.map(plan => {
    // Match de Empresa (obtenerDataEmpresas)
    const emp = e.data.find(empresa => empresa.id === plan.empresa_id);
    
    // El "misClinicas" de tu script: El secreto está en el mapeo { clinicas: cInfo }
    const misClinicas = r.data
      .filter(rel => rel.plan_id === plan.id)
      .map(rel => {
        const cInfo = c.data.find(clin => String(clin.id) === String(rel.clinica_id));
        if (!cInfo) return null;
        
        // ESTA ES LA ESTRUCTURA QUE LO DEJA ABIERTO COMO UNA FLOR
        return {
          clinicas: {
            id: cInfo.id,
            nombre: cInfo.nombre,
            nombre_abreviado: cInfo.nombre_abreviado || cInfo.nombre,
            ubicaciones: {
              barrio: cInfo.barrio || "",
              region: cInfo.region || "",
              direccion: cInfo.direccion || ""
            }
          }
        };
      }).filter(Boolean);

    // Mapeo del objeto empresa minimalista
    const imgParsed = typeof emp?.imagenes === 'string' ? JSON.parse(emp.imagenes) : emp?.imagenes;
    const slogansParsed = typeof emp?.slogans === 'string' ? JSON.parse(emp.slogans) : emp?.slogans;

    return {
      id: plan.id,
      nombre_plan: String(plan.nombre_plan || ""),
      item_id: String(plan.item_id || ""),
      empresa_id: plan.empresa_id,
      categoria: String(plan.categoria || "base").toLowerCase(),
      popularidad: parseInt(plan.popularidad || 0),
      listar: plan.listar === true,
      empresas: emp ? {
        id: emp.id,
        nombre: emp.nombre,
        imagenes: {
          logo: imgParsed?.logo || ""
        },
        slogans: Array.isArray(slogansParsed) ? slogansParsed : [""]
      } : null,
      plan_clinica: misClinicas // Inyectamos el array con el objeto "clinicas" adentro
    };
  });

  // 3. Estructura Final (El "mockTotal" de tu script)
  const mockTotal = {
    planes: planesRelacionados,
    tabla_empresas: e.data,
    tabla_clinicas: c.data,
    tabla_plan_clinica: r.data,
    last_update: new Date().toISOString()
  };

  const outputPath = path.resolve('./src/data/planes_mock.json');
  fs.writeFileSync(outputPath, JSON.stringify(mockTotal, null, 2), 'utf-8');
  
  console.log(`✅ ¡ÉXTASIS! Mock generado con ${planesRelacionados.length} planes. Derechito al Drive.`);
}

syncComoGoogleSheets();