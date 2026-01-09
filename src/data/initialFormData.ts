// Archivo: src/data/initialFormData.ts

import { QuoteFormData } from '@/core/interfaces/plan/quoteFormData'; // Asegúrate de que esta importación sea correcta

export const initialFormData: QuoteFormData = {
  _id: '',
  group: 1,
  empresa_prepaga: 0,
  edad_1: 34,
  edad_2: 0,
  numkids: 1,
  tipo: 'P',
  agree: true,
  aporteOS: 0,
  sueldo: 0,
  aporte: 0,
  categoriaMono: '',
  monoadic: 0,
  cantAport: 0,
  afinidad: false,
  bonAfinidad: 0,
  personalData: {
    name: '',
    email: '',
    phone: '',
    region: 'AMBA',
    medioContacto: ''
  },
  zone_type: '',
  edadHijo1: 0,
  edadHijo2: 0,
  edadHijo3: 0,
  edadHijo4: 0,
  edadHijo5: 0
};