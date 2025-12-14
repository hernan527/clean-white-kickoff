import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import AuthService from '@/services/auth.service';
import Layout from '@/layouts/Layout';
import { User, Mail, Lock, Loader2, UserPlus, ArrowRight, CheckCircle2 } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Las contraseñas no coinciden',
        description: 'Por favor verifica que ambas contraseñas sean iguales.',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Contraseña muy corta',
        description: 'La contraseña debe tener al menos 6 caracteres.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { user, session, error } = await AuthService.signUp({
        email,
        password,
        firstName,
        lastName,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error al registrarse',
          description: AuthService.getAuthErrorMessage(error),
        });
        return;
      }

      if (user && session) {
        toast({
          title: '¡Bienvenido!',
          description: 'Tu cuenta ha sido creada exitosamente.',
          action: <div className="h-8 w-8 bg-success/20 rounded-full flex items-center justify-center"><CheckCircle2 className="text-success h-5 w-5" /></div>
        });
        navigate('/');
      } else if (user) {
        toast({
          title: 'Registro exitoso',
          description: 'Revisa tu correo electrónico para confirmar tu cuenta.',
        });
        navigate('/auth/login');
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error inesperado',
        description: 'Ocurrió un error al intentar registrarte. Intenta de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
        
        <Card className="w-full max-w-md border border-border shadow-2xl rounded-3xl overflow-hidden bg-card/80 backdrop-blur-xl z-10">
          
          {/* HEADER */}
          <CardHeader className="space-y-3 text-center pt-8 pb-6">
            <div className="mx-auto w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-2 shadow-lg">
              <UserPlus className="w-8 h-8 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Crear Cuenta</h1>
              <p className="text-muted-foreground text-sm mt-1">Únete para gestionar tus planes</p>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 px-8">
              
              {/* Nombres */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs font-bold text-muted-foreground uppercase">Nombre</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      placeholder="Juan"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isLoading}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs font-bold text-muted-foreground uppercase">Apellido</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      placeholder="Pérez"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isLoading}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold text-muted-foreground uppercase">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs font-bold text-muted-foreground uppercase">Confirmar contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>

            </CardContent>

            <CardFooter className="flex flex-col space-y-6 px-8 pb-8 pt-2">
              <Button 
                type="submit" 
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold h-12 rounded-xl shadow-lg transition-all active:scale-95" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando...
                  </>
                ) : (
                  <>
                    Registrarse <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                    ¿Ya tienes una cuenta?{' '}
                    <Link to="/auth/login" className="text-primary font-bold hover:text-primary/80 hover:underline transition-colors">
                      Inicia sesión
                    </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>

      </div>
    </Layout>
  );
};

export default RegisterPage;
