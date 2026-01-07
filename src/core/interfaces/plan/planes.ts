
import { Image } from './interfaces';
import { Clinica } from './clinicas';
import { PlanClinica } from './clinicas';
import { PlanEmpresa } from './empresas';

export interface HealthPlan {
    _id: string; // Coincide
    item_id?: string; // Opcional, si se usa
    linea?:string;
    // Datos principales
    name?: string; // Coincide
    empresa?: string; // Coincide
    sigla?: string; // Agregado para coincidir
    price: number; // Coincide
    precio: number; // **Corregido a number** (antes ReactNode)
    rating: number; // Coincide
    raiting: number; // Agregado para coincidir con el campo duplicado
    category?: 'inferior' | 'intermedio' | 'superior'; // Agregado

    // Atributos binarios (solo los más relevantes para un resumen)
    Sin_Copagos: boolean; // Agregado
    Habitacion_Individual: boolean; // Agregado
    copagos: boolean; // Agregado

    // Arrays anidados (corregido a singular Clinica, Image si es un único type)
    attributes: Attribute[]; // Coincide
    clinicas: Clinica[]; // **Corregido a Clinicas[]** para coincidir con el plural usado en Planes
    images: Image[]; // **Corregido a Imagen[]** para coincidir con el tipo usado en Planes
    
    // Arrays de strings
    folletos?: string[]; // Coincide (Planes tiene folletos en plural)
    beneficios?: string[]; // Agregado
}
// Angular: Attribute + campos adicionales mencionados
export interface Attribute {
    // Campos que ya estaban en Angular
    id: string | null;
    name: string;
    value_id: string | null;
    value_name: string;
    attribute_group_id: string | null;
    attribute_group_name: string;
    value_type: string | null;

    // Campos adicionales que mencionaste que existen
    attribute_group_order?: number | null; // Asegurar que acepte "" (string) o number, lo dejo como string | number
    attribute_name_order?: number | null; // Asegurar que acepte "" (string) o number
    display?: string;
    value?: string;
}





export interface Atributo {
  id: string;
  nombre: string;
  valor: string;
  categoria?: string;
  icono?: string;
}


export interface PlanAtributo {
  id: string;
  plan_id: string;
  atributo_id: string;
  valor?: string;
  atributos?: Atributo;
}

export interface Plan {
  id: string;
  nombre?: string;
  nombre_plan?: string;
  item_id?: string; // Opcional, si se usa
  name?: string;
  titulo?: string;
  title?: string;
  precio?: number;
  price?: number;
  descripcion?: string;
  description?: string;
  empresa_id?: string;
  empresas?: PlanEmpresa;
  plan_clinica?: PlanClinica[];
  plan_atributo?: PlanAtributo[];
  plan_clinicas?: PlanClinica[];
  plan_atributos?: PlanAtributo[];
}