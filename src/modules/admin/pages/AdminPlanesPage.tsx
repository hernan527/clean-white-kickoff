/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Upload, X, FileText, Image as ImageIcon, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
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
import { Plan, Empresa } from '../types';
import { cn } from '@/lib/utils';

export const AdminPlanesPage = () => {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [prestacionesMaestras, setPrestacionesMaestras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    empresaId: '',
    linea: '',
    descripcion: '',
    precio: 0,
    activo: true,
    prestaciones: [] as any[]
  });
// Dentro del componente AdminPlanesPage, antes del map de prestacionesMaestras
const [newPresta, setNewPresta] = useState({ nombre: '', emoji: '✨' });

const handleQuickAdd = async () => {
  if (!newPresta.nombre) return;
  try {
    const created = await AdminService.createPrestacionMaestra(newPresta); // Crea este método en tu service
    setPrestacionesMaestras(prev => [...prev, created]);
    setNewPresta({ nombre: '', emoji: '✨' });
    toast.success("Prestación creada y disponible");
  } catch (e) {
    toast.error("Error al crear");
  }
};
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [planesData, empresasData, prestacionesData] = await Promise.all([
        AdminService.getPlanes(),
        AdminService.getEmpresas(),
        AdminService.getPrestacionesMaestras()
      ]);

      const planesNormalizados = (planesData || []).map((p: any) => ({
        ...p,
        id: (p.id || p._id || p.plan_id)?.toString(),
        nombre: p.nombre_plan || p.nombre || 'Sin nombre',
        empresa: p.empresas?.nombre || p.empresa || 'S/D',
        empresaId: p.empresa_id || p.empresaId,
        precio: p.precio || 0,
        activo: p.listar ?? p.activo ?? true,
        plan_prestacion: p.plan_prestacion || []
      }));

      setPlanes(planesNormalizados);
      setEmpresas(empresasData || []);
      setPrestacionesMaestras(prestacionesData|| []);
    } catch (error) {
      console.error("Error en el fetch:", error);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };
const handleEdit = (plan: any) => {
  setSelectedPlan(plan);

  // Mapeo defensivo para encontrar el ID donde sea que esté
  const prestacionesCargadas = (plan.plan_prestacion || []).map((pp: any) => {
    // Buscamos el ID en:
    // 1. pp.prestacion_id (directo)
    // 2. pp.id (si la tabla intermedia usa id)
    // 3. pp.prestaciones_maestras?.id (si vino anidado por el join)
    const idReal = pp.prestacion_id || pp.id || pp.prestaciones_maestras?.id;

    console.log("ID detectado para prestacion:", idReal); // Esto te confirmará en consola

    return {
      prestacion_id: idReal, 
      valor: pp.valor || '',
      listar: pp.listar ?? true
    };
  }).filter(p => p.prestacion_id != null); // Si aun así es null, lo sacamos para que no rompa el PUT

  setFormData({
    ...formData,
    nombre: plan.nombre_plan || plan.nombre || '',
    precio: plan.precio || 0,
    empresaId: plan.empresa_id?.toString() || '',
    prestaciones: prestacionesCargadas 
  });
  
  setIsModalOpen(true);
};

 const togglePrestacion = (pId: number) => {
  setFormData(prev => {
    // Buscamos si ya existe usando el nombre de la columna de la DB
    const exists = prev.prestaciones.find(i => i.prestacion_id === pId);

    if (exists) {
      // Si existe, lo removemos
      return { 
        ...prev, 
        prestaciones: prev.prestaciones.filter(i => i.prestacion_id !== pId) 
      };
    } else {
      // Si no existe, lo agregamos asegurando que la KEY sea 'prestacion_id'
      return { 
        ...prev, 
        prestaciones: [
          ...prev.prestaciones, 
          { prestacion_id: pId, valor: '', listar: true }
        ] 
      };
    }
  });
};

