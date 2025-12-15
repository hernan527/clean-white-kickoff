import { useEffect, useState } from 'react';
import { 
  Search, 
  Monitor, 
  Smartphone, 
  Tablet,
  Globe,
  Clock,
  MousePointer,
  Eye,
  FileText,
  LogIn,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import AdminService from '../services/admin.service';
import { UserActivity } from '../types';

const eventTypeConfig: Record<string, { label: string; icon: typeof Eye; color: string }> = {
  page_view: { label: 'Vista de página', icon: Eye, color: 'text-blue-500' },
  quote_created: { label: 'Cotización creada', icon: FileText, color: 'text-green-500' },
  plan_viewed: { label: 'Plan visto', icon: Eye, color: 'text-purple-500' },
  login: { label: 'Inicio de sesión', icon: LogIn, color: 'text-cyan-500' },
  logout: { label: 'Cierre de sesión', icon: LogIn, color: 'text-orange-500' },
};

const deviceIcons = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
};

export const AdminActividadPage = () => {
  const [activity, setActivity] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState<string>('all');

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    setLoading(true);
    const data = await AdminService.getUserActivity(100, 0);
    setActivity(data);
    setLoading(false);
  };

  const filteredActivity = activity.filter(a => {
    const matchesSearch = 
      a.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.page_url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.ip_address?.includes(searchTerm);
    
    const matchesEvent = eventFilter === 'all' || a.event_type === eventFilter;
    
    return matchesSearch && matchesEvent;
  });

  const getEventDisplay = (eventType: string) => {
    const config = eventTypeConfig[eventType] || { label: eventType, icon: Eye, color: 'text-gray-500' };
    const Icon = config.icon;
    return (
      <div className={`flex items-center gap-2 ${config.color}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm">{config.label}</span>
      </div>
    );
  };

  const getDeviceIcon = (deviceType: string | null) => {
    const Icon = deviceIcons[deviceType as keyof typeof deviceIcons] || Monitor;
    return <Icon className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Actividad</h1>
          <p className="text-muted-foreground">Registro de actividad de usuarios</p>
        </div>
        <Button variant="outline" onClick={fetchActivity}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {activity.filter(a => a.event_type === 'page_view').length}
                </p>
                <p className="text-sm text-muted-foreground">Vistas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <FileText className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {activity.filter(a => a.event_type === 'quote_created').length}
                </p>
                <p className="text-sm text-muted-foreground">Cotizaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Globe className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(activity.map(a => a.ip_address).filter(Boolean)).size}
                </p>
                <p className="text-sm text-muted-foreground">IPs únicas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(activity.reduce((sum, a) => sum + (a.time_on_page || 0), 0) / Math.max(activity.length, 1))}s
                </p>
                <p className="text-sm text-muted-foreground">Tiempo promedio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email, URL o IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los eventos</SelectItem>
                <SelectItem value="page_view">Vistas de página</SelectItem>
                <SelectItem value="quote_created">Cotizaciones</SelectItem>
                <SelectItem value="plan_viewed">Planes vistos</SelectItem>
                <SelectItem value="login">Inicios de sesión</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Registro de Actividad ({filteredActivity.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : filteredActivity.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No hay actividad registrada aún
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha/Hora</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Página</TableHead>
                  <TableHead>Dispositivo</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Tiempo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivity.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-sm">
                      {format(new Date(item.created_at), 'dd/MM HH:mm:ss', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm truncate max-w-32 block">
                        {item.user_email}
                      </span>
                    </TableCell>
                    <TableCell>{getEventDisplay(item.event_type)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground truncate max-w-40 block">
                        {item.page_url || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(item.device_type)}
                        <span className="text-xs text-muted-foreground">
                          {item.browser || '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.city || item.country ? (
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs">
                            {[item.city, item.country].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-mono">
                        {item.ip_address || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.time_on_page ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs">{item.time_on_page}s</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
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
