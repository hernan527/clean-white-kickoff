import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, UserPlus, Pencil, Trash2, MoreHorizontal, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import CompanyService from '../services/company.service';
import type { Company, CompanyMember, CreateCompanyMemberInput } from '../types/company';

export const AdminCompanyMembersPage = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  
  const [company, setCompany] = useState<Company | null>(null);
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CompanyMember | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<{
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'vendor';
  }>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'vendor',
  });

  useEffect(() => {
    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  const fetchData = async () => {
    if (!companyId) return;
    
    setLoading(true);
    const [companyData, membersData] = await Promise.all([
      CompanyService.getCompanyById(companyId),
      CompanyService.getCompanyMembers(companyId),
    ]);
    
    setCompany(companyData);
    setMembers(membersData);
    setLoading(false);
  };

  const handleNew = () => {
    setSelectedMember(null);
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role: 'vendor',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (member: CompanyMember) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedMember) return;
    
    const { success, error } = await CompanyService.deleteCompanyMember(selectedMember.id);
    
    if (success) {
      toast.success('Miembro eliminado correctamente');
      fetchData();
    } else {
      toast.error(`Error al eliminar: ${error}`);
    }
    
    setIsDeleteDialogOpen(false);
    setSelectedMember(null);
  };

  const handleSave = async () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error('Email y contraseña son requeridos');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setSaving(true);

    const input: CreateCompanyMemberInput = {
      company_id: companyId!,
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name,
      role: formData.role,
    };

    const { member, error } = await CompanyService.createCompanyMember(input);
    
    if (member) {
      toast.success('Miembro creado correctamente');
      fetchData();
      setIsModalOpen(false);
    } else {
      toast.error(`Error al crear miembro: ${error}`);
    }

    setSaving(false);
  };

  const handleRoleChange = async (member: CompanyMember, newRole: 'admin' | 'vendor') => {
    const { success, error } = await CompanyService.updateCompanyMember(member.id, { role: newRole });
    
    if (success) {
      toast.success('Rol actualizado');
      fetchData();
    } else {
      toast.error(`Error: ${error}`);
    }
  };

  const handleToggleActive = async (member: CompanyMember) => {
    const { success, error } = await CompanyService.updateCompanyMember(member.id, { 
      is_active: !member.is_active 
    });
    
    if (success) {
      toast.success(member.is_active ? 'Miembro desactivado' : 'Miembro activado');
      fetchData();
    } else {
      toast.error(`Error: ${error}`);
    }
  };

  const getInitials = (member: CompanyMember) => {
    const first = member.user_first_name?.charAt(0) || '';
    const last = member.user_last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  const getMemberName = (member: CompanyMember) => {
    if (member.user_first_name || member.user_last_name) {
      return `${member.user_first_name || ''} ${member.user_last_name || ''}`.trim();
    }
    return 'Usuario';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Empresa no encontrada</p>
        <Button variant="outline" onClick={() => navigate('/admin/empresas')}>
          Volver a empresas
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/empresas')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            {company.logo_url ? (
              <img 
                src={company.logo_url} 
                alt={company.name}
                className="h-12 w-12 rounded-lg object-contain bg-white p-1"
              />
            ) : (
              <div 
                className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: company.primary_color }}
              >
                {company.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground">{company.name}</h1>
              <p className="text-muted-foreground">Gestión de miembros</p>
            </div>
          </div>
        </div>
        <Button onClick={handleNew} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Agregar Miembro
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Miembros</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{members.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Administradores</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{members.filter(m => m.role === 'admin').length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vendedores</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{members.filter(m => m.role === 'vendor').length}</span>
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Miembro</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="hidden sm:table-cell">Fecha alta</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No hay miembros en esta empresa
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.user_avatar_url || undefined} />
                          <AvatarFallback>{getInitials(member)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{getMemberName(member)}</p>
                          <p className="text-sm text-muted-foreground">{member.user_email || 'Sin email'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={member.role}
                        onValueChange={(value: 'admin' | 'vendor') => handleRoleChange(member, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Admin
                            </div>
                          </SelectItem>
                          <SelectItem value="vendor">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Vendedor
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {new Date(member.created_at).toLocaleDateString('es-AR')}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={member.is_active ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => handleToggleActive(member)}
                      >
                        {member.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleDelete(member)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Member Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Miembro</DialogTitle>
            <DialogDescription>
              Crea una cuenta de usuario para el nuevo miembro de {company.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nombre</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Apellido</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Pérez"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="vendedor@empresa.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'admin' | 'vendor') => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendor">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Vendedor
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Administrador de empresa
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Creando...' : 'Crear miembro'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar miembro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará al miembro de la empresa. 
              El usuario seguirá existiendo pero perderá acceso a esta empresa.
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
