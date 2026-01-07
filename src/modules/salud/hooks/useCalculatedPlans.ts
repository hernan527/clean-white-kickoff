// src/modules/salud/hooks/useCalculatedPlans.ts
// Hook para cálculo de precios usando el mock de cotizaciones

import { useQuery } from '@tanstack/react-query';
import { usePlans } from '@/hooks/usePlans';
import masterQuotes from '@/data/cotizaciones_maestras_rows.json';

/**
 * Hook que combina planes del mock con las cotizaciones maestras para calcular precios
 */
export const useCalculatedPlans = () => {
  const { data: planes, isLoading: planesLoading } = usePlans();

  return useQuery({
    queryKey: ['calculated-plans', planes?.length],
    queryFn: async () => {
      if (!planes) return [];
      
      // Combinar planes con cotizaciones si es necesario
      // Por ahora retornamos los planes tal cual
      return planes;
    },
    enabled: !!planes && !planesLoading,
    staleTime: Infinity,
  });
};

// Re-exportar las cotizaciones maestras por si se necesitan
export { masterQuotes };
