import { useEffect, useState } from 'react';
import { Search, UserCog, Shield, Briefcase, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import AdminService from '../services/admin.service';
import { AdminUser } from '../types';

const roleConfig = {
  admin: { label: 'Admin', icon: Shield, color: 'bg-red-500' },
  vendor: { label: 'Vendedor', icon: Briefcase, color: 'bg-blue-500' },
  user: { label: 'Usuario', icon: User, color: 'bg-gray-500' },
};

export const AdminUsuariosPage = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await AdminService.getAdminUsersList();
    setUsers(data);
    setLoading(false);
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleChange = async (userId: string, newRole: 'user' | 'vendor' | 'admin') => {
    setUpdating(userId);
    const success = await AdminService.updateUserRole(userId, newRole);
    if (success) {
      toast.success('Rol actualizado correctamente');
      fetchUsers();
    } else {
      toast.error('Error al actualizar el rol');
    }
    setUpdating(null);
  };

  const getRoleDisplay = (role: string) => {
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
    const Icon = config.icon;
    return (
      <Badge variant="secondary" className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Usuarios</h1>
        <p className="text-muted-foreground">Gestión de usuarios registrados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-500/10">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'user').length}</p>
                <p className="text-sm text-muted-foreground">Usuarios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Briefcase className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'vendor').length}</p>
                <p className="text-sm text-muted-foreground">Vendedores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Shield className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por email o nombre..."
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
          <CardTitle>Lista de Usuarios ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Registrado</TableHead>
                  <TableHead>Último acceso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.first_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {user.first_name || user.last_name 
                              ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                              : 'Sin nombre'}
                          </p>
                          {user.phone && (
                            <p className="text-xs text-muted-foreground">{user.phone}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>{getRoleDisplay(user.role)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {user.created_at 
                        ? format(new Date(user.created_at), 'dd MMM yyyy', { locale: es })
                        : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {user.last_sign_in 
                        ? format(new Date(user.last_sign_in), 'dd MMM yyyy HH:mm', { locale: es })
                        : 'Nunca'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            disabled={updating === user.id}
                          >
                            <UserCog className="w-4 h-4 mr-1" />
                            {updating === user.id ? 'Actualizando...' : 'Cambiar rol'}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleRoleChange(user.id, 'user')}
                            disabled={user.role === 'user'}
                          >
                            <User className="w-4 h-4 mr-2" />
                            Usuario
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRoleChange(user.id, 'vendor')}
                            disabled={user.role === 'vendor'}
                          >
                            <Briefcase className="w-4 h-4 mr-2" />
                            Vendedor
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRoleChange(user.id, 'admin')}
                            disabled={user.role === 'admin'}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Admin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
