/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomePlanCard, HomePlanData } from "./HomePlanCard";
import { HomeComparisonModal } from "./HomeComparisonModal";
import { CotizadorSidebar } from "./CotizadorSidebar"; 
import { usePlans } from "@/hooks/usePlans";
import masterQuotes from '@/data/cotizaciones_maestras_rows.json';
import { normalizeLogoPath } from "@/lib/supabase-helpers";

// Forzamos el tipado de la data para habilitar .find()
const quotes = (masterQuotes as any) as any[];

export const PlansSection = () => {
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filtros, setFiltros] = useState({ 
    edadTitular: 30, 
    edadConyuge: 0, 
    hijos: 0, 
    sueldo: 0 
  });

  const { data, isLoading } = usePlans();

  // 1. MOTOR DE CÁLCULO (Sliders + JSON + Aportes)
  const livePlans = useMemo(() => {
    const rawData: any = data;
    const dbPlans = Array.isArray(rawData) ? rawData : rawData?.planes || [];
    if (!dbPlans || dbPlans.length === 0) return [];

    const esDesregulado = filtros.sueldo > 300000;
    const aporteObraSocial = esDesregulado ? Math.round(filtros.sueldo * 0.0765) : 0;

    const targetId = parseInt(
      `${filtros.edadTitular}${String(filtros.edadConyuge).padStart(2, '0')}${String(filtros.hijos).padStart(2, '0')}${esDesregulado ? '1' : '0'}`
    );
    
    const quoteRow = quotes.find(q => q.id === targetId);
    if (!quoteRow) return [];

    const preciosMock = typeof quoteRow.respuesta === 'string' 
      ? JSON.parse(quoteRow.respuesta) 
      : quoteRow.respuesta;

    return dbPlans.map((dbPlan: any) => {
      const infoPrecio = preciosMock.find((p: any) => p.item_id === dbPlan.item_id);
      if (!infoPrecio) return null;

      return {
        id: dbPlan.id.toString(),
        item_id: dbPlan.item_id,
        name: dbPlan.nombre_plan || dbPlan.name,
        empresa: dbPlan.empresas?.nombre || "Empresa",
        logo: normalizeLogoPath(dbPlan.empresas?.imagenes?.logo || "/placeholder.svg"),
        price: Math.max(0, infoPrecio.precio - aporteObraSocial),
        originalPrice: infoPrecio.precio,
        attributes: dbPlan.slogans || [],
        clinics: dbPlan.plan_clinica?.map((pc: any) => pc.clinicas?.nombre_abreviado || pc.clinicas?.nombre).slice(0, 3) || [],
        clinicsData: dbPlan.plan_clinica?.map((pc: any) => pc.clinicas).filter(Boolean) || [],
        copago: dbPlan.tiene_copagos || false,
        modalidad: esDesregulado ? 'D' : 'P'
      };
    }).filter(Boolean) as HomePlanData[];
  }, [data, filtros]);

  // 2. SINCRONIZACIÓN PARA DUELOS (Comparación)
  const selectedPlanData = useMemo(() => {
    return selectedPlans
      .map((id) => livePlans.find((p) => p.id === id))
      .filter(Boolean) as HomePlanData[];
  }, [selectedPlans, livePlans]);

  // 3. HANDLERS
  const togglePlan = (planId: string) => {
    setSelectedPlans(prev => 
      prev.includes(planId) 
        ? prev.filter(id => id !== planId) 
        : (prev.length >= 2 ? [prev[1], planId] : [...prev, planId])
    );
  };

  if (isLoading) return <div className="py-20 text-center animate-pulse font-bold">Iniciando Versus...</div>;

  return (
    <section className="py-12 bg-background relative min-h-screen">
      <div className="container mx-auto px-4">
        
        {/* Encabezado */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary uppercase tracking-wider">
              Comparador Inteligente
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black italic text-foreground">
            Versus <span className="text-primary">Prepagas</span>
          </h2>
        </div>

        {/* LAYOUT PRINCIPAL: Sidebar Sticky + Grilla */}
        <div className="flex flex-col lg:flex-row gap-8 items-start relative">
          
          {/* SIDEBAR STICKY (Los 4 Sliders) */}
          <aside className="w-full lg:w-[380px] lg:sticky lg:top-8 self-start z-30">
            <CotizadorSidebar filtros={filtros} setFiltros={setFiltros} />
          </aside>

          {/* LISTADO DE RESULTADOS */}
          <main className="flex-1 w-full">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-32">
              <AnimatePresence mode="popLayout">
                {livePlans.map((plan, index) => (
                  <HomePlanCard
                    key={plan.id}
                    plan={plan}
                    index={index}
                    isSelected={selectedPlans.includes(plan.id)}
                    onSelect={() => togglePlan(plan.id)}
                    onWhatsApp={() => window.open(`https://wa.me/549...?text=Hola! Coticé el ${plan.name} en Versus.`)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </main>

        </div>
      </div>

      {/* BARRA FLOTANTE DE COMPARACIÓN */}
      <AnimatePresence>
        {selectedPlans.length > 0 && (
          <motion.div 
            initial={{ y: 100, x: "-50%" }} 
            animate={{ y: 0, x: "-50%" }} 
            exit={{ y: 100, x: "-50%" }}
            className="fixed bottom-8 left-1/2 z-50 w-[90%] max-w-md"
          >
            <div className="bg-card/95 backdrop-blur-xl border border-primary/20 rounded-3xl shadow-2xl p-4 flex items-center justify-between">
              <div className="flex -space-x-3">
                {selectedPlanData.map((p) => (
                  <div key={p.id} className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                    <img src={p.logo} alt="" className="w-6 h-6 object-contain" />
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => setShowModal(true)} 
                disabled={selectedPlans.length < 2}
                className="font-bold rounded-xl shadow-lg transition-transform hover:scale-105"
              >
                <Scale className="w-4 h-4 mr-2" />
                {selectedPlans.length === 2 ? "¡Ver Comparativa!" : `${selectedPlans.length}/2 Seleccionados`}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE DUELO */}
      <HomeComparisonModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        plans={selectedPlanData}
        onWhatsApp={(name) => window.open(`https://wa.me/549...?text=Hola! Comparé en Versus y me gustó el plan ${name}`)}
      />
    </section>
  );
};