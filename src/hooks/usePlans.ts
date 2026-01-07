import { useQuery } from '@tanstack/react-query';
import mockData from '@/data/planes_mock.json';
import { Plan } from '@/core/interfaces/plan/planes';
import { Clinica } from '@/core/interfaces/plan/clinicas';
import { PlanEmpresa } from '@/core/interfaces/plan/empresas';

export function usePlans() {
  return useQuery({
    queryKey: ['plans-optimized'],
    queryFn: async () => {
      // 1. Extraemos las tablas puras del Mock
      const { planes, tabla_empresas, tabla_clinicas, tabla_plan_clinica } = mockData;

      // 2. Creamos Mapas (Diccionarios) para acceso instantáneo O(1)
      // Esto es mucho más rápido que usar .find() miles de veces
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const empresasMap = new Map(tabla_empresas.map((e: any) => [e.id, e]));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const clinicasMap = new Map(tabla_clinicas.map((c: any) => [c.id, c]));

      // 3. Procesamos los planes inyectando sus relaciones reales
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const planesProcesados = planes.map((plan: any) => {
        // Buscamos la empresa en el mapa
        const empresa = empresasMap.get(plan.empresa_id) || null;

        // Buscamos las clínicas usando la tabla de relación
        const planClinicas = tabla_plan_clinica
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((rel: any) => rel.plan_id === plan.id)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((rel: any) => {
            const clinicaInfo = clinicasMap.get(rel.clinica_id);
            return clinicaInfo ? { clinicas: clinicaInfo } : null;
          })
          .filter(Boolean);

        return {
          ...plan,
          empresas: empresa,
          plan_clinica: planClinicas,
        } as Plan;
      });

      return planesProcesados;
    },
    staleTime: Infinity, // Como es un mock, no cambia nunca
  });
}