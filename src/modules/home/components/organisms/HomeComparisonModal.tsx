import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Trophy, Check, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { HomePlanData } from "./HomePlanCard";
import { useState, useEffect, useMemo } from "react";

interface HomeComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: HomePlanData[];
  onWhatsApp: (planName: string) => void;
}

export const HomeComparisonModal = ({ isOpen, onClose, plans, onWhatsApp }: HomeComparisonModalProps) => {
  // 1. PRIMERO LOS HOOKS (SIEMPRE)
  // Aunque plans esté vacío, el Hook se debe ejecutar
  const clinicsByZone = useMemo(() => {
    if (!plans || plans.length < 2) return {};

    const [planA, planB] = plans;
    const zones: Record<string, { planA: string[], planB: string[] }> = {};

    const processPlan = (plan: HomePlanData, side: 'planA' | 'planB') => {
      plan.clinics?.forEach((clinicName: string) => {
        const zone = "Cobertura General"; 
        if (!zones[zone]) zones[zone] = { planA: [], planB: [] };
        zones[zone][side].push(clinicName);
      });
    };

    processPlan(planA, 'planA');
    processPlan(planB, 'planB');
    return zones;
  }, [plans]);

  // 2. RECIÉN AHORA EL RETURN TEMPRANO
  // Si no hay suficientes planes, no mostramos nada, pero los Hooks ya corrieron
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] md:max-h-[90vh] overflow-hidden p-0 bg-background border-border shadow-2xl">
        
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
            <TabsTrigger value="beneficios" className="font-black text-xs uppercase data-[state=active]:text-primary">Beneficios</TabsTrigger>
            <TabsTrigger value="clinicas" className="font-black text-xs uppercase data-[state=active]:text-primary">Sanatorios</TabsTrigger>
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
              {Object.entries(clinicsByZone).map(([zone, data]) => (
                <div key={zone} className="mb-8">
                  <div className="flex items-center gap-2 mb-4 border-l-4 border-primary pl-3">
                    <h4 className="font-black text-foreground uppercase text-[10px] tracking-widest">{zone}</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      {data.planA.map((clinic, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[10px] bg-muted/40 rounded-lg p-2.5 border border-border/50">
                          <Building2 className="w-3 h-3 text-primary shrink-0" />
                          <span className="font-bold uppercase opacity-80">{clinic}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {data.planB.map((clinic, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[10px] bg-muted/40 rounded-lg p-2.5 border border-border/50">
                          <Building2 className="w-3 h-3 text-primary shrink-0" />
                          <span className="font-bold uppercase opacity-80">{clinic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
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