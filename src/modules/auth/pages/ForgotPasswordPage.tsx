import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/layouts/Layout';
import { Mail, Loader2, KeyRound, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';

const ForgotPasswordPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message,
        });
        return;
      }

      setEmailSent(true);
      toast({
        title: 'Correo enviado',
        description: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ocurrió un error inesperado. Intenta de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
        
        <Card className="w-full max-w-md border border-white/10 shadow-2xl rounded-3xl overflow-hidden bg-white/5 backdrop-blur-xl z-10">
          
          {/* HEADER */}
          <CardHeader className="space-y-3 text-center pt-8 pb-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-violet-500 rounded-2xl flex items-center justify-center mb-2 neon-fuchsia">
              {emailSent ? (
                <CheckCircle2 className="w-8 h-8 text-white" />
              ) : (
                <KeyRound className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {emailSent ? '¡Correo Enviado!' : 'Recuperar Contraseña'}
              </h1>
              <p className="text-slate-400 text-sm mt-1 px-4">
                {emailSent
                  ? `Hemos enviado las instrucciones a ${email}`
                  : 'Ingresa tu correo y te enviaremos un enlace para volver a entrar.'}
              </p>
            </div>
          </CardHeader>

          {!emailSent ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5 px-8 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus-visible:ring-violet-500 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-6 px-8 pb-8">
                <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white font-bold h-12 rounded-xl shadow-lg neon-fuchsia transition-all active:scale-95" 
                    disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                    </>
                  ) : (
                    <>
                        Enviar enlace <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                
                <Link
                  to="/auth/login"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 font-medium transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Volver a iniciar sesión
                </Link>
              </CardFooter>
            </form>
          ) : (
            <CardFooter className="flex flex-col space-y-6 px-8 pb-8 pt-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center">
                <p className="text-xs text-slate-400">
                  Si no recibes el correo en unos minutos, revisa tu carpeta de spam o intenta nuevamente.
                </p>
              </div>
              
              <Link to="/auth/login" className="w-full">
                <Button variant="outline" className="w-full h-12 rounded-xl border-white/20 bg-white/5 text-slate-200 hover:text-white hover:border-violet-500/50 hover:bg-white/10 font-bold transition-all">
                  Volver a iniciar sesión
                </Button>
              </Link>
              
              <button 
                onClick={() => setEmailSent(false)}
                className="text-xs text-slate-500 hover:text-slate-300 underline"
              >
                Probar con otro correo
              </button>
            </CardFooter>
          )}
        </Card>

      </div>
    </Layout>
  );
};

export default ForgotPasswordPage;
