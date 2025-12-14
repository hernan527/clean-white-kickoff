import { Facebook, Instagram, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-950/80 backdrop-blur-xl text-slate-300 py-16 border-t border-white/10 relative">
      <div className="container mx-auto px-6">
        
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          
          {/* Columna Marca */}
          <div className="space-y-4">
            <img 
              src="/assets/images/logos/logo-footer.gif" 
              alt="Mejor Plan" 
              className="h-12 mb-4 opacity-90"
            />
            <p className="text-sm text-slate-400 leading-relaxed">
              Simplificamos la búsqueda de tu cobertura médica. Compara, elige y contrata el plan ideal para vos y tu familia con total transparencia.
            </p>
            <div className="flex gap-4 pt-2">
                <SocialIcon icon={Instagram} />
                <SocialIcon icon={Facebook} />
                <SocialIcon icon={Linkedin} />
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="font-bold text-white mb-6 text-lg">Empresa</h3>
            <ul className="space-y-3 text-sm">
              <li><FooterLink href="#">Sobre nosotros</FooterLink></li>
              <li><FooterLink href="#">Nuestros asesores</FooterLink></li>
              <li><FooterLink href="#">Trabaja con nosotros</FooterLink></li>
              <li><FooterLink href="#">Blog de salud</FooterLink></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-white mb-6 text-lg">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li><FooterLink href="#">Términos y condiciones</FooterLink></li>
              <li><FooterLink href="#">Política de privacidad</FooterLink></li>
              <li><FooterLink href="#">Defensa del consumidor</FooterLink></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-bold text-white mb-6 text-lg">Ayuda</h3>
            <ul className="space-y-3 text-sm">
              <li><FooterLink href="#">Centro de ayuda</FooterLink></li>
              <li><FooterLink href="#">Preguntas frecuentes</FooterLink></li>
              <li className="flex items-center gap-2 text-cyan-400 font-medium pt-2">
                <Mail size={16} /> hola@mejorplan.com.ar
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Mejor Plan - Consultores en Salud. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <span>Hecho con ❤️ en Argentina</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Componentes auxiliares para limpiar el código
const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a 
    href={href} 
    className="hover:text-cyan-400 transition-colors duration-200 block"
  >
    {children}
  </a>
);

const SocialIcon = ({ icon: Icon }: { icon: any }) => (
  <a href="#" className="p-2 bg-white/5 backdrop-blur-sm rounded-full hover:bg-violet-600 hover:text-white transition-all text-slate-400 border border-white/10">
    <Icon size={18} />
  </a>
);

export default Footer;
