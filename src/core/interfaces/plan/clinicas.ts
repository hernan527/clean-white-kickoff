import { Ubicacion, Image } from './interfaces';

// Angular: Clinicas
export interface Clinica { // (Nombre en singular para React)
    _id?: string; // Opcional
    id?: string;   // Para Supabase
    nombre: string;
    entity: string;
    item_id: string;

    // Arrays de referencias/subdocumentos
    cartillas: string[];
    coberturas: CoberturaInterface[]; // Asumiendo que esta interfaz existe
    ubicacion: Ubicacion[]; // ⚠️ CORRECCIÓN: Ahora es OBLIGATORIO y tiene el tipo Ubicacion[]
    
    // Objeto anidado
    imagen: Image; // ⚠️ CORRECCIÓN: Usando la interfaz Image actualizada

    // Campos restantes
    url: string;
    tipo: string;
    especialidades: string[];
    rating: number;
    select: boolean;
}
export interface CoberturaInterface {
    _id?: string;
    key: string;
    label: string;
    
    // El array de 'children' contiene objetos anónimos con una estructura específica.
    children?: {
        _id?: string;
        key: string;
        label: string;
        id?: string;
    }[]; 
}


export interface CoberturaInterface {
    _id?: string;
    key: string;
    label: string;
    
    // El array de 'children' contiene objetos anónimos con una estructura específica.
    children?: {
        _id?: string;
        key: string;
        label: string;
        id?: string;
    }[]; 
}


export interface PlanClinica {
  id: string;
  plan_id: string;
  clinica_id: string;
  clinicas?: Clinica;
}