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

  const livePlans = useMemo(() => {
    // 🛡️ PROTECCIÓN 1: Data de Supabase/Mock
    if (!data) return [];
    const dbPlans = Array.isArray(data) ? data : ((data as any).planes || []);
    if (dbPlans.length === 0) return [];

    // 🛡️ PROTECCIÓN 2: Cotizaciones Maestras
    const esDesregulado = filtros.sueldo > 300000;
    const aporteObraSocial = esDesregulado ? Math.round(filtros.sueldo * 0.0765) : 0;

    const targetId = parseInt(
      `${filtros.edadTitular}${String(filtros.edadConyuge).padStart(2, '0')}${String(filtros.hijos).padStart(2, '0')}${esDesregulado ? '1' : '0'}`
    );
    
   // Aseguramos que la comparación de ID sea como String para evitar fallos
  const quoteRow = quotes.find(q => String(q.id) === String(targetId));
  
  if (!quoteRow) {
    console.warn("⚠️ No se encontró cotización para ID:", targetId);
    return [];
  }

    const preciosMock = typeof quoteRow.respuesta === 'string' 
      ? JSON.parse(quoteRow.respuesta) 
      : quoteRow.respuesta;

    if (!Array.isArray(preciosMock)) return [];

    // 🛡️ PROTECCIÓN 3: Mapeo Individual de Planes
    return dbPlans.map((dbPlan: any) => {
      if (!dbPlan || !dbPlan.item_id) return null;

      const infoPrecio = preciosMock.find((p: any) => p.item_id === dbPlan.item_id);
      
      // Si el plan no tiene precio en el JSON de cotizaciones, no lo mostramos
      if (!infoPrecio) return null;

      // Extraer prestaciones con seguridad
      const prestacionesReales = dbPlan.plan_prestacion || [];
      
      return {
        id: String(dbPlan.id),
        item_id: dbPlan.item_id,
        name: dbPlan.nombre_plan || "Plan sin nombre",
        empresa: dbPlan.empresas?.nombre || "Empresa",
        logo: normalizeLogoPath(dbPlan.empresas?.imagenes?.logo || dbPlan.logo || "/placeholder.svg"),
        slogans: dbPlan.empresas?.slogans || dbPlan.slogans || [],
        attributes: [], // Se puede omitir si usas plan_prestacion
        plan_prestacion: prestacionesReales, 
        price: Math.max(0, (infoPrecio.precio || 0) - aporteObraSocial),
        originalPrice: infoPrecio.precio || 0,
        clinicsData: dbPlan.plan_clinica?.map((pc: any) => pc.clinicas).filter(Boolean) || [],
        copago: !!dbPlan.tiene_copagos,
        modalidad: esDesregulado ? 'D' : 'P'
      };
    }).filter(Boolean) as HomePlanData[];
  }, [data, filtros]);

  // 🛡️ PROTECCIÓN 4: Selección de comparativa
  const selectedPlanData = useMemo(() => {
    return selectedPlans
      .map((id) => livePlans.find((p) => String(p.id) === String(id)))
      .filter(Boolean) as HomePlanData[];
  }, [selectedPlans, livePlans]);

  const togglePlan = (planId: string) => {
    setSelectedPlans(prev => 
      prev.includes(planId) 
        ? prev.filter(id => id !== planId) 
        : (prev.length >= 2 ? [prev[1], planId] : [...prev, planId])
    );
  };

  if (isLoading) return <div className="py-20 text-center animate-pulse font-bold">Cargando planes...</div>;

  // 🛡️ PROTECCIÓN FINAL: Si no hay planes calculados, avisar al usuario
  if (livePlans.length === 0) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <p>No se encontraron planes para los datos ingresados.</p>
        <p className="text-xs">Verifica la edad y el sueldo en la sidebar.</p>
      </div>
    );
  }

  return (
    <section className="py-12 bg-background relative min-h-screen">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary uppercase tracking-wider">Cotizador Online</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black italic text-foreground">
            Versus <span className="text-primary">Prepagas</span>
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start relative">
          <aside className="w-full lg:w-[350px] sticky top-[70px] z-40 self-start">
            <CotizadorSidebar filtros={filtros} setFiltros={setFiltros} />
          </aside>
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
                    onWhatsApp={() => window.open(`https://wa.me/5491100000000?text=Consulta por ${plan.name}`)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>

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
                  <div key={p.id} className="w-10 h-10 rounded-full border-2 border-background bg-white flex items-center justify-center overflow-hidden">
                    <img src={p.logo} alt="" className="w-6 h-6 object-contain" />
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => setShowModal(true)} 
                disabled={selectedPlans.length < 2}
                className="font-bold rounded-xl"
              >
                <Scale className="w-4 h-4 mr-2" />
                {selectedPlans.length === 2 ? "Comparar ahora" : "Selecciona 2"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <HomeComparisonModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        plans={selectedPlanData}
        onWhatsApp={(name) => window.open(`https://wa.me/5491100000000?text=Me interesó el ${name}`)}
      />
    </section>
  );
};