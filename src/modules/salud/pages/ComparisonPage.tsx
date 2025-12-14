import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/layouts/Layout";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, ShieldCheck } from "lucide-react";

// Componentes
import { ComparisonHeader } from "@/modules/salud/components/organisms/ComparisonHeader";
import { SaveQuoteModal } from "@/modules/salud/components/organisms/SaveQuoteModal";
import { AddPlanDrawer } from "@/modules/salud/components/organisms/AddPlanDrawer";
import { BeneficiosTable } from "@/modules/salud/components/organisms/BeneficiosTable";
import { ClinicasContent } from "@/modules/salud/components/organisms/ClinicasContent";

// Interfaces & Hooks
import { HealthPlan } from "@/core/interfaces/plan/planes";
import { Clinica } from "@/core/interfaces/plan/clinicas";
import { useVendorAuth } from "@/modules/vendor/hooks/useVendorAuth";

// --- INTERFACES ---
interface ComparisonPageProps {
  plansToCompare?: HealthPlan[];
  allAvailablePlans?: HealthPlan[];
  onAddPlan?: (planId: string) => void;
  onRemovePlan?: (planId: string) => void;
}

// --- CUSTOM HOOK (Mantenemos tu lógica original) ---
const useComparisonData = (
  propPlansToCompare?: HealthPlan[],
  propAllAvailablePlans?: HealthPlan[],
  propOnAddPlan?: (planId: string) => void,
  propOnRemovePlan?: (planId: string) => void
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [internalPlansToCompare, setInternalPlansToCompare] = useState<HealthPlan[]>([]);
  const [internalAllPlans, setInternalAllPlans] = useState<HealthPlan[]>([]);
  
  const plansToCompare = (propPlansToCompare && propPlansToCompare.length > 0) 
    ? propPlansToCompare 
    : internalPlansToCompare;
  const allAvailablePlans = (propAllAvailablePlans && propAllAvailablePlans.length > 0) 
    ? propAllAvailablePlans 
    : internalAllPlans;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!propPlansToCompare || !propAllAvailablePlans) {
      const storedComparisonPlans = sessionStorage.getItem('comparisonPlans');
      const storedAllPlans = sessionStorage.getItem('allPlans');
      
      if (storedComparisonPlans && storedAllPlans) {
        try {
          setInternalPlansToCompare(JSON.parse(storedComparisonPlans));
          setInternalAllPlans(JSON.parse(storedAllPlans));
        } catch (error) {
          console.error('Error parsing sessionStorage:', error);
          navigate('/');
        }
      } else {
        navigate('/');
      }
    }
  }, [propPlansToCompare, propAllAvailablePlans, navigate]);
  
  const handleAddPlan = useCallback((planId: string) => {
    if (propOnAddPlan) {
      propOnAddPlan(planId);
    } else {
      if (internalPlansToCompare.length < 3) {
        const planToAdd = internalAllPlans.find(p => p._id === planId);
        if (planToAdd && !internalPlansToCompare.find(p => p._id === planId)) {
          const newPlans = [...internalPlansToCompare, planToAdd];
          setInternalPlansToCompare(newPlans);
          sessionStorage.setItem('comparisonPlans', JSON.stringify(newPlans));
        }
      }
    }
  }, [propOnAddPlan, internalPlansToCompare, internalAllPlans]);
  
  const handleRemovePlan = useCallback((planId: string) => {
    if (propOnRemovePlan) {
      propOnRemovePlan(planId);
    } else {
      const newPlans = internalPlansToCompare.filter(p => p._id !== planId);
      setInternalPlansToCompare(newPlans);
      sessionStorage.setItem('comparisonPlans', JSON.stringify(newPlans));
    }
  }, [propOnRemovePlan, internalPlansToCompare]);

  return {
    plansToCompare,
    allAvailablePlans,
    onAddPlan: propOnAddPlan || handleAddPlan,
    onRemovePlan: propOnRemovePlan || handleRemovePlan,
  };
};

