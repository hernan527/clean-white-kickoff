/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Upload, X, MapPin, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CartillaManager } from '../components/organisms/CartillaManager'; // Asegurate de que la ruta sea correcta
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // 👈 AGREGA ESTA LÍNEA
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import AdminService from '../services/admin.service';
import { Clinica, Direccion, ESPECIALIDADES_COMUNES } from '../types';

interface ClinicaImage {
  url: string;
  nombre?: string;
  descripcion?: string;
}

const emptyDireccion: Direccion = {
  calle: '',
  numero: '',
  ciudad: '',
  telefono: '',
  provincia: '',
  codigoPostal: '',
  barrio: '',
};

export const AdminClinicasPage = () => {
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClinica, setSelectedClinica] = useState<Clinica | null>(null);
  const [saving, setSaving] = useState(false);

// 1. Actualiza el estado inicial
const [formData, setFormData] = useState({
  nombre_abreviado: '',
  nombre: '',
  descripcion: '',
  imagenes: [] as ClinicaImage[],
  direcciones: [{ ...emptyDireccion }] as Direccion[],
  especialidades: [] as string[],
  entity: '',
  images: [],
  url: '',
  // 👇 AGREGA ESTOS DOS:
  planIds: [] as number[],
  atributoIds: [] as number[],
});

  const [newImage, setNewImage] = useState({ url: '', nombre: '', descripcion: '' });

  useEffect(() => {
    fetchClinicas();
  }, []);

  const fetchClinicas = async () => {
    setLoading(true);
    const data = await AdminService.getClinicas();
    setClinicas((data || []) as Clinica[]);
    setLoading(false);
  };

  const filteredClinicas = clinicas.filter(c => 
    c.nombre_abreviado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

const handleNew = () => {
  setSelectedClinica(null);
  setFormData({
    nombre_abreviado: '',
    nombre: '',
    descripcion: '',
    imagenes: [],
    direcciones: [{ ...emptyDireccion }],
    especialidades: [],
    entity: '',
    images: [],
    url: '',
    planIds: [],    // 👈 Simplemente inicializa vacío
    atributoIds: [] // 👈 Simplemente inicializa vacío
  });
  setIsModalOpen(true);
};

const handleEdit = (clinica: Clinica) => {
  setSelectedClinica(clinica);
console.log("DATOS REALES DE LA CLINICA:", clinica);
  // 1. Extraer datos (intentamos todos los nombres posibles que devuelve Supabase)
  const rawUbicaciones = (clinica as any).ubicaciones || clinica.direcciones || [];
  
  // 2. Normalizar: Nos aseguramos de que sea un array y parseamos si viene como string

const direccionesNormalizadas = (Array.isArray(rawUbicaciones) && rawUbicaciones.length > 0)
  ? rawUbicaciones.map((u: any) => {
      // 1. Lógica para separar Calle de Número
      const fullDireccion = u.direccion || '';
      
      // Buscamos el último espacio seguido de números (ej: "Rivadavia 1234")
      const match = fullDireccion.match(/(.*)\s(\d+)$/);
      
      const calleExtraida = match ? match[1] : fullDireccion;
      const numeroExtraido = match ? match[2] : '';

      return {
        calle: calleExtraida,
        numero: u.numero || numeroExtraido, // Si ya tiene número en la DB lo usa, sino usa el extraído
        barrio: u.barrio || '',
        telefono: u.telefono || '',
        ciudad: u.region || u.ciudad || '',
        codigoPostal: u.cp || u.codigoPostal || '',
        provincia: u.provincia || ''
      };
    })
  : [{ ...emptyDireccion }];

  // 3. ACTUALIZACIÓN CRUCIAL: Pasamos TODO el objeto para que React lo detecte
  setFormData({
    nombre_abreviado: clinica.nombre_abreviado || '', 
    nombre: clinica.nombre || '',
    descripcion: clinica.descripcion || '',
    imagenes: clinica.imagenes || [],
    direcciones: direccionesNormalizadas, // <--- Aquí entran los datos
    especialidades: clinica.especialidades?.map((e: any) => typeof e === 'string' ? e : e.nombre) || [],
    entity: (clinica as any).entity || '',
    images: [],
    url: clinica.url || '',
    planIds: (clinica as any).plan_clinica?.map((p: any) => Number(p.plan_id)) || [],
    atributoIds: (clinica as any).clinica_atributo?.map((a: any) => Number(a.atributo_id)) || [],
  });

  setIsModalOpen(true);
};


  const handleDelete = (clinica: Clinica) => {
    setSelectedClinica(clinica);
    setIsDeleteDialogOpen(true);
  };

  // 2. Función para recibir los IDs desde el componente hijo
const handleCartillaChange = (planes: number[], atributos: number[]) => {
  setFormData(prev => ({
    ...prev,
    planIds: planes,
    atributoIds: atributos
  }));
};

  const confirmDelete = async () => {
    if (!selectedClinica) return;
    const result = await AdminService.deleteClinicaFull(selectedClinica._id);
    if (result) {
      toast.success('Clínica eliminada correctamente');
      fetchClinicas();
    } else {
      toast.error('Error al eliminar la clínica');
    }
    setIsDeleteDialogOpen(false);
  };

  const handleAddImage = () => {
    if (!newImage.url) {
      toast.error('La URL de la imagen es requerida');
      return;
    }
    setFormData(prev => ({
      ...prev,
      imagenes: [...prev.imagenes, { ...newImage }],
    }));
    setNewImage({ url: '', nombre: '', descripcion: '' });
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index),
    }));
  };