const updatePrestacionDetail = (pId: number, field: string, value: any) => {
  setFormData(prev => ({
    ...prev,
    prestaciones: prev.prestaciones.map(i => 
      i.prestacion_id === pId ? { ...i, [field]: value } : i
    )
  }));
};
const handleSave = async () => {
  if (!formData.nombre) {
    toast.error('El nombre es requerido');
    return;
  }

  
  setSaving(true);
  try {
    // Limpiamos el payload para que no haya strings vacíos en campos numéricos
    const payload = {
      nombre_plan: formData.nombre,
      // Si empresaId es vacio, mandamos null, no ""
      empresa_id: formData.empresaId ? Number(formData.empresaId) : null,
      linea: formData.linea || '',
      descripcion: formData.descripcion || '',
      precio: formData.precio ? Number(formData.precio) : 0,
      listar: formData.activo,
    };

    // Filtramos prestaciones para que NO viajen objetos con ID null o undefined
    const prestacionesLimpias = formData.prestaciones.filter(p => p.prestacion_id != null);

    if (selectedPlan?.id) {
      // 1. Guardar datos básicos
      await AdminService.updatePlan(selectedPlan.id, payload);
      // 2. Guardar prestaciones filtradas
      await AdminService.updatePrestacionesPlan(selectedPlan.id, prestacionesLimpias);
      toast.success('Cambios guardados');
    }

    await fetchData(); // Refrescar lista
    setIsModalOpen(false);
  } catch (error) {
    console.error(error);
    toast.error("Error al guardar");
  } finally {
    setSaving(false);
  }
};

  const filteredPlanes = planes.filter(p => 
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof p.empresa === 'string' && p.empresa.toLowerCase().includes(searchTerm.toLowerCase()))
  );

 return (
  <div className="space-y-6">
    {/* 1. CABECERA Y BUSCADOR (Igual que antes) */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Planes y Folletos</h1>
        <p className="text-muted-foreground">Gestioná SanCor, Omint y Premedic</p>
      </div>
      <Button onClick={() => { setSelectedPlan(null); setFormData({ nombre: '', empresaId: '', linea: '', descripcion: '', precio: 0, activo: true, prestaciones: [] }); setIsModalOpen(true); }}>
        <Plus className="w-4 h-4 mr-2" /> Nuevo Plan
      </Button>
    </div>

    <Card>
  <CardContent className="p-0">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Plan</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Precio</TableHead>
          <TableHead>Beneficios</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredPlanes.map((plan) => (
          <TableRow key={plan.id}>
            <TableCell className="font-bold">{plan.nombre}</TableCell>
            <TableCell>{plan.empresa}</TableCell>
            <TableCell className="font-mono text-blue-600 font-bold">
              ${plan.precio?.toLocaleString('es-AR')}
            </TableCell>
            <TableCell>
              <div className="flex gap-1 flex-wrap">
                {(plan.plan_prestacion || []).filter((pr: any) => pr.listar).map((pr: any, i: number) => (
                  <Badge key={i} variant="secondary" className="text-[9px]">
                    {pr.prestaciones_maestras?.icono_emoji} {pr.prestaciones_maestras?.nombre}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Button size="sm" variant="ghost" onClick={() => handleEdit(plan)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { setSelectedPlan(plan); setIsDeleteDialogOpen(true); }}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))} {/* <--- Aquí cierra el map de la tabla */}
      </TableBody>
    </Table>
  </CardContent>
</Card>

<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto"
  // 🔥 Esto evita que Radix se pelee con el foco al abrir
  onOpenAutoFocus={(e) => e.preventDefault()}>
    <DialogHeader>
      <DialogTitle>{selectedPlan ? 'Editar Plan' : 'Nuevo Plan'}</DialogTitle>
      <DialogDescription>
        Configure los beneficios y detalles del plan seleccionado.
      </DialogDescription>
    </DialogHeader>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* COLUMNA IZQUIERDA: DATOS BÁSICOS */}
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label>Nombre del Plan</Label>
          <Input value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
        </div>
        {/* ... (resto de inputs de empresa, precio, linea) ... */}
      </div>

      {/* COLUMNA DERECHA: BENEFICIOS + AGREGADO RÁPIDO */}
      <div className="space-y-4 border-l pl-6">
        <h4 className="font-bold text-sm uppercase text-primary">Folleto Digital</h4>
        
        {/* 🚀 EL BLOQUE DE AGREGADO RÁPIDO (BIEN UBICADO) */}
        <div className="flex gap-2 p-2 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200 mb-4">
          <Input 
            placeholder="Nuevo beneficio..." 
            className="h-9 text-xs bg-white"
            value={newPresta.nombre}
            onChange={(e) => setNewPresta({ ...newPresta, nombre: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
          />
          <Input 
            className="w-12 h-9 text-center bg-white px-0" 
            value={newPresta.emoji}
            onChange={(e) => setNewPresta({ ...newPresta, emoji: e.target.value })}
          />
          <Button type="button" size="sm" onClick={handleQuickAdd} className="h-9 w-9 p-0 shrink-0">
            <Plus size={16} />
          </Button>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {prestacionesMaestras?.map((p) => {
            const isSelected = formData.prestaciones.find(i => Number(i.prestacion_id) === Number(p.id));
            return (
              <div key={p.id} className={cn(
                "p-3 border rounded-xl transition-all",
                isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-slate-100 opacity-60"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={!!isSelected} onCheckedChange={() => togglePrestacion(Number(p.id))} />
                    <span className="text-xs font-bold">{p.icono_emoji} {p.nombre}</span>
                  </div>
                </div>
              </div>
            );
          })} {/* <--- Cierra el map de prestacionesMaestras */}
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
      <Button onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

    {/* 3. MODAL DE EDICIÓN/CREACIÓN */}
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedPlan ? 'Editar Plan' : 'Nuevo Plan'}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Nombre del Plan</Label>
                <Input value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Empresa</Label>
                <Select value={formData.empresaId} onValueChange={val => setFormData({...formData, empresaId: val})}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar empresa" /></SelectTrigger>
                  <SelectContent>
                    {empresas.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                   <Label>Precio</Label>
                   <Input type="number" value={formData.precio} onChange={e => setFormData({...formData, precio: Number(e.target.value)})} />
                </div>
                <div>
                   <Label>Línea</Label>
                   <Input value={formData.linea} onChange={e => setFormData({...formData, linea: e.target.value})} />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Switch checked={formData.activo} onCheckedChange={val => setFormData({...formData, activo: val})} />
                <Label>Plan Activo (Listar)</Label>
              </div>
            </div>


          <div className="space-y-4 border-l pl-6">
            <h4 className="font-bold text-sm uppercase text-primary">Folleto Digital</h4>
            
            {/* 🚀 EL BLOQUE DE AGREGADO RÁPIDO VA AQUÍ (DENTRO DEL MODAL) */}
            <div className="flex gap-2 p-2 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200 mb-4">
              <Input 
                placeholder="Nuevo beneficio..." 
                className="h-9 text-xs bg-white"
                value={newPresta.nombre}
                onChange={(e) => setNewPresta({ ...newPresta, nombre: e.target.value })}
              />
              <Input 
                className="w-12 h-9 text-center bg-white" 
                value={newPresta.emoji}
                onChange={(e) => setNewPresta({ ...newPresta, emoji: e.target.value })}
              />
              <Button type="button" size="sm" onClick={handleQuickAdd} className="h-9 shrink-0">
                <Plus size={16} />
              </Button>
            </div>

            {/* LISTA DE SELECCIÓN */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {prestacionesMaestras.map((p) => {
                const isSelected = formData.prestaciones.find(i => i.prestacion_id === p.id);
                return (
                  <div key={p.id} className={cn(
                    "p-3 border rounded-xl transition-all",
                    isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-slate-100 opacity-60"
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox checked={!!isSelected} onCheckedChange={() => togglePrestacion(p.id)} />
                        <span className="text-xs font-bold">{p.icono_emoji} {p.nombre}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
);}