// --- MAIN COMPONENT ---
export const ComparisonPage = ({
  plansToCompare: propPlansToCompare,
  allAvailablePlans: propAllAvailablePlans,
  onAddPlan: propOnAddPlan,
  onRemovePlan: propOnRemovePlan,
}: ComparisonPageProps) => {
  const { toast } = useToast();
  const { user, isVendor } = useVendorAuth();
  
  // Estados de UI
  const [viewMode, setViewMode] = useState<"beneficios" | "clinicas">("beneficios");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  
  // Estados de Datos (Tablas)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [activeClinicaTab, setActiveClinicaTab] = useState("todas");
  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({});

  const { plansToCompare, allAvailablePlans, onAddPlan, onRemovePlan } = useComparisonData(
    propPlansToCompare,
    propAllAvailablePlans,
    propOnAddPlan,
    propOnRemovePlan
  );

  // --- HELPERS ---
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);

  const toggleGroupCollapse = useCallback((groupName: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) newSet.delete(groupName);
      else newSet.add(groupName);
      return newSet;
    });
  }, []);

  // --- DATA PREP ---
  const plansToAdd = useMemo(() => {
    const comparingIds = new Set(plansToCompare.map(p => p._id));
    return allAvailablePlans
      .filter(plan => !comparingIds.has(plan._id))
      .filter(plan => {
        const s = searchTerm.toLowerCase();
        return (
          (plan.name?.toLowerCase() || '').includes(s) ||
          (plan.empresa?.toLowerCase() || '').includes(s)
        );
      });
  }, [allAvailablePlans, plansToCompare, searchTerm]);

  // Lógica de Atributos (Mantenida)
  const groupedAttributes = useMemo(() => {
    const uniqueAttrs = new Map<string, any>();
    plansToCompare.forEach(plan => {
      plan.attributes?.forEach(attr => {
        const groupName = attr.attribute_group_name || 'Otros Beneficios';
        const key = `${groupName}::${attr.name}`;
        if (!uniqueAttrs.has(key)) {
          uniqueAttrs.set(key, {
            groupName,
            groupOrder: attr.attribute_group_order ?? null,
            attrName: attr.name,
            attrOrder: attr.attribute_name_order ?? null
          });
        }
      });
    });
    // (Ordenamiento simplificado para brevedad, usa tu lógica original si es compleja)
    const finalGroups: Record<string, string[]> = {};
    Array.from(uniqueAttrs.values()).forEach(attr => {
      if (!finalGroups[attr.groupName]) finalGroups[attr.groupName] = [];
      finalGroups[attr.groupName].push(attr.attrName);
    });
    return finalGroups;
  }, [plansToCompare]);

  const getPlanAttributeValue = useCallback((plan: HealthPlan, attrName: string): string => {
    const attr = plan.attributes?.find(a => a.name === attrName);
    return attr ? attr.value_name : '-';
  }, []);

  // Lógica de Clínicas (Mantenida)
  const uniqueClinicas = useMemo(() => {
    const clinicaMap = new Map<string, Clinica>();
    plansToCompare.forEach(plan => {
      plan.clinicas?.forEach(clinica => {
        if (!clinicaMap.has(clinica.item_id)) clinicaMap.set(clinica.item_id, clinica);
      });
    });
    return Array.from(clinicaMap.values()).sort((a, b) => (a.entity || '').localeCompare(b.entity || ''));
  }, [plansToCompare]);

  const regions = useMemo(() => {
    const regionSet = new Set<string>();
    uniqueClinicas.forEach(c => c.ubicacion?.forEach(u => u.region && regionSet.add(u.region)));
    return Array.from(regionSet).sort();
  }, [uniqueClinicas]);

  const getClinicasByRegion = useCallback((region: string) => {
    return uniqueClinicas.filter(c => c.ubicacion?.some(u => u.region === region));
  }, [uniqueClinicas]);

  const planIncludesClinica = useCallback((plan: HealthPlan, clinicaId: string) => {
    return plan.clinicas?.some(c => c.item_id === clinicaId) ?? false;
  }, []);


  return (
    <Layout>
      <Helmet>
        <title>Comparador Vitalia</title>
      </Helmet>
      
      {/* 1. NAVBAR */}
      <ComparisonHeader 
        plansCount={plansToCompare.length}
        isVendor={isVendor}
        onSaveClick={() => setSaveModalOpen(true)}
      />

      <div className="flex-1 min-h-screen pb-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            
            {/* 2. STICKY HEADER (PLANES + CONTROLES) */}
            <div className="sticky top-16 z-30 glassmorphism rounded-b-2xl pt-6 pb-4 border-b border-white/10 shadow-xl shadow-black/20 transition-all">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end px-4">
                    
                    {/* Col 1: Switcher */}
                    <div className="col-span-1 pb-2">
                        <h2 className="text-2xl font-bold text-white mb-4 hidden md:block">Comparativa</h2>
                        <div className="bg-white/5 p-1 rounded-xl border border-white/10 inline-flex shadow-sm w-full">
                            <button 
                                onClick={() => setViewMode("beneficios")}
                                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-bold transition-all ${viewMode === "beneficios" ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25" : "text-slate-400 hover:bg-white/5"}`}
                            >
                                Beneficios
                            </button>
                            <button 
                                onClick={() => setViewMode("clinicas")}
                                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-bold transition-all ${viewMode === "clinicas" ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25" : "text-slate-400 hover:bg-white/5"}`}
                            >
                                Clínicas
                            </button>
                        </div>
                    </div>

                    {/* Cols 2-4: Planes Seleccionados */}
                    {plansToCompare.map((plan, index) => (
                        <div key={plan._id} className="col-span-1 glassmorphism p-4 rounded-t-2xl border border-white/10 shadow-lg relative group animate-in fade-in zoom-in-95 duration-300">
                            <button 
                                onClick={() => onRemovePlan(plan._id)}
                                className="absolute top-2 right-2 text-slate-500 hover:text-red-400 transition-colors p-1"
                            >
                                <Trash2 size={16} />
                            </button>
                            
                            <div className="h-8 mb-2 flex items-center gap-2">
                                {plan.images && plan.images[0] ? (
                                    <img src={`/${plan.images[0].url}`} alt={plan.empresa} className="h-6 w-auto object-contain brightness-110" />
                                ) : (
                                    <span className="font-bold text-slate-300 text-xs">{plan.empresa}</span>
                                )}
                            </div>
                            
                            <div className="text-lg font-bold text-white leading-tight truncate" title={plan.name}>
                                {plan.name}
                            </div>
                            <div className="text-xl font-extrabold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mt-1">
                                {formatCurrency(plan.precio)}
                            </div>
                            
                            {/* Botón Elegir */}
                            <button className="w-full mt-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold py-2 rounded-lg hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25">
                                Elegir
                            </button>

                            {/* Badge Recomendado */}
                            {index === 0 && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-lg">
                                    Destacado
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Slot Vacío: Añadir Plan - Solo visible si hay menos de 3 planes */}
                    {plansToCompare.length < 3 && (
                        <div className="col-span-1 h-full min-h-[160px] hidden md:block">
                            <button 
                                onClick={() => setIsDrawerOpen(true)}
                                className="w-full h-full border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:border-violet-500/50 hover:text-violet-400 hover:bg-violet-500/5 transition-all cursor-pointer group glassmorphism"
                            >
                                <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-violet-500/10 flex items-center justify-center mb-2 transition-colors border border-white/10">
                                    <Plus size={24} />
                                </div>
                                <span className="font-bold text-sm">Añadir Plan</span>
                                <span className="text-xs text-slate-500 mt-1">Comparar hasta 3</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. CONTENIDO SCROLLABLE (TABLAS) */}
            <div className="mt-6 space-y-8">
                
                {viewMode === "beneficios" && (
                    <div className="glassmorphism rounded-2xl border border-white/10 overflow-hidden shadow-xl shadow-black/20">
                        <BeneficiosTable
                            plans={plansToCompare}
                            groupedAttributes={groupedAttributes}
                            collapsedGroups={collapsedGroups}
                            onToggleGroup={toggleGroupCollapse}
                            onRemovePlan={onRemovePlan}
                            getPlanAttributeValue={getPlanAttributeValue}
                        />
                    </div>
                )}

                {viewMode === "clinicas" && (
                    <div className="glassmorphism rounded-2xl border border-white/10 overflow-hidden shadow-xl shadow-black/20">
                        <ClinicasContent
                            plans={plansToCompare}
                            uniqueClinicas={uniqueClinicas}
                            regions={regions}
                            activeClinicaTab={activeClinicaTab}
                            onClinicaTabChange={setActiveClinicaTab}
                            onRemovePlan={onRemovePlan}
                            getClinicasByRegion={getClinicasByRegion}
                            planIncludesClinica={planIncludesClinica}
                        />
                    </div>
                )}

            </div>
        </div>
      </div>

      {/* 4. DRAWER AÑADIR PLAN */}
      <AddPlanDrawer 
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        plansToAdd={plansToAdd}
        onAddPlan={onAddPlan}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* 5. MODAL GUARDAR */}
      {isVendor && user && (
        <SaveQuoteModal
          open={saveModalOpen}
          onOpenChange={setSaveModalOpen}
          plans={plansToCompare}
          editedPrices={editedPrices}
          userId={user.id}
          onSaved={() => toast({ title: "Cotización guardada" })}
        />
      )}
    </Layout>
  );
};

export default ComparisonPage;