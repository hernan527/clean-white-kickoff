import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Sparkles, User, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomePlanCard, HomePlanData } from "./HomePlanCard";
import { HomeComparisonModal } from "./HomeComparisonModal";
import { useFetchAllPlans } from "@/modules/salud/hooks/useFetchAllPlans";
import masterQuotes from '@/data/cotizaciones_maestras_rows.json';

export const PlansSection = () => {
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [profile, setProfile] = useState({ edad1: 18, edad2: 0, hijos: 0, tipo: 'P' });

  // 1. Obtenemos la data del Hook
  const { data, isLoading } = useFetchAllPlans();

  // 2. Metemos la lógica de extracción y combinación TODO dentro del useMemo
  const livePlans = useMemo(() => {
    // EXTRAER LOS PLANES (Soluciona el error de TypeScript y de dependencias)
    // Usamos una aserción de tipo 'any' temporal para que no proteste por la propiedad .planes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawData: any = data;
    const dbPlans = Array.isArray(rawData) ? rawData : rawData?.planes || [];

    if (!dbPlans || dbPlans.length === 0) return [];

    // Generamos el ID matemático (ej: 1800000)
    const targetId = parseInt(
      `${profile.edad1}${String(profile.edad2).padStart(2, '0')}${String(profile.hijos).padStart(2, '0')}${profile.tipo === 'P' ? '0' : '1'}`
    );
    
    const quoteRow = masterQuotes.find(q => q.id === targetId);
    if (!quoteRow || !quoteRow.respuesta) return [];

    const preciosMock = JSON.parse(quoteRow.respuesta);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return dbPlans.map((dbPlan: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const infoPrecio = preciosMock.find((p: any) => p.item_id === dbPlan.item_id);
      if (!infoPrecio) return null;

      return {
        id: dbPlan.id.toString(),
        item_id: dbPlan.item_id,
        name: dbPlan.nombre_plan || dbPlan.name,
        empresa: dbPlan.empresas?.nombre || "Empresa",
        logo: dbPlan.empresas?.imagenes?.logo || "placeholder.png",        price: infoPrecio.precio,
        originalPrice: Math.round(infoPrecio.precio * 1.25),
        attributes: dbPlan.slogans || ["Cobertura Médica Premium"],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        clinics: dbPlan.plan_clinica?.map((pc: any) => pc.clinicas?.nombre).filter(Boolean).slice(0, 3) || [],
        copago: dbPlan.tiene_copagos || false
      };
    }).filter(Boolean) as HomePlanData[];
    
    // Agregamos 'data' a las dependencias para que useMemo se dispare cuando cargue el Mock
  }, [data, profile]);

  // 4. HANDLERS
  const togglePlan = (planId: string) => {
    setSelectedPlans(prev => 
      prev.includes(planId) 
        ? prev.filter(id => id !== planId) 
        : (prev.length >= 2 ? [prev[1], planId] : [...prev, planId])
    );
  };

  const selectedPlanData = selectedPlans
    .map((id) => livePlans.find((p) => p.id === id))
    .filter(Boolean) as HomePlanData[];

  // 5. EFECTOS
  useEffect(() => {
    if (selectedPlans.length === 2) {
      const timer = setTimeout(() => setShowModal(true), 400);
      return () => clearTimeout(timer);
    }
  }, [selectedPlans]);

  if (isLoading) return (
    <div className="py-20 text-center font-bold text-primary animate-pulse">
      Cargando planes profesionales...
    </div>
  );

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary uppercase tracking-wider">
              Cotización Real Instantánea
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4">
            Elegí tu <span className="text-primary italic">Perfil</span>
          </h2>

          {/* BOTONES DE PERFIL */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Button 
              variant={profile.edad1 === 18 && profile.hijos === 0 ? "default" : "outline"}
              className="rounded-full shadow-sm"
              onClick={() => setProfile({ edad1: 18, edad2: 0, hijos: 0, tipo: 'P' })}
            >
              <User className="mr-2 h-4 w-4" /> Soltero 18 años
            </Button>
            <Button 
              variant={profile.hijos === 2 ? "default" : "outline"}
              className="rounded-full shadow-sm"
              onClick={() => setProfile({ edad1: 30, edad2: 30, hijos: 2, tipo: 'P' })}
            >
              <UsersIcon className="mr-2 h-4 w-4" /> Familia (2 hijos)
            </Button>
          </div>
        </div>

{/* GRILLA DE PLANES */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
  {livePlans.map((plan, index) => (
    <HomePlanCard
      key={plan.id}
      plan={plan}
      isSelected={selectedPlans.includes(plan.id)}
      onSelect={() => togglePlan(plan.id)}
      onWhatsApp={() => window.open(`https://wa.me/549...?text=Hola, quiero info del ${plan.name}`)} 
      index={index}
    />
  ))}
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
                  className="font-bold rounded-xl bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform"
                >
                  <Scale className="w-4 h-4 mr-2" />
                  {selectedPlans.length === 2 ? "¡Ver Comparativa!" : `${selectedPlans.length}/2 seleccionados`}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <HomeComparisonModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        plans={selectedPlanData}
        onWhatsApp={(name) => window.open(`https://wa.me/549...?text=Hola, comparé planes y me interesa el ${name}`)}
      />
    </section>
  );
};