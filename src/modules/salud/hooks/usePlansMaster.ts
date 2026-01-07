// src/modules/salud/hooks/usePlansMaster.ts
// DEPRECATED: Este hook usaba Supabase externo. Ahora usamos usePlans() con el mock local.
// Se mantiene por compatibilidad pero redirige al mock.

import { usePlans } from '@/hooks/usePlans';

/**
 * @deprecated Usar usePlans() directamente. Este hook es legacy.
 */
export const usePlansMaster = () => {
  console.warn('⚠️ usePlansMaster está deprecado. Usar usePlans() en su lugar.');
  return usePlans();
};