const handleAddDireccion = () => {
  setFormData(prev => ({
    ...prev,
    direcciones: [
      ...prev.direcciones,
      { calle: '', numero: '', barrio: '', ciudad: '',  telefono: '', codigoPostal: '', provincia: '' }
    ]
  }));
};

  const handleRemoveDireccion = (index: number) => {
    if (formData.direcciones.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      direcciones: prev.direcciones.filter((_, i) => i !== index),
    }));
  };

const handleDireccionChange = (index: number, field: string, value: string) => {
  setFormData(prev => {
    // 1. Clonamos el array de direcciones actual
    const nuevasDirecciones = [...prev.direcciones];
    
    // 2. Actualizamos SOLO la propiedad del objeto en esa posición
    nuevasDirecciones[index] = { 
      ...nuevasDirecciones[index], 
      [field]: value 
    };

    // 3. Devolvemos el estado actualizado
    return { ...prev, direcciones: nuevasDirecciones };
  });
};

  const toggleEspecialidad = (esp: string) => {
    setFormData(prev => ({
      ...prev,
      especialidades: prev.especialidades.includes(esp)
        ? prev.especialidades.filter(e => e !== esp)
        : [...prev.especialidades, esp],
    }));
  };

  const handleSave = async () => {
  // 1. Validar que tengamos el nombre
  if (!formData.nombre_abreviado && !formData.entity) {
    toast.error('El nombre abreviado es requerido');
    return;
  }

  setSaving(true);
  
  // 🛠️ 2. PREPARACIÓN DEL PAYLOAD (La "traducción" para la DB)
  const payload = {
    nombre_abreviado: formData.nombre_abreviado || formData.entity, 
    nombre: formData.nombre,
    descripcion: formData.descripcion || "",
    imagenes: formData.imagenes || formData.images || [],
    // ✅ IMPORTANTE: Aquí enviamos el ARRAY de direcciones a la columna 'ubicaciones'
    ubicaciones: formData.direcciones || [], 
    url: formData.url,
    especialidades: (formData.especialidades || []).map(e => 
      typeof e === 'string' ? { nombre: e, activa: true } : e
    ),
  };

  try {
    let result: unknown;

    if (selectedClinica) {
      const idFinal = selectedClinica.id || selectedClinica._id || selectedClinica.ID;

      if (!idFinal) {
        throw new Error("No se encontró el ID de la clínica para actualizar");
      }

      console.log("🚀 Enviando a DB:", payload);

      // ✅ CORRECCIÓN: Usamos 'payload' en lugar de 'formData'
      result = await AdminService.updateClinicaFull(
        idFinal.toString(), 
        payload,             // 👈 Enviamos los datos traducidos (con ubicaciones como array)
        formData.planIds,    
        formData.atributoIds 
      );
    } else {
      // Crear nueva clínica
// ✅ Convertimos los números a strings con .map(String)
result = await AdminService.createClinicaFull(
  payload, 
  formData.planIds.map(String) 
);    }

    if (result) {
      toast.success(selectedClinica ? 'Clínica actualizada' : 'Clínica creada');
      fetchClinicas(); // Recargamos la lista para ver los cambios
      setIsModalOpen(false);
    }
  } catch (error: any) {
    console.error("❌ Error en el proceso de guardado:", error);
    toast.error(error.message || "Error al conectar con el servidor");
  } finally {
    setSaving(false);
  }
};
console.log("ESTADO ACTUAL FORM_DATA:", formData.direcciones);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clínicas</h1>
          <p className="text-muted-foreground">Gestión de clínicas y centros de salud</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Clínica
        </Button>
      </div>

      {/* Search */}
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clínica..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Lista de Clínicas ({filteredClinicas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>nombre_abreviado</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Direcciones</TableHead>
                  <TableHead>Especialidades</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
{filteredClinicas.map((clinica) => (
    // Usa clinica.id o clinica._id, pero asegúrate de que exista
    <TableRow key={`clinica-${clinica._id || clinica.id}`}>
                    <TableCell>
                      {clinica.imagenes?.[0]?.url ? (
                        <img 
                          src={clinica.imagenes[0].url} 
                          alt={clinica.nombre_abreviado}
                          className="w-12 h-12 object-contain bg-white rounded border"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{clinica.nombre_abreviado}</TableCell>
                    <TableCell className="text-muted-foreground">{clinica.nombre || '-'}</TableCell>
                    <TableCell>{clinica.direcciones?.length || 0}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {clinica.especialidades?.slice(0, 3).map((esp, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {esp.nombre}
                          </Badge>
                        ))}
                        {(clinica.especialidades?.length || 0) > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(clinica.especialidades?.length || 0) - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(clinica)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(clinica)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit/Create Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedClinica ? 'Editar Clínica' : 'Nueva Clínica'}
            </DialogTitle>
            <DialogDescription>Realiza cambios en la información de la clínica aquí.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre abreviado *</Label>
                <Input
                  value={formData.nombre_abreviado}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre_abreviado: e.target.value }))}
                  placeholder="Ej: HITAL"
                />
              </div>
              <div>
                <Label>Nombre completo</Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Hospital Italiano"
                />
              </div>
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripción de la clínica"
                rows={2}
              />
            </div>

            {/* Especialidades */}
            <div>
              <Label className="mb-3 block">Especialidades</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
{ESPECIALIDADES_COMUNES.map((esp) => (
  <div key={`esp-container-${esp}`} className="flex items-center space-x-2">
    <Checkbox id={esp}
                      checked={formData.especialidades.includes(esp)}
                      onCheckedChange={() => toggleEspecialidad(esp)}
                    />
                    <Label htmlFor={esp}>{esp}</Label>
  </div>
))}
              </div>
            </div>
{/* PARTE 2: El Gestor de Cartilla (Jerárquico) */}
    {selectedClinica?.id && (
      <div className="mt-6">
        <CartillaManager 
          clinicaId={selectedClinica.id}
          onSelectionChange={handleCartillaChange} // 👈 Pasamos el "cable" 
        />
      </div>
    )}
      {/* Direcciones - Sección dentro del Modal */}
<div className="space-y-4 pt-4 border-t">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="p-2 bg-primary/10 rounded-lg">
        <MapPin className="w-4 h-4 text-primary" />
      </div>
      <div>
        <Label className="text-base font-bold">Sedes y Direcciones</Label>
        <p className="text-[11px] text-muted-foreground">Cargá una o más sedes de atención</p>
      </div>
    </div>
    <Button variant="outline" size="sm" onClick={handleAddDireccion} className="h-8 shadow-sm">
      <Plus className="w-3.5 h-3.5 mr-1" /> Agregar Sede
    </Button>
  </div>

<div className="space-y-4">
  {formData.direcciones.map((dir, idx) => (
  <div key={`direccion-${idx}`} className="relative border rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors shadow-sm mb-4">
    {/* Botón de eliminar sede */}
    {formData.direcciones.length > 1 && (
      <Button
        type="button" // Evita que el formulario se envíe solo
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 w-7 h-7 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-full"
        onClick={() => handleRemoveDireccion(idx)}
      >
        <X className="w-4 h-4" />
      </Button>
    )}

    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-white border text-slate-500 uppercase mb-3 shadow-sm">
      Sede #{idx + 1}
    </span>

    {/* Fila 1: Calle y Número */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
      <div className="md:col-span-3 space-y-1.5">
        <Label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Calle / Dirección</Label>
        <Input
          placeholder="Ej: Av. Rivadavia"
          value={dir.calle || ''}
          onChange={(e) => handleDireccionChange(idx, 'calle', e.target.value)}
          className="bg-white"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Altura</Label>
        <Input
          placeholder="1234"
          value={dir.numero || ''}
          onChange={(e) => handleDireccionChange(idx, 'numero', e.target.value)}
          className="bg-white"
        />
      </div>
    </div>

    {/* Fila 2: Barrio, Ciudad, Provincia */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Barrio / Localidad</Label>
        <Input
          placeholder="Palermo"
          value={dir.barrio || ''}
          onChange={(e) => handleDireccionChange(idx, 'barrio', e.target.value)}
          className="bg-white"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Ciudad / Región</Label>
        <Input
          placeholder="CABA"
          value={dir.ciudad || ''}
          onChange={(e) => handleDireccionChange(idx, 'ciudad', e.target.value)}
          className="bg-white"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Provincia</Label>
        <Input
          placeholder="Buenos Aires"
          value={dir.provincia || ''}
          onChange={(e) => handleDireccionChange(idx, 'provincia', e.target.value)}
          className="bg-white"
        />
      </div>
    </div>

    {/* Fila 3: Código Postal y Teléfono de la Sede */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Cod. Postal</Label>
        <Input
          placeholder="1425"
          value={dir.codigoPostal || ''}
          onChange={(e) => handleDireccionChange(idx, 'codigoPostal', e.target.value)}
          className="bg-white"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Teléfono Sede</Label>
        <Input
          placeholder="4801-0000"
          value={dir.telefono || ''}
          onChange={(e) => handleDireccionChange(idx, 'telefono', e.target.value)}
          className="bg-white"
        />
      </div>
    </div>
  </div>
))}
  </div>
</div>

          {/* Sección de Imágenes y Logo */}
<div className="space-y-4 pt-4 border-t">
  <Label className="text-base font-bold flex items-center gap-2">
    <ImageIcon className="w-4 h-4 text-primary" /> 
    Identidad Visual y Logo
  </Label>

  {/* Grid de imágenes cargadas */}
  <div className="grid grid-cols-3 gap-3">
    {formData.imagenes.map((img, idx) => (
      <div key={idx} className="relative group border-2 border-slate-100 rounded-xl p-2 bg-white hover:border-primary/30 transition-all shadow-sm">
        <img 
          src={img.url} 
          alt={img.nombre} 
          className="w-full h-20 object-contain"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Archivo+no+encontrado'; }}
        />
        <div className="mt-2">
          <p className="text-[10px] font-bold text-slate-600 truncate">{img.nombre}</p>
          <p className="text-[9px] text-slate-400 truncate italic">Ruta: {img.url}</p>
        </div>
        
        <Button
          size="icon"
          variant="destructive"
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          onClick={() => handleRemoveImage(idx)}
        >
          <X className="w-3 h-3" />
        </Button>
        
        {idx === 0 && (
          <Badge className="absolute top-1 left-1 text-[8px] bg-primary/90 backdrop-blur-sm border-none">
            LOGO PRINCIPAL
          </Badge>
        )}
      </div>
    ))}
  </div>

  {/* Input para vincular nuevo archivo local */}
  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
    <div className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-slate-700">Vincular archivo local</span>
      <span className="text-[11px] text-slate-500">
        Escribí el nombre del archivo que guardaste en <code className="bg-slate-200 px-1 rounded text-primary">/logos-clinicas/</code>
      </span>
    </div>

    <div className="flex gap-2">
      <div className="flex-1">
        <div className="relative">
          <Input
            placeholder="ejemplo: hospital-austral.png"
            value={newImage.nombre}
            onChange={(e) => {
              const fileName = e.target.value;
              setNewImage({
                ...newImage,
                nombre: fileName,
                url: `/assets/imagenes/logos-clinicas/${fileName}` // Construcción automática
              });
            }}
            className="bg-white pl-8"
          />
          <ImageIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
      </div>
      
      <Button 
        type="button" 
        onClick={handleAddImage}
        disabled={!newImage.nombre}
        className="bg-slate-800 hover:bg-slate-900 text-white shadow-md"
      >
        <Plus className="w-4 h-4 mr-2" />
        Vincular
      </Button>
    </div>
    </div>
    {newImage.nombre && (
      <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100 animate-in fade-in slide-in-from-top-1">
        <div className="w-8 h-8 rounded border bg-slate-50 flex items-center justify-center overflow-hidden">
           <img src={newImage.url} className="w-full h-full object-contain" />
        </div>
        <span className="text-[10px] text-slate-400 italic">Vista previa de la ruta: {newImage.url}</span>
      </div>
    )}
  </div>
</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar clínica?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la clínica "{selectedClinica?.nombre_abreviado}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
