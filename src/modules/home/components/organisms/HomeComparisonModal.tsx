import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Trophy, Check, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { HomePlanData, ClinicData } from "./HomePlanCard";
import { useMemo } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface HomeComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: HomePlanData[];
  onWhatsApp: (planName: string) => void;
}

// Orden de regiones para mostrar
const REGION_ORDER = ["CABA", "GBA Norte", "GBA Oeste", "GBA Sur", "Interior"];

export const HomeComparisonModal = ({ isOpen, onClose, plans, onWhatsApp }: HomeComparisonModalProps) => {
  // 1. PRIMERO LOS HOOKS (SIEMPRE)
  const clinicsByZone = useMemo(() => {
    if (!plans || plans.length < 2) return {};

    const [planA, planB] = plans;
    const zones: Record<string, { planA: ClinicData[], planB: ClinicData[] }> = {};

    const processPlan = (plan: HomePlanData, side: 'planA' | 'planB') => {
      // Usar clinicsData que tiene la info completa
      const clinics = plan.clinicsData || [];
      
      clinics.forEach((clinic: ClinicData) => {
        const zone = clinic.ubicaciones?.region || "Sin región";
        if (!zones[zone]) zones[zone] = { planA: [], planB: [] };
        zones[zone][side].push(clinic);
      });
    };

    processPlan(planA, 'planA');
    processPlan(planB, 'planB');
    
    // Ordenar las zonas según REGION_ORDER
    const sortedZones: Record<string, { planA: ClinicData[], planB: ClinicData[] }> = {};
    
    REGION_ORDER.forEach(region => {
      if (zones[region]) {
        sortedZones[region] = zones[region];
      }
    });
    
    // Agregar regiones que no están en el orden predefinido
    Object.keys(zones).forEach(region => {
      if (!sortedZones[region]) {
        sortedZones[region] = zones[region];
      }
    });
    
    return sortedZones;
  }, [plans]);

  // 2. RECIÉN AHORA EL RETURN TEMPRANO
  if (!plans || plans.length < 2) return null;

  // 3. VARIABLES DE APOYO
  const [planA, planB] = plans;
  const cheaperPlan = planA.price <= planB.price ? "A" : "B";

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);

  const ComparisonRow = ({ label, valueA, valueB, isPrice = false }: { label: string; valueA: string | boolean; valueB: string | boolean; isPrice?: boolean }) => {
    const renderValue = (val: string | boolean, isWinner: boolean) => {
      if (typeof val === "boolean") {
        return val ? (
          <Check className={cn("w-5 h-5 mx-auto", isWinner ? "text-green-500" : "text-primary")} />
        ) : (
          <X className="w-5 h-5 mx-auto text-muted-foreground/30" />
        );
      }
      return <span className={cn("font-bold", isWinner && isPrice && "text-green-600")}>{val}</span>;
    };

    return (
      <div className="grid grid-cols-3 gap-4 py-4 border-b border-border/40 items-center hover:bg-muted/20 transition-colors px-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-tight">{label}</span>
        <div className="text-center">{renderValue(valueA, isPrice && cheaperPlan === "A")}</div>
        <div className="text-center">{renderValue(valueB, isPrice && cheaperPlan === "B")}</div>
      </div>
    );
  };

  const PlanHeader = ({ plan, isWinner, side }: { plan: HomePlanData; isWinner: boolean; side: "A" | "B" }) => (
    <div className={cn(
      "relative p-4 rounded-2xl border-2 text-center transition-all duration-500",
      isWinner ? "border-green-500 bg-green-50/50 shadow-md" : "border-border bg-card"
    )}>
      {isWinner && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-lg">
          <Trophy className="w-3 h-3" /> EL MEJOR PRECIO
        </div>
      )}
      <div className="w-14 h-14 mx-auto bg-white rounded-lg p-2 mb-2 shadow-sm border border-border/50">
        <img src={plan.logo} alt={plan.empresa} className="w-full h-full object-contain" />
      </div>
      <h4 className="font-bold text-foreground text-xs truncate mb-1">{plan.name}</h4>
      <p className="text-xl font-black text-primary leading-none">{formatCurrency(plan.price)}</p>
    </div>
  );

  // Contar clínicas por plan
  const totalClinicsA = planA.clinicsData?.length || 0;
  const totalClinicsB = planB.clinicsData?.length || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] md:max-h-[90vh] overflow-hidden p-0 bg-background border-border shadow-2xl">
        <VisuallyHidden>
          <DialogTitle>Comparación de Planes de Salud</DialogTitle>
          <DialogDescription>Comparación detallada entre {planA.name} y {planB.name}</DialogDescription>
        </VisuallyHidden>
        
        {/* Header Seccion */}
        <div className="p-6 border-b border-border bg-muted/20">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-foreground tracking-tighter">⚔️ BATALLA DE PLANES</h2>
            <p className="text-xs text-muted-foreground font-semibold">Análisis comparativo de prestaciones y costos</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <PlanHeader plan={planA} isWinner={cheaperPlan === "A"} side="A" />
            <PlanHeader plan={planB} isWinner={cheaperPlan === "B"} side="B" />
          </div>
        </div>

        {/* Cuerpo con Tabs */}
        <Tabs defaultValue="beneficios" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full justify-start px-6 pt-4 bg-transparent gap-4">
            <TabsTrigger value="beneficios" className="font-black text-xs uppercase data-[state=active]:text-primary">
              Beneficios
            </TabsTrigger>
            <TabsTrigger value="clinicas" className="font-black text-xs uppercase data-[state=active]:text-primary">
              Sanatorios ({totalClinicsA} vs {totalClinicsB})
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto flex-1 px-6 py-4">
            <TabsContent value="beneficios" className="mt-0 outline-none">
              <div className="space-y-0">
                <ComparisonRow label="Cuota Mensual" valueA={formatCurrency(planA.price)} valueB={formatCurrency(planB.price)} isPrice />
                <ComparisonRow label="Copagos" valueA={planA.copago ? "Si" : "No"} valueB={planB.copago ? "Si" : "No"} />
                
                {/* Atributos: Tomamos los del Plan A y comparamos contra el B */}
                {planA.attributes.map((attr, idx) => (
                  <ComparisonRow 
                    key={idx} 
                    label={attr} 
                    valueA={true} 
                    valueB={planB.attributes.some(a => a.toLowerCase() === attr.toLowerCase())} 
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="clinicas" className="mt-0 outline-none">
              {Object.keys(clinicsByZone).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">No hay información de clínicas disponible</p>
                </div>
              ) : (
                Object.entries(clinicsByZone).map(([zone, data]) => (
                  <div key={zone} className="mb-8">
                    <div className="flex items-center gap-2 mb-4 border-l-4 border-primary pl-3">
                      <MapPin className="w-4 h-4 text-primary" />
                      <h4 className="font-black text-foreground uppercase text-xs tracking-widest">{zone}</h4>
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {data.planA.length} vs {data.planB.length}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Plan A Clinics */}
                      <div className="space-y-2">
                        {data.planA.length === 0 ? (
                          <div className="text-[10px] text-muted-foreground/50 italic p-2">
                            Sin cobertura en esta zona
                          </div>
                        ) : (
                          data.planA.map((clinic, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-[10px] bg-muted/40 rounded-lg p-2.5 border border-border/50">
                              <Building2 className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                              <div className="flex flex-col">
                                <span className="font-bold uppercase opacity-80 leading-tight">
                                  {clinic.nombre_abreviado || clinic.nombre}
                                </span>
                                {clinic.ubicaciones?.barrio && (
                                  <span className="text-muted-foreground text-[9px]">
                                    {clinic.ubicaciones.barrio}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      {/* Plan B Clinics */}
                      <div className="space-y-2">
                        {data.planB.length === 0 ? (
                          <div className="text-[10px] text-muted-foreground/50 italic p-2">
                            Sin cobertura en esta zona
                          </div>
                        ) : (
                          data.planB.map((clinic, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-[10px] bg-muted/40 rounded-lg p-2.5 border border-border/50">
                              <Building2 className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                              <div className="flex flex-col">
                                <span className="font-bold uppercase opacity-80 leading-tight">
                                  {clinic.nombre_abreviado || clinic.nombre}
                                </span>
                                {clinic.ubicaciones?.barrio && (
                                  <span className="text-muted-foreground text-[9px]">
                                    {clinic.ubicaciones.barrio}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer CTAs */}
        <div className="p-6 border-t border-border bg-card">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => onWhatsApp(planA.name)}
              className="bg-[#25D366] hover:bg-[#20BD5A] text-white font-black h-14 rounded-2xl shadow-xl transition-all"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              ELEGIR {planA.empresa.toUpperCase()}
            </Button>
            <Button
              onClick={() => onWhatsApp(planB.name)}
              className="bg-[#25D366] hover:bg-[#20BD5A] text-white font-black h-14 rounded-2xl shadow-xl transition-all"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              ELEGIR {planB.empresa.toUpperCase()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
