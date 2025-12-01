import { environment } from '@/environments/environment';
import { supabase } from '@/integrations/supabase/client';

// --- Interfaces ---
export interface Ubicacion {
  direccion: string;
  telefono: string;
  barrio: string;
  partido: string;
  region: string;
  provincia: string;
  CP: string;
}

export interface Clinica {
  item_id: string;
  nombre: string;
  entity: string;
  ubicacion?: Ubicacion[];
}

export interface Attribute {
  name: string;
  value_name: string;
  attribute_group_name: string;
  attribute_name_order?: number | null;
  attribute_group_order?: number | null;
}

export interface Image {
  id: string;
  descripcion: string;
  empresa: string;
  url: string;
}

export interface HealthPlan {
  _id: string;
  name: string;
  empresa: string;
  price: number;
  rating: number;
  linea: string;
  attributes?: Attribute[];
  clinicas?: Clinica[];
  images?: Image[];
  folleto?: string[];
}

export interface QuoteFormData {
  group: number | null;
  edad_1: number;
  edad_2: number;
  numkids: number;
  edadHijo1: number;
  edadHijo2: number;
  edadHijo3: number;
  edadHijo4: number;
  edadHijo5: number;
  zone_type: string;
  tipo: string;
  sueldo: number;
  aporteOS: number;
  personalData: {
    name: string;
    email: string;
    phone: string;
    region: string;
    medioContacto: string;
  };
}

export interface QuoteResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

// --- API Service Functions ---

/**
 * Fetches all available health plans from the API
 */
export const getHealthPlans = async (): Promise<HealthPlan[]> => {
  const response = await fetch(`${environment.healthApiBaseUrl}/planes`);
  
  if (!response.ok) {
    throw new Error(`Error fetching health plans: ${response.statusText}`);
  }
  
  return response.json();
};

/**
 * Submits a quote request through the Supabase edge function
 */
export const submitQuote = async (formData: QuoteFormData): Promise<QuoteResponse> => {
  const { data, error } = await supabase.functions.invoke('submit-quote', {
    body: formData
  });

  if (error) {
    console.error('Error submitting quote:', error);
    return {
      success: false,
      error: error.message || 'Error al enviar la cotización'
    };
  }

  return {
    success: true,
    data
  };
};

// --- Health Service Object (Angular-like pattern) ---
export const HealthService = {
  getPlans: getHealthPlans,
  submitQuote: submitQuote
};

export default HealthService;
