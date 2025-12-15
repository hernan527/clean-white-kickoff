import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Empresa } from '../types';

interface EmpresaImage {
  url: string;
  nombre?: string;
  descripcion?: string;
}

export const AdminEmpresasPage = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    images: [] as EmpresaImage[],
  });

  const [newImage, setNewImage] = useState({ url: '', nombre: '', descripcion: '' });

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    setLoading(true);
    const data = await AdminService.getEmpresas();
    setEmpresas((data || []) as Empresa[]);
    setLoading(false);
  };

  const filteredEmpresas = empresas.filter(e => 
    e.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNew = () => {
    setSelectedEmpresa(null);
    setFormData({ nombre: '', descripcion: '', images: [] });
    setIsModalOpen(true);
  };

  const handleEdit = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setFormData({
      nombre: empresa.nombre || '',
      descripcion: empresa.descripcion || '',
      images: empresa.images || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEmpresa) return;
    const result = await AdminService.deleteEmpresa(selectedEmpresa._id);
    if (result) {
      toast.success('Empresa eliminada correctamente');
      fetchEmpresas();
    } else {
      toast.error('Error al eliminar la empresa');
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

  const handleSave = async () => {
    if (!formData.nombre) {
      toast.error('El nombre es requerido');
      return;
    }

    setSaving(true);
    let result;

    if (selectedEmpresa) {
      result = await AdminService.updateEmpresa(selectedEmpresa._id, formData);
    } else {
      result = await AdminService.createEmpresa(formData);
    }

    if (result) {
      toast.success(selectedEmpresa ? 'Empresa actualizada' : 'Empresa creada');
      fetchEmpresas();
      setIsModalOpen(false);
    } else {
      toast.error('Error al guardar la empresa');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Empresas</h1>
          <p className="text-muted-foreground">Gestión de empresas de salud</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Empresa
        </Button>
      </div>

      {/* Search */}
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar empresa..."
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
          <CardTitle>Lista de Empresas ({filteredEmpresas.length})</CardTitle>
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
                  <TableHead>Descripción</TableHead>
                  <TableHead>Imágenes</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmpresas.map((empresa) => (
                  <TableRow key={empresa._id}>
                    <TableCell>
                      {empresa.images?.[0]?.url ? (
                        <img 
                          src={empresa.images[0].url} 
                          alt={empresa.nombre}
                          className="w-12 h-12 object-contain bg-white rounded border"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{empresa.nombre}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {empresa.descripcion || '-'}
                    </TableCell>
                    <TableCell>{empresa.images?.length || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(empresa)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(empresa)}>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEmpresa ? 'Editar Empresa' : 'Nueva Empresa'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nombre *</Label>
              <Input
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Nombre de la empresa"
              />
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripción de la empresa"
                rows={3}
              />
            </div>

            {/* Images section */}
            <div className="space-y-3">
              <Label>Imágenes (la primera será el logo)</Label>
              
              {/* Existing images */}
              <div className="grid grid-cols-2 gap-2">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative border rounded-lg p-2 bg-muted/50">
                    <img src={img.url} alt={img.nombre} className="w-full h-20 object-contain" />
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

              {/* Add new image */}
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
            <AlertDialogTitle>¿Eliminar empresa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la empresa "{selectedEmpresa?.nombre}".
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
