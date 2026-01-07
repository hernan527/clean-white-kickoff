import { useQuery } from "@tanstack/react-query";
// IMPORTANTE: Importamos tu archivo de Mock (el que bajaste de Drive)
import planesMock from '@/data/planes_mock.json';

export const useFetchAllPlans = () => {
  return useQuery({
    queryKey: ["all-plans-structure"],
    queryFn: async () => {
      console.log("📦 Cargando datos desde el Mock Local (Bye bye 404)");
      
      // Devolvemos la propiedad 'planes' de tu nuevo Mock unificado
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return planesMock.planes || planesMock; 
    },
    staleTime: Infinity,
  });
};