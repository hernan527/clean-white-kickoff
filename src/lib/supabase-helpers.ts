// Interfaces para trabajar con datos de planes (del mock o cualquier fuente)
export interface EmpresaSimple {
  id?: string | number;
  nombre?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  imagenes?: any;
  slogans?: string[];
}

export interface PlanSimple {
  id: string | number;
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

// --- FUNCIONES NORMALIZADORAS ---

export function getPlanName(plan: PlanSimple): string {
  return plan.nombre_plan || plan.nombre || plan.name || plan.titulo || plan.title || 'Plan sin nombre';
}

export function getPlanPrice(plan: PlanSimple): number {
  return plan.precio || plan.price || 0;
}

/**
 * Extrae la ruta del logo de una empresa y la normaliza.
 * Convierte rutas legacy (/assets/imagenes/) a las rutas correctas (/assets/imagenes/)
 */
export function getCompanyLogo(empresa?: EmpresaSimple): string | null {
  if (!empresa?.imagenes) return null;
  
  // Soporta tanto objeto directo como array de un solo elemento
  const logo = Array.isArray(empresa.imagenes) 
    ? empresa.imagenes[0]?.logo 
    : empresa.imagenes.logo;
  
  if (!logo) return null;
  
  // Normaliza la ruta: el mock usa /assets/imagenes/ pero las imágenes están en /assets/imagenes/
  return normalizeLogoPath(logo);
}

/**
 * Normaliza rutas de logos del mock a las rutas reales del proyecto
 */
export function normalizeLogoPath(path: string): string {
  if (!path) return '';
  
  // Corrige la ruta del mock: imagenes → images
  return path.replace('/assets/imagenes/', '/assets/imagenes/');
}

/**
 * Genera la URL completa del logo para usar en componentes
 */
export function getLogoUrl(empresaOrPath: EmpresaSimple | string | null | undefined): string {
  if (!empresaOrPath) return '/placeholder.svg';
  
  // Si es un string, normalizamos directamente
  if (typeof empresaOrPath === 'string') {
    return normalizeLogoPath(empresaOrPath) || '/placeholder.svg';
  }
  
  // Si es un objeto empresa, extraemos el logo
  const logoPath = getCompanyLogo(empresaOrPath);
  return logoPath || '/placeholder.svg';
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
