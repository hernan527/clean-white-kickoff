import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import Index from "./modules/home/pages/Index";
import ResultadosPage from "./modules/salud/pages/ResultadosPage";
import { ComparisonPage } from "./modules/salud/pages/ComparisonPage";
import { PublicQuotePage } from "./modules/salud/pages/PublicQuotePage";
import NotFound from "./modules/salud/pages/NotFound";
import { LoginPage, RegisterPage, ForgotPasswordPage } from "./modules/auth/pages";
import { StyleGuidePage } from "./modules/styleguide/pages";
import { ProviderLandingPage } from "@/modules/salud/pages/ProviderLandingPage"; 
import {
  VendorRegistrationPage,
  VendorDashboardPage,
  VendorProfilePage,
  VendorQuotesPage,
  VendorMarketingPage,
} from "./modules/vendor/pages";
import { ChatwootWidget } from "@/components/ChatwootWidget";
import { ActivityTracker } from "@/components/ActivityTracker";
import { AdminLayout } from "./modules/admin/layouts/AdminLayout";
import {
  AdminDashboardPage,
  AdminEmpresasPage,
  AdminClinicasPage,
  AdminPlanesPage,
  AdminUsuariosPage,
  AdminActividadPage,
  AdminCompaniesPage,
  AdminCompanyMembersPage,
} from "./modules/admin/pages";
const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ActivityTracker />
            <ChatwootWidget /> 
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/resultados" element={<ResultadosPage />} />
              <Route path="/comparar" element={<ComparisonPage />} />
              
              {/* LANDING PAGES DINÁMICAS (SEO & ADS) */}
              <Route path="/planes/:providerId" element={<ProviderLandingPage />} />

              {/* Public quote view */}
              <Route path="/cotizacion/:token" element={<PublicQuotePage />} />
              
              {/* Auth routes */}
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
              
              {/* Vendor routes */}
              <Route path="/vendedor/registro" element={<VendorRegistrationPage />} />
              <Route path="/vendedor/dashboard" element={<VendorDashboardPage />} />
              <Route path="/vendedor/perfil" element={<VendorProfilePage />} />
              <Route path="/vendedor/cotizaciones" element={<VendorQuotesPage />} />
              <Route path="/vendedor/marketing" element={<VendorMarketingPage />} />
              
              {/* Styleguide */}
              <Route path="/styleguide" element={<StyleGuidePage />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<AdminLayout><AdminDashboardPage /></AdminLayout>} />
              <Route path="/admin/companies" element={<AdminLayout><AdminCompaniesPage /></AdminLayout>} />
              <Route path="/admin/empresas/:companyId/miembros" element={<AdminLayout><AdminCompanyMembersPage /></AdminLayout>} />
              <Route path="/admin/empresas" element={<AdminLayout><AdminEmpresasPage /></AdminLayout>} />
              <Route path="/admin/clinicas" element={<AdminLayout><AdminClinicasPage /></AdminLayout>} />
              <Route path="/admin/planes" element={<AdminLayout><AdminPlanesPage /></AdminLayout>} />
              <Route path="/admin/usuarios" element={<AdminLayout><AdminUsuariosPage /></AdminLayout>} />
              <Route path="/admin/actividad" element={<AdminLayout><AdminActividadPage /></AdminLayout>} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
