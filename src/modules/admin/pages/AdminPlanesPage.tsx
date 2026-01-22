import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import AdminService from '../services/admin.service';
import { Plan, PlanArchivo, Empresa } from '../types';

interface PlanImage {
  url: string;
  nombre?: string;
  descripcion?: string;
}

export const AdminPlanesPage = () => {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    empresaId: '',
    linea: '',
    descripcion: '',
    precio: 0,
    rating: 0,
    activo: true,
    images: [] as PlanImage[],
    archivos: [] as PlanArchivo[],
  });

  const [newImage, setNewImage] = useState({ url: '', nombre: '', descripcion: '' });
  const [newArchivo, setNewArchivo] = useState({ url: '', nombre: '', descripcion: '', tipo: 'pdf' as 'imagen' | 'pdf' | 'otro' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [planesData, empresasData] = await Promise.all([
      AdminService.getPlanes(),
      AdminService.getEmpresas(),
    ]);
    setPlanes((planesData || []) as Plan[]);
    setEmpresas((empresasData || []) as Empresa[]);
    setLoading(false);
  };

  const filteredPlanes = planes.filter(p => 
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.empresa?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNew = () => {
    setSelectedPlan(null);
    setFormData({
      nombre: '',
      empresa: '',
      empresaId: '',
      linea: '',
      descripcion: '',
      precio: 0,
      rating: 0,
      activo: true,
      images: [],
      archivos: [],
    });
    setIsModalOpen(true);
  };

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setFormData({
      nombre: plan.nombre || '',
      empresa: plan.empresa || '',
      empresaId: plan.empresaId || '',
      linea: plan.linea || '',
      descripcion: plan.descripcion || '',
      precio: plan.precio || 0,
      rating: plan.rating || 0,
      activo: plan.activo ?? true,
      images: plan.images || [],
      archivos: plan.archivos || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPlan) return;
    const result = await AdminService.deletePlan(selectedPlan._id);
    if (result) {
      toast.success('Plan eliminado correctamente');
      fetchData();
    } else {
      toast.error('Error al eliminar el plan');
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

  const handleAddArchivo = () => {
    if (!newArchivo.url || !newArchivo.nombre) {
      toast.error('URL y nombre son requeridos');
      return;
    }
    setFormData(prev => ({
      ...prev,
      archivos: [...prev.archivos, { ...newArchivo }],
    }));
    setNewArchivo({ url: '', nombre: '', descripcion: '', tipo: 'pdf' });
  };

  const handleRemoveArchivo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      archivos: prev.archivos.filter((_, i) => i !== index),
    }));
  };

  const handleEmpresaChange = (empresaId: string) => {
    const empresa = empresas.find(e => e._id === empresaId);
    setFormData(prev => ({
      ...prev,
      empresaId,
      empresa: empresa?.nombre || '',
    }));
  };

  const handleSave = async () => {
    if (!formData.nombre) {
      toast.error('El nombre es requerido');
      return;
    }

    setSaving(true);
    let result;

    if (selectedPlan) {
      result = await AdminService.updatePlan(selectedPlan._id, formData);
    } else {
      result = await AdminService.createPlan(formData);
    }

    if (result) {
      toast.success(selectedPlan ? 'Plan actualizado' : 'Plan creado');
      fetchData();
      setIsModalOpen(false);
    } else {
      toast.error('Error al guardar el plan');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Planes</h1>
          <p className="text-muted-foreground">Gestión de planes de salud</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Plan
        </Button>
      </div>

      {/* Search */}
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar plan o empresa..."
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
          <CardTitle>Lista de Planes ({filteredPlanes.length})</CardTitle>
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
                  <TableHead>Nombre</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Línea</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Archivos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlanes.map((plan) => (
                  <TableRow key={plan._id}>
                    <TableCell>
                      {plan.images?.[0]?.url ? (
                        <img 
                          src={plan.images[0].url} 
                          alt={plan.nombre}
                          className="w-12 h-12 object-contain bg-white rounded border"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{plan.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">{plan.empresa}</TableCell>
                    <TableCell>{plan.linea || '-'}</TableCell>
                    <TableCell>${plan.precio?.toLocaleString() || 0}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {plan.images?.length ? (
                          <Badge variant="secondary" className="text-xs">
                            {plan.images.length} img
                          </Badge>
                        ) : null}
                        {plan.archivos?.length ? (
                          <Badge variant="outline" className="text-xs">
                            {plan.archivos.length} docs
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={plan.activo ? "default" : "secondary"}>
                        {plan.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(plan)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(plan)}>
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
              {selectedPlan ? 'Editar Plan' : 'Nuevo Plan'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre *</Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Nombre del plan"
                />
              </div>
              <div>
                <Label>Empresa</Label>
                <Select value={formData.empresaId} onValueChange={handleEmpresaChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((emp) => (
                      <SelectItem key={emp._id} value={emp._id}>
                        {emp.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Línea</Label>
                <Input
                  value={formData.linea}
                  onChange={(e) => setFormData(prev => ({ ...prev, linea: e.target.value }))}
                  placeholder="Línea de cobertura"
                />
              </div>
              <div>
                <Label>Precio</Label>
                <Input
                  type="number"
                  value={formData.precio}
                  onChange={(e) => setFormData(prev => ({ ...prev, precio: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Rating</Label>
                <Input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={formData.rating}
                  onChange={(e) => setFormData(prev => ({ ...prev, rating: Number(e.target.value) }))}
                  placeholder="0-5"
                />
              </div>
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripción del plan"
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, activo: checked }))}
              />
              <Label htmlFor="activo">Plan activo</Label>
            </div>

            {/* Images */}
            <div className="space-y-3">
              <Label>Imágenes</Label>
              
              <div className="grid grid-cols-4 gap-2">
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

            {/* Archivos */}
            <div className="space-y-3">
              <Label>Archivos (PDF, documentos)</Label>
              
              <div className="space-y-2">
                {formData.archivos.map((archivo, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 border rounded bg-muted/50">
                    <FileText className="w-5 h-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{archivo.nombre}</p>
                      <p className="text-xs text-muted-foreground truncate">{archivo.descripcion}</p>
                    </div>
                    <Badge variant="outline">{archivo.tipo}</Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-6 h-6"
                      onClick={() => handleRemoveArchivo(idx)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
                <p className="text-sm font-medium">Agregar archivo</p>
                <Input
                  placeholder="URL del archivo"
                  value={newArchivo.url}
                  onChange={(e) => setNewArchivo(prev => ({ ...prev, url: e.target.value }))}
                />
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Nombre *"
                    value={newArchivo.nombre}
                    onChange={(e) => setNewArchivo(prev => ({ ...prev, nombre: e.target.value }))}
                  />
                  <Input
                    placeholder="Descripción"
                    value={newArchivo.descripcion}
                    onChange={(e) => setNewArchivo(prev => ({ ...prev, descripcion: e.target.value }))}
                  />
                  <Select 
                    value={newArchivo.tipo} 
                    onValueChange={(v) => setNewArchivo(prev => ({ ...prev, tipo: v as 'pdf' | 'imagen' | 'otro' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="imagen">Imagen</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm" onClick={handleAddArchivo}>
                  <Upload className="w-4 h-4 mr-2" />
                  Agregar Archivo
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
            <AlertDialogTitle>¿Eliminar plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el plan "{selectedPlan?.nombre}".
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
