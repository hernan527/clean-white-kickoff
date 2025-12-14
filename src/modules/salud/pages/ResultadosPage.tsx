import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Grid3x3, Plus, Heart, Shield, Users, Building2, Stethoscope, Baby, Filter } from "lucide-react";
import { type HealthPlan } from "@/core/interfaces/plan/planes";
import { type Clinica } from "@/core/interfaces/plan/clinicas";
import { Helmet } from "react-helmet-async";
import Layout from "@/layouts/Layout";
import { Button } from "@/components/ui/button";

// Componentes Organisms
import { FormQuote } from "@/modules/salud/components/organisms/FormQuote"; // Importación corregida (sin default si es named export)
import { StickyQuoteCTA } from "@/modules/salud/components/organisms/StickyQuoteCTA";
import { FloatingComparisonBar } from "@/modules/salud/components/organisms/FloatingComparisonBar"; 
import { PlanDetailsModal } from "@/modules/salud/components/organisms/PlanDetailsModal";
import QuoteRecoveryModal from "@/modules/salud/components/organisms/QuoteRecoveryModal";
import { QuickNavBar, QuickNavItem } from "@/modules/salud/components/organisms/QuickNavBar";
import { ResultsHeroBanner } from "@/modules/salud/components/organisms/ResultsHeroBanner";
import { FeaturesSection, Feature } from "@/modules/salud/components/organisms/FeaturesSection";
import { ResultsMainContent } from "@/modules/salud/components/organisms/ResultsMainContent";
import { MobileFilterDrawer } from "@/modules/salud/components/organisms/MobileFilterDrawer";
import { HeroSlide } from "@/modules/salud/components/molecules/HeroSlideContent";

import { useToast } from "@/hooks/use-toast";
import { useCotizacion } from "@/hooks/useCotizacion";

// --- CONSTANTS ---
const HERO_SLIDES: HeroSlide[] = [
  { title: "Encontrá el plan perfecto", subtitle: "Compará planes de las mejores prepagas" },
  { title: "Filtrá por precio y cobertura", subtitle: "Ajustá el rango de precios a tu presupuesto" },
];

const FEATURES: Feature[] = [
  { icon: Search, title: "Búsqueda inteligente", description: "Filtrá por precio, cobertura y clínicas" },
  { icon: Grid3x3, title: "Comparación fácil", description: "Compará hasta 4 planes lado a lado" },
  { icon: Plus, title: "Cotización gratuita", description: "Solicitá tu cotización sin compromiso" },
];

const ResultadosPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    savedFormData,
    showRecoveryModal,
    setShowRecoveryModal,
    handleRecoverForm,
    handleStartNew,
    cotizacionData,
    isLoading,
    recoveryDataLoading
  } = useCotizacion();

  // --- LOGICA DE PRECIOS Y FILTROS (Mantenida igual) ---
  const healthPlans = cotizacionData;
  const { minPrice, maxPrice } = useMemo(() => {
    const prices = healthPlans.map(p => Number(p.precio)).filter(p => !isNaN(p));
    return {
      maxPrice: prices.length ? Math.ceil(Math.max(...prices) / 1000) * 1000 : 10000000,
      minPrice: prices.length ? Math.floor(Math.min(...prices) / 1000) * 1000 : 0,
    };
  }, [healthPlans]);

  // Estados
  const [viewMode, setViewMode] = useState<"grid" | "list" | "grouped">("grouped");
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000000]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [minRating, setMinRating] = useState([0]);
  const [formQuoteOpen, setFormQuoteOpen] = useState(false); // Estado del Modal Cotizador
  const [sortBy, setSortBy] = useState<string>("default");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<HealthPlan | null>(null);
  const [selectedClinicas, setSelectedClinicas] = useState<Clinica[]>([]);
  const [openClinicSearch, setOpenClinicSearch] = useState(false);
  const [comparisonPlans, setComparisonPlans] = useState<string[]>([]);

  // Efecto precio inicial
  useEffect(() => {
    if (minPrice > 0 || maxPrice < 10000000) setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  // Filtros derivados
  const providers = useMemo(() => Array.from(new Set(healthPlans.map(p => p.empresa))), [healthPlans]);
  
  const allClinicas = useMemo(() => {
    const map = new Map();
    healthPlans.forEach(p => p.clinicas?.forEach(c => map.set(c.item_id, c)));
    return Array.from(map.values());
  }, [healthPlans]);

  const filteredPlans = useMemo(() => 
    healthPlans.filter(plan => {
      const matchesPrice = plan.precio >= priceRange[0] && plan.precio <= priceRange[1];
      const matchesProvider = selectedProviders.length === 0 || selectedProviders.includes(plan.empresa);
      const matchesRating = plan.rating >= minRating[0];
      const matchesClinica = selectedClinicas.length === 0 || 
        selectedClinicas.some(sc => plan.clinicas?.some(pc => pc.item_id === sc.item_id));
      return matchesPrice && matchesProvider && matchesRating && matchesClinica;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.precio - b.precio;
      if (sortBy === "price-desc") return b.precio - a.precio;
      return 0;
    }),
    [healthPlans, priceRange, selectedProviders, minRating, selectedClinicas, sortBy]
  );

  const comparisonPlansList = useMemo(() => 
    healthPlans.filter(plan => comparisonPlans.includes(plan._id)),
    [healthPlans, comparisonPlans]
  );

  // Quick Nav
  const quickNavItems: QuickNavItem[] = useMemo(() => [
    { icon: Heart, label: "Todos", action: () => setSelectedProviders([]) },
    { icon: Shield, label: "Económicos", action: () => setSortBy("price-asc") },
    { icon: Users, label: "Valorados", action: () => setMinRating([4]) },
    { icon: Baby, label: "Recotizar", action: () => setFormQuoteOpen(true) },
  ], []);

  // Handlers
  const toggleProvider = (p: string) => setSelectedProviders(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleClinica = (c: Clinica) => setSelectedClinicas(prev => prev.find(x => x.item_id === c.item_id) ? prev.filter(x => x.item_id !== c.item_id) : [...prev, c]);
  const removeClinica = (id: string) => setSelectedClinicas(prev => prev.filter(c => c.item_id !== id));
  
  const toggleComparison = (id: string) => {
    setComparisonPlans(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) {
        toast({ title: "Límite alcanzado", description: "Máximo 3 planes para comparar.", variant: "destructive" });
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleCompare = () => {
    sessionStorage.setItem('comparisonPlans', JSON.stringify(comparisonPlansList));
    sessionStorage.setItem('allPlans', JSON.stringify(healthPlans));
    navigate('/comparar');
  };

  const clearFilters = () => {
    setPriceRange([minPrice, maxPrice]);
    setSelectedProviders([]);
    setMinRating([0]);
    setSelectedClinicas([]);
  };

  return (
    <Layout>
      <Helmet>
        <title>Resultados | Vitalia</title>
      </Helmet>

      {/* 1. MODAL COTIZADOR (Renderizado directo, sin wrappers extra) */}
      <FormQuote 
        isOpen={formQuoteOpen} 
        onClose={() => setFormQuoteOpen(false)} 
        onComplete={(data) => {
            console.log("Recotización:", data);
            setFormQuoteOpen(false);
            toast({ title: "Precios actualizados", description: "Se han actualizado los planes según tu perfil." });
        }}
      />

      {/* 2. CARRITO FLOTANTE */}
      <FloatingComparisonBar 
        plans={comparisonPlansList}
        onCompare={handleCompare}
      />

      {/* 3. BOTÓN FLOTANTE DE FILTROS - Mobile Only */}
      <Button
        onClick={() => setFilterDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-50 lg:hidden rounded-full h-14 w-14 shadow-xl bg-primary hover:bg-primary/90"
        size="icon"
      >
        <Filter className="h-6 w-6" />
      </Button>


      <ResultsHeroBanner
        slides={HERO_SLIDES}
        plansCount={healthPlans.length}
        providersCount={providers.length}
        onWhatsAppClick={() => window.open('https://wa.me/54911...', '_blank')}
      />

      <StickyQuoteCTA onClick={() => setFormQuoteOpen(true)} />

      <QuickNavBar items={quickNavItems} />

      <MobileFilterDrawer
        open={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        providers={providers}
        selectedProviders={selectedProviders}
        onToggleProvider={toggleProvider}
        minRating={minRating}
        onMinRatingChange={setMinRating}
        onClearFilters={clearFilters}
        minLimit={minPrice}
        maxLimit={maxPrice}
      />

      <ResultsMainContent
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        providers={providers}
        selectedProviders={selectedProviders}
        onToggleProvider={toggleProvider}
        minRating={minRating}
        onMinRatingChange={setMinRating}
        onClearFilters={clearFilters}
        minLimit={minPrice}
        maxLimit={maxPrice}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filteredPlansCount={filteredPlans.length}
        onOpenFilters={() => setFilterDrawerOpen(true)}
        allClinicas={allClinicas}
        selectedClinicas={selectedClinicas}
        onToggleClinica={toggleClinica}
        onRemoveClinica={removeClinica}
        openClinicSearch={openClinicSearch}
        onOpenClinicSearchChange={setOpenClinicSearch}
        plans={filteredPlans} // Usar filteredPlans aquí
        loading={isLoading}
        comparisonPlans={comparisonPlans}
        onToggleComparison={toggleComparison}
        onOpenDetails={(plan) => { setSelectedPlan(plan); setDetailsModalOpen(true); }}
      />

      <FeaturesSection features={FEATURES} />

      <PlanDetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        plan={selectedPlan}
        isInComparison={selectedPlan ? comparisonPlans.includes(selectedPlan._id) : false}
        onToggleComparison={toggleComparison}
        onRequestQuote={() => { setDetailsModalOpen(false); setFormQuoteOpen(true); }}
      />

      <QuoteRecoveryModal
        open={showRecoveryModal}
        onOpenChange={setShowRecoveryModal}
        savedFormData={savedFormData}
        onRecover={handleRecoverForm}
        onStartNew={handleStartNew}
        isLoading={recoveryDataLoading}
      />
    </Layout>
  );
};

export default ResultadosPage;