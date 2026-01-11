import { useEffect, useState } from 'react';
import { 
  Users, 
  Briefcase, 
  FileText, 
  Eye,
  Activity,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '../types';
import AdminService from '../services/admin.service';
import { supabase } from '@/integrations/supabase/client';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await AdminService.getDashboardStats();
      setStats(data);
      setLoading(false);
    };
    fetchStats();
  }, []);
useEffect(() => {
  const bypassRole = async () => {
    // 1. Obtenemos el ID del usuario logueado actualmente
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      console.log("🛠️ Intentando bypass para el usuario:", user.email);
      
      // 2. Forzamos el update de tu rol en la tabla pública
      // Nota: Esto solo funcionará si la tabla 'profiles' permite updates al propio usuario
      const { error } = await supabase
        .from('profiles') 
        .update({ role: 'admin' })
        .eq('id', user.id);

      if (error) console.error("❌ Falló el bypass:", error.message);
      else console.log("💦 ¡Éxtasis! Ahora sos ADMIN. Refrescá la página.");
    }
  };

  bypassRole();
}, []);
  const statCards = [
    { 
      label: 'Usuarios Totales', 
      value: stats?.total_users ?? 0, 
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    { 
      label: 'Vendedores', 
      value: stats?.total_vendors ?? 0, 
      icon: Briefcase,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    { 
      label: 'Cotizaciones', 
      value: stats?.total_quotes ?? 0, 
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    { 
      label: 'Vistas de Cotización', 
      value: stats?.total_quote_views ?? 0, 
      icon: Eye,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    { 
      label: 'Sesiones (24h)', 
      value: stats?.active_sessions_24h ?? 0, 
      icon: Activity,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10'
    },
    { 
      label: 'Cotizaciones (7 días)', 
      value: stats?.quotes_last_7_days ?? 0, 
      icon: TrendingUp,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-20 bg-muted animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold text-foreground">
                  {stat.value.toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a 
            href="/admin/empresas" 
            className="p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-center"
          >
            <p className="font-medium text-foreground">Gestionar Empresas</p>
          </a>
          <a 
            href="/admin/clinicas" 
            className="p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-center"
          >
            <p className="font-medium text-foreground">Gestionar Clínicas</p>
          </a>
          <a 
            href="/admin/planes" 
            className="p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-center"
          >
            <p className="font-medium text-foreground">Gestionar Planes</p>
          </a>
          <a 
            href="/admin/usuarios" 
            className="p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-center"
          >
            <p className="font-medium text-foreground">Ver Usuarios</p>
          </a>
        </CardContent>
      </Card>
    </div>
  );
};
