import { Ubicacion as MiUbicacion, Image as MiImagen } from './interfaces';

export interface Empresa {
  _id?: string;
  name?: string;
  ubicacion?: MiUbicacion;
  sucursales?: MiUbicacion[];
  telefono?: string;
  imagen?: MiImagen[];
}


// Types based on expected schema
export interface PlanEmpresa {
  id: string;
  nombre: string;
  slogans?: string[]; // La columna de la base de datos como array de strings
  imagenes?: {
    logo?: string;
  } | { logo?: string }[];
}

export interface Clinica {
  id: string;
  nombre: string;
  nombre_abreviado?: string; // <--- AGREGÁ ESTA LÍNEA
  ubicaciones?: {
    REGIONS?: string[];
    region?: string;
    direccion?: string;
    barrio?:string;
  };
}

