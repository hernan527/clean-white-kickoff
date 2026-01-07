// Definimos interfaces "planas" para que las funciones sean rápidas de procesar
export interface EmpresaSimple {
  id?: string;
  nombre?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  imagenes?: any;
  slogans?: string[];
}

export interface PlanSimple {
  id: string;
  nombre_plan?: string;
  nombre?: string;
  name?: string;
  titulo?: string;
  title?: string;
  precio?: number;
  price?: number;
  descripcion?: string;
  description?: string;
  empresas?: EmpresaSimple;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plan_clinica?: any[];
}

// --- TUS FUNCIONES NORMALIZADORAS ---

export function getPlanName(plan: PlanSimple): string {
  return plan.nombre_plan || plan.nombre || plan.name || plan.titulo || plan.title || 'Plan sin nombre';
}

export function getPlanPrice(plan: PlanSimple): number {
  return plan.precio || plan.price || 0;
}

export function getCompanyLogo(empresa?: EmpresaSimple): string | null {
  if (!empresa?.imagenes) return null;
  // Soporta tanto objeto directo como array de un solo elemento
  const logo = Array.isArray(empresa.imagenes) ? empresa.imagenes[0]?.logo : empresa.imagenes.logo;
  return logo || null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getClinicRegion(clinic?: any): string | null {
  if (!clinic?.ubicaciones) return null;
  return clinic.ubicaciones.region || clinic.ubicaciones.REGIONS?.[0] || null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getClinicBarrio(clinic?: any): string | null {
  if (!clinic?.ubicaciones) return null;
  return clinic.ubicaciones.barrio || clinic.ubicaciones.direccion || null;
}