// ============= Admin Module Types =============

// Base types for API entities
export interface Empresa {
  _id: string;
  nombre: string;
  descripcion?: string;
  images: Array<{
    url: string;
    descripcion?: string;
    nombre?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Especialidad {
  nombre: string;
  activa: boolean;
}

export interface Direccion {
  calle: string;
  numero: string;
  ciudad: string;
  provincia: string;
  codigoPostal?: string;
  barrio?: string;
  latitud?: number;
  longitud?: number;
}

export interface Clinica {
  _id: string;
  entity: string;
  nombre?: string;
  descripcion?: string;
  images: Array<{
    url: string;
    descripcion?: string;
    nombre?: string;
  }>;
  direcciones: Direccion[];
  especialidades: Especialidad[];
  ubicacion?: Array<{
    region: string;
    barrio: string;
  }>;
  item_ids: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PlanArchivo {
  url: string;
  nombre: string;
  descripcion?: string;
  tipo: 'imagen' | 'pdf' | 'otro';
}

export interface Plan {
  _id: string;
  nombre: string;
  empresa: string;
  empresaId?: string;
  linea?: string;
  descripcion?: string;
  precio?: number;
  attributes?: Array<{
    name: string;
    value: string | boolean;
  }>;
  images: Array<{
    url: string;
    descripcion?: string;
    nombre?: string;
  }>;
  archivos: PlanArchivo[];
  clinicas?: string[];
  rating?: number;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Dashboard stats
export interface DashboardStats {
  total_users: number;
  total_vendors: number;
  total_quotes: number;
  total_quote_views: number;
  active_sessions_24h: number;
  quotes_last_7_days: number;
}

// User management
export interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  last_sign_in: string | null;
}

// Activity tracking
export interface UserActivity {
  id: string;
  user_id: string | null;
  user_email: string;
  session_id: string | null;
  event_type: string;
  event_data: Record<string, unknown>;
  page_url: string | null;
  ip_address: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
  time_on_page: number | null;
  created_at: string;
}

// Specialties constants
export const ESPECIALIDADES_COMUNES: string[] = [
  'Clínica',
  'Sanatorio',
  'Hospital',
  'Guardia',
  'Internación',
  'Consultorios Externos',
  'Laboratorio',
  'Diagnóstico por Imágenes',
  'Rehabilitación',
  'Odontología',
  'Oftalmología',
  'Cardiología',
  'Pediatría',
  'Ginecología',
  'Traumatología',
  'Neurología',
  'Dermatología',
  'Psiquiatría',
  'Kinesiología',
  'Nutrición'
];
