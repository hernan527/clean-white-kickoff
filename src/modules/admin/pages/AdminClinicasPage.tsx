import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Upload, X, MapPin, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

  // Form state
  const [formData, setFormData] = useState({
    entity: '',
    nombre: '',
    descripcion: '',
    images: [] as ClinicaImage[],
    direcciones: [{ ...emptyDireccion }] as Direccion[],
    especialidades: [] as string[],
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
    c.entity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNew = () => {
    setSelectedClinica(null);
    setFormData({
      entity: '',
      nombre: '',
      descripcion: '',
      images: [],
      direcciones: [{ ...emptyDireccion }],
      especialidades: [],
    });
    setIsModalOpen(true);
  };

  const handleEdit = (clinica: Clinica) => {
    setSelectedClinica(clinica);
    setFormData({
      entity: clinica.entity || '',
      nombre: clinica.nombre || '',
      descripcion: clinica.descripcion || '',
      images: clinica.images || [],
      direcciones: clinica.direcciones?.length ? clinica.direcciones : [{ ...emptyDireccion }],
      especialidades: clinica.especialidades?.filter(e => e.activa).map(e => e.nombre) || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = (clinica: Clinica) => {
    setSelectedClinica(clinica);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedClinica) return;
    const result = await AdminService.deleteClinica(selectedClinica._id);
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
      images: [...prev.images, { ...newImage }],
    }));
    setNewImage({ url: '', nombre: '', descripcion: '' });
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAddDireccion = () => {
    setFormData(prev => ({
      ...prev,
      direcciones: [...prev.direcciones, { ...emptyDireccion }],
    }));
  };

  const handleRemoveDireccion = (index: number) => {
    if (formData.direcciones.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      direcciones: prev.direcciones.filter((_, i) => i !== index),
    }));
  };

  const handleDireccionChange = (index: number, field: keyof Direccion, value: string) => {
    setFormData(prev => ({
      ...prev,
      direcciones: prev.direcciones.map((dir, i) => 
        i === index ? { ...dir, [field]: value } : dir
      ),
    }));
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
    if (!formData.entity) {
      toast.error('El nombre abreviado (entity) es requerido');
      return;
    }

    setSaving(true);
    
    const payload = {
      ...formData,
      especialidades: formData.especialidades.map(nombre => ({ nombre, activa: true })),
    };

    let result;
    if (selectedClinica) {
      result = await AdminService.updateClinica(selectedClinica._id, payload);
    } else {
      result = await AdminService.createClinica(payload);
    }

    if (result) {
      toast.success(selectedClinica ? 'Clínica actualizada' : 'Clínica creada');
      fetchClinicas();
      setIsModalOpen(false);
    } else {
      toast.error('Error al guardar la clínica');
    }
    setSaving(false);
  };

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
                  <TableHead>Entity</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Direcciones</TableHead>
                  <TableHead>Especialidades</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClinicas.map((clinica) => (
                  <TableRow key={clinica._id}>
                    <TableCell>
                      {clinica.images?.[0]?.url ? (
                        <img 
                          src={clinica.images[0].url} 
                          alt={clinica.entity}
                          className="w-12 h-12 object-contain bg-white rounded border"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{clinica.entity}</TableCell>
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
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Entity (Nombre abreviado) *</Label>
                <Input
                  value={formData.entity}
                  onChange={(e) => setFormData(prev => ({ ...prev, entity: e.target.value }))}
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
                  <div key={esp} className="flex items-center space-x-2">
                    <Checkbox
                      id={esp}
                      checked={formData.especialidades.includes(esp)}
                      onCheckedChange={() => toggleEspecialidad(esp)}
                    />
                    <label htmlFor={esp} className="text-sm cursor-pointer">
                      {esp}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Direcciones */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Direcciones</Label>
                <Button variant="outline" size="sm" onClick={handleAddDireccion}>
                  <Plus className="w-4 h-4 mr-1" /> Agregar
                </Button>
              </div>
              <div className="space-y-3">
                {formData.direcciones.map((dir, idx) => (
                  <div key={idx} className="border rounded-lg p-3 bg-muted/30 relative">
                    {formData.direcciones.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-1 right-1 w-6 h-6"
                        onClick={() => handleRemoveDireccion(idx)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">Dirección {idx + 1}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Calle"
                        value={dir.calle}
                        onChange={(e) => handleDireccionChange(idx, 'calle', e.target.value)}
                      />
                      <Input
                        placeholder="Número"
                        value={dir.numero}
                        onChange={(e) => handleDireccionChange(idx, 'numero', e.target.value)}
                      />
                      <Input
                        placeholder="Barrio"
                        value={dir.barrio || ''}
                        onChange={(e) => handleDireccionChange(idx, 'barrio', e.target.value)}
                      />
                      <Input
                        placeholder="Ciudad"
                        value={dir.ciudad}
                        onChange={(e) => handleDireccionChange(idx, 'ciudad', e.target.value)}
                      />
                      <Input
                        placeholder="Provincia"
                        value={dir.provincia}
                        onChange={(e) => handleDireccionChange(idx, 'provincia', e.target.value)}
                      />
                      <Input
                        placeholder="Código Postal"
                        value={dir.codigoPostal || ''}
                        onChange={(e) => handleDireccionChange(idx, 'codigoPostal', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="space-y-3">
              <Label>Imágenes (la primera será el logo)</Label>
              
              <div className="grid grid-cols-3 gap-2">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative border rounded-lg p-2 bg-muted/50">
                    <img src={img.url} alt={img.nombre} className="w-full h-16 object-contain" />
                    <p className="text-xs text-muted-foreground truncate mt-1">{img.nombre || 'Sin nombre'}</p>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 w-6 h-6"
                      onClick={() => handleRemoveImage(idx)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 text-[10px] bg-primary text-primary-foreground px-1 rounded">
                        LOGO
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
                <p className="text-sm font-medium">Agregar imagen</p>
                <Input
                  placeholder="URL de la imagen"
                  value={newImage.url}
                  onChange={(e) => setNewImage(prev => ({ ...prev, url: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Nombre"
                    value={newImage.nombre}
                    onChange={(e) => setNewImage(prev => ({ ...prev, nombre: e.target.value }))}
                  />
                  <Input
                    placeholder="Descripción"
                    value={newImage.descripcion}
                    onChange={(e) => setNewImage(prev => ({ ...prev, descripcion: e.target.value }))}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={handleAddImage}>
                  <Upload className="w-4 h-4 mr-2" />
                  Agregar Imagen
                </Button>
              </div>
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
              Esta acción no se puede deshacer. Se eliminará permanentemente la clínica "{selectedClinica?.entity}".
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
