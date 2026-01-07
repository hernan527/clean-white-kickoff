// src/services/priceEngine.ts
import masterQuotes from '@/data/cotizaciones_maestras_rows.json';

export const getPricesById = (edad1: number, edad2: number, hijos: number, tipo: string) => {
  // 1. Generamos el ID siguiendo tu regla: E1 + E2 + H + T
  // PadStart asegura que si el número es 0, ponga "00"
  const idStr = `${edad1}${String(edad2).padStart(2, '0')}${String(hijos).padStart(2, '0')}${tipo === 'P' ? '0' : '1'}`;
  const targetId = parseInt(idStr);

  // 2. Buscamos directamente por ID (Es la forma más rápida)
  const row = masterQuotes.find(q => q.id === targetId);

  if (!row || !row.respuesta) return [];

  // 3. Devolvemos los precios parseados
  return JSON.parse(row.respuesta);
};