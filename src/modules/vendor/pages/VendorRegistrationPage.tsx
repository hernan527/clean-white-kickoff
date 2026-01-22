import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2, Phone, MessageCircle } from 'lucide-react';
import AuthService from '@/services/auth.service';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/layouts/Layout';

export const VendorRegistrationPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Account data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Vendor profile data
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'La contraseña debe tener al menos 6 caracteres',
        variant: 'destructive',
      });
      return;
    }

    // Input validation
    if (businessName && businessName.length > 100) {
      toast({
        title: 'Error',
        description: 'El nombre comercial no puede exceder 100 caracteres',
        variant: 'destructive',
      });
      return;
    }

    if (phone && phone.length > 20) {
      toast({
        title: 'Error',
        description: 'El número de teléfono no puede exceder 20 caracteres',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { user, error } = await AuthService.signUp({
        email,
        password,
        firstName,
        lastName,
      });

      if (error) {
        toast({
          title: 'Error al registrarse',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      if (user) {
        // Call secure edge function to register vendor (handles role + profile server-side)
 // 1. Obtenemos la sesión actual para sacar el token
const { data: { session } } = await supabase.auth.getSession();

// 2. Llamamos a la función PASANDO el token en los headers
const { data, error: vendorError } = await supabase.functions.invoke('register-vendor', {
  body: {
    business_name: businessName || `${firstName} ${lastName}`,
    phone: phone.trim(),
    whatsapp: (whatsapp || phone).trim(),
  },
  // ESTO ES LO QUE FALTA:
  headers: {
    Authorization: `Bearer ${session?.access_token}`,
  },
});

        if (vendorError) {
          console.error('Error registering vendor:', vendorError);
          toast({
            title: 'Error',
            description: 'Error al crear perfil de vendedor. Por favor contacte soporte.',
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: '¡Registro exitoso!',
          description: 'Tu cuenta de vendedor ha sido creada',
        });

        navigate('/vendedor/dashboard');
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Registro de Vendedor</CardTitle>
            <CardDescription>
              Crea tu cuenta para acceder al panel de vendedores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              {/* Account Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    maxLength={50}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    maxLength={50}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>

              {/* Vendor Profile Fields */}
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-4">Datos Comerciales</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Nombre Comercial (opcional)</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="businessName"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="pl-10"
                        placeholder="Tu nombre o empresa"
                        maxLength={100}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10"
                        placeholder="+54 11 1234-5678"
                        maxLength={20}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
                    <div className="relative">
                      <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="whatsapp"
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="pl-10"
                        placeholder="Mismo que teléfono si no especificas"
                        maxLength={20}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  'Crear Cuenta de Vendedor'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
              <Link to="/auth/login" className="text-primary hover:underline font-medium">
                Iniciar Sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default VendorRegistrationPage;
