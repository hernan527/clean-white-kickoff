import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Search, LogIn, Shield } from "lucide-react";
import { useVendorAuth } from "@/modules/vendor/hooks/useVendorAuth";
import { useAdminAuth } from "@/modules/admin/hooks/useAdminAuth";
import { ThemeToggle } from "@/components/ThemeToggle";

const Header = () => {
  const navigate = useNavigate();
  const { user, isVendor, isLoading: vendorLoading } = useVendorAuth();
  const { isAdmin, isLoading: adminLoading } = useAdminAuth();
  
  const isLoading = vendorLoading || adminLoading;

  const handleAuthClick = () => {
    if (user) {
      // User is logged in - navigate to appropriate dashboard
      if (isAdmin) {
        navigate('/admin');
      } else if (isVendor) {
        navigate('/vendedor/dashboard');
      } else {
        navigate('/vendedor/registro');
      }
    } else {
      // User not logged in - go to login
      navigate('/auth/login');
    }
  };

  const getAuthButtonContent = () => {
    if (!user) {
      return (
        <>
          <LogIn className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Ingresar</span>
        </>
      );
    }
    
    if (isAdmin) {
      return (
        <>
          <Shield className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Admin Panel</span>
          <span className="sm:hidden">Admin</span>
        </>
      );
    }
    
    if (isVendor) {
      return (
        <>
          <LayoutDashboard className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Mi Dashboard</span>
          <span className="sm:hidden">Dash</span>
        </>
      );
    }

    return (
      <>
        <LogIn className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Mi Cuenta</span>
      </>
    );
  };

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50 transition-all">
      <div className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <a href="/" className="flex items-center gap-2 group">
          <img 
            src="/assets/images/logos/logo-header-tr.png" 
            alt="Mejor Plan - Consultores en Salud" 
            className="h-12 hidden md:block transition-transform group-hover:scale-105 dark:brightness-110"
          />
          <img 
            src="/assets/images/logos/logo-header-tr-mobile.png" 
            alt="Mejor Plan - Consultores en Salud" 
            className="h-10 md:hidden dark:brightness-110"
          />
        </a>

        {/* ACCIONES */}
        <div className="flex items-center gap-3">
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {!isLoading && (
            <Button 
              variant="ghost" 
              onClick={handleAuthClick} 
              className="text-muted-foreground hover:text-primary hover:bg-primary/5 font-medium"
            >
              {getAuthButtonContent()}
            </Button>
          )}

          {/* CTA PRINCIPAL */}
          <Button 
            onClick={() => navigate('/resultados')} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full px-6 shadow-lg transition-all hover:shadow-xl active:scale-95"
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
