// src/modules/salud/hooks/usePlansMaster.ts
import { useQuery } from '@tanstack/react-query';
import { supabaseData } from "@/lib/supabase-data";

export const usePlansMaster = () => {
  return useQuery({
    queryKey: ['plans-structure'],
    queryFn: async () => {
      console.log("🚀 Descargando estructura de planes por única vez...");
      const { data, error } = await supabaseData
        .from('planes')
        .select(`
          *,
          empresas:empresa_id (nombre, imagenes),
          plan_clinica (clinicas (*))
        `)
        .eq('listar', true);

      if (error) throw error;
      return data;
    },
    // AQUÍ ESTÁ EL TRUCO:
    staleTime: Infinity, // Considera los datos siempre válidos (no re-fetechea)
    gcTime: 1000 * 60 * 60, // Mantiene la data en memoria por 1 hora
  });
};