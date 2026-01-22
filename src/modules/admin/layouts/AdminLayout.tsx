import { ReactNode } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { 
  LayoutDashboard, 
  Building2, 
  Stethoscope, 
  FileText, 
  Users, 
  Activity,
  LogOut,
  Shield,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/companies', label: 'Empresas SaaS', icon: Building2 },
  { path: '/admin/empresas', label: 'Proveedores', icon: Building2 },
  { path: '/admin/clinicas', label: 'Clínicas', icon: Stethoscope },
  { path: '/admin/planes', label: 'Planes', icon: FileText },
  { path: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { path: '/admin/actividad', label: 'Actividad', icon: Activity },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, isAdmin, isLoading, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Acceso Denegado</h1>
          <p className="text-muted-foreground">No tienes permisos de administrador</p>
          <Button onClick={() => navigate('/')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Mejor Plan</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.email}
              </p>
              <p className="text-xs text-muted-foreground">Administrador</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => {
              signOut();
              navigate('/');
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
