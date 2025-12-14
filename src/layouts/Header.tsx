import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserCheck, LayoutDashboard, Search } from "lucide-react";
import { useVendorAuth } from "@/modules/vendor/hooks/useVendorAuth";

const Header = () => {
  const navigate = useNavigate();
  const { user, isVendor, isLoading } = useVendorAuth();

  return (
    <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50 transition-all">
      <div className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <a href="/" className="flex items-center gap-2 group">
          <img 
            src="/assets/images/logos/logo-header-tr.png" 
            alt="Mejor Plan - Consultores en Salud" 
            className="h-12 hidden md:block transition-transform group-hover:scale-105 brightness-110"
          />
          <img 
            src="/assets/images/logos/logo-header-tr-mobile.png" 
            alt="Mejor Plan - Consultores en Salud" 
            className="h-10 md:hidden brightness-110"
          />
        </a>

        {/* ACCIONES */}
        <div className="flex items-center gap-3">
          
          {!isLoading && (
            user && isVendor ? (
              <Button 
                variant="ghost" 
                onClick={() => navigate('/vendedor/dashboard')} 
                className="text-slate-300 hover:text-cyan-400 hover:bg-white/5 font-medium"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Mi Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                onClick={() => navigate('/vendedor/registro')} 
                className="text-slate-400 hover:text-cyan-400 hover:bg-white/5 font-medium hidden sm:flex"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Soy Asesor
              </Button>
            )
          )}

          {/* CTA PRINCIPAL */}
          <Button 
            onClick={() => navigate('/resultados')} 
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold rounded-full px-6 shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 active:scale-95"
          >
            <Search className="w-4 h-4 mr-2" />
            Ver Planes
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;