import React, { useState, useMemo, useCallback, useEffect } from "react";
import { X, Check, MapPin, Swords, Trophy, Shield, Zap, Star, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HealthPlan } from "@/core/interfaces/plan/planes";
import { Clinica } from "@/core/interfaces/plan/clinicas";
import { cn } from "@/lib/utils";

interface ComparisonBattleModalProps {
  plansToCompare: HealthPlan[];
  onRemovePlan: (planId: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mapa de logos de empresas
const EMPRESA_LOGOS: Record<string, string> = {
  "GALENO": "galeno.webp",
  "OSDE": "osde.png",
  "SWISS MEDICAL": "swissmedical.webp",
  "OMINT": "omint.webp",
  "MEDIFE": "medife.webp",
  "SANCOR SALUD": "sancorsalud.webp",
  "PREVENCION SALUD": "prevencion.webp",
  "AVALIAN": "avalian.webp",
  "HOMINIS": "hominis.png",
  "DOCTORED": "doctored.webp",
};

// Animaciones con tipado correcto
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const battleVS: Variants = {
  hidden: { scale: 0, rotate: -180 },
  visible: { 
    scale: 1, 
    rotate: 0, 
    transition: { type: "spring" as const, stiffness: 200, damping: 15, delay: 0.3 }
  }
};

const planCardLeftVariants: Variants = {
  hidden: { x: -100, opacity: 0 },
  visible: { x: 0, opacity: 1 }
};

const planCardRightVariants: Variants = {
  hidden: { x: 100, opacity: 0 },
  visible: { x: 0, opacity: 1 }
};

// Componente de tarjeta de plan en el Battle
const BattlePlanCard = ({ 
  plan, 
  onRemove, 
  isLeft,
  isWinner 
}: { 
  plan: HealthPlan; 
  onRemove: () => void; 
  isLeft: boolean;
  isWinner: boolean;
}) => {
  const logoFile = EMPRESA_LOGOS[plan.empresa];
  
  return (
    <motion.div
      variants={isLeft ? planCardLeftVariants : planCardRightVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "relative flex-1 p-6 rounded-2xl border-2 transition-all duration-300",
        isWinner 
          ? "bg-gradient-to-br from-success/20 via-success/10 to-background border-success shadow-lg shadow-success/20" 
          : "bg-card border-border hover:border-primary/50"
      )}
    >
      {/* Winner Badge */}
      <AnimatePresence>
        {isWinner && (
          <motion.div
            initial={{ scale: 0, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-success text-success-foreground px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg"
          >
            <Trophy className="w-3 h-3" /> MEJOR PRECIO
          </motion.div>
        )}
      </AnimatePresence>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
      >
        <X className="w-4 h-4" />
      </Button>

      {/* Logo */}
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-xl bg-white border border-border flex items-center justify-center p-2 shadow-sm">
          {logoFile ? (
            <img
              src={`${logoFile}`}
              alt={plan.empresa}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-2xl font-bold text-primary">
              {plan.empresa.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Plan Info */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-bold text-foreground line-clamp-2">{plan.name}</h3>
        <p className="text-sm text-muted-foreground">{plan.empresa}</p>
        
        {/* Rating */}
        <div className="flex items-center justify-center gap-1">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-semibold">{plan.rating}</span>
        </div>

        {/* Price */}
        <motion.div 
          className="mt-4"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <p className="text-3xl font-extrabold text-primary">
            ${plan.precio?.toLocaleString('es-AR')}
          </p>
          <p className="text-xs text-muted-foreground">por mes</p>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
          <Shield className="w-4 h-4 text-primary" />
          <span>{plan.clinicas?.length || 0} clínicas</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
          <Zap className="w-4 h-4 text-accent" />
          <span>{plan.linea}</span>
        </div>
      </div>

      {/* CTA */}
      <Button className="w-full mt-4 bg-gradient-accent hover:opacity-90 font-bold shadow-lg">
        Solicitar Este Plan
      </Button>
    </motion.div>
  );
};

// Fila de atributo con animación
const BattleAttributeRow = ({ 
  attrName, 
  plans, 
  getPlanAttributeValue,
  index 
}: {
  attrName: string;
  plans: HealthPlan[];
  getPlanAttributeValue: (plan: HealthPlan, attrName: string) => string;
  index: number;
}) => {
  const values = plans.map(p => getPlanAttributeValue(p, attrName));
  
  return (
    <motion.div
      variants={itemVariants}
      className="grid grid-cols-3 gap-4 py-3 border-b border-border/50 last:border-0"
    >
      <div className="flex items-center justify-end text-right">
        <Badge 
          variant={values[0] === 'N/A' || values[0] === 'No' ? 'secondary' : 'default'}
          className="text-xs"
        >
          {values[0] || 'N/A'}
        </Badge>
      </div>
      
      <div className="flex items-center justify-center">
        <span className="text-xs font-medium text-muted-foreground text-center px-2">
          {attrName}
        </span>
      </div>
      
      <div className="flex items-center justify-start">
        <Badge 
          variant={values[1] === 'N/A' || values[1] === 'No' ? 'secondary' : 'default'}
          className="text-xs"
        >
          {values[1] || 'N/A'}
        </Badge>
      </div>
    </motion.div>
  );
};

// Fila de clínica con animación
const BattleClinicaRow = ({ 
  clinica, 
  plans, 
  planIncludesClinica 
}: {
  clinica: Clinica;
  plans: HealthPlan[];
  planIncludesClinica: (plan: HealthPlan, clinicaId: string) => boolean;
}) => {
  const includes = plans.map(p => planIncludesClinica(p, clinica.item_id));
  
  return (
    <motion.div
      variants={itemVariants}
      className="grid grid-cols-3 gap-4 py-3 border-b border-border/50 last:border-0"
    >
      <div className="flex items-center justify-end">
        {includes[0] ? (
          <div className="flex items-center gap-1 text-success">
            <Check className="w-5 h-5" />
            <span className="text-xs font-medium">Incluido</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-muted-foreground">
            <X className="w-4 h-4" />
            <span className="text-xs">No</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col items-center justify-center text-center">
        <span className="text-sm font-medium text-foreground">{clinica.entity}</span>
        {clinica.ubicacion?.[0] && (
          <span className="text-xs text-muted-foreground">
            {clinica.ubicacion[0].barrio}
          </span>
        )}
      </div>
      
      <div className="flex items-center justify-start">
        {includes[1] ? (
          <div className="flex items-center gap-1 text-success">
            <Check className="w-5 h-5" />
            <span className="text-xs font-medium">Incluido</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-muted-foreground">
            <X className="w-4 h-4" />
            <span className="text-xs">No</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Componente principal
export const ComparisonBattleModal = ({
  plansToCompare,
  onRemovePlan,
  open,
  onOpenChange,
}: ComparisonBattleModalProps) => {
  const [activeTab, setActiveTab] = useState("beneficios");
  const [activeZone, setActiveZone] = useState("todas");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Reset on close
  useEffect(() => {
    if (!open) {
      setActiveTab("beneficios");
      setActiveZone("todas");
      setCollapsedGroups(new Set());
    }
  }, [open]);

  // Determinar ganador por precio
  const winnerIndex = useMemo(() => {
    if (plansToCompare.length !== 2) return -1;
    return plansToCompare[0].precio <= plansToCompare[1].precio ? 0 : 1;
  }, [plansToCompare]);

  // Agrupar atributos
  const groupedAttributes = useMemo(() => {
    const uniqueAttrs = new Map<string, {
      groupName: string;
      groupOrder: number | null;
      attrName: string;
      attrOrder: number | null;
    }>();
    
    plansToCompare.forEach(plan => {
      plan.attributes?.forEach(attr => {
        const groupName = attr.attribute_group_name || 'Otros';
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

    const sortedAttrs = Array.from(uniqueAttrs.values()).sort((a, b) => {
      if (a.groupOrder != null && b.groupOrder != null) {
        if (a.groupOrder !== b.groupOrder) return a.groupOrder - b.groupOrder;
      }
      if (a.attrOrder != null && b.attrOrder != null) {
        return a.attrOrder - b.attrOrder;
      }
      return a.attrName.localeCompare(b.attrName);
    });

    const groups: Record<string, string[]> = {};
    sortedAttrs.forEach(attr => {
      if (!groups[attr.groupName]) groups[attr.groupName] = [];
      groups[attr.groupName].push(attr.attrName);
    });

    return groups;
  }, [plansToCompare]);

  const getPlanAttributeValue = useCallback((plan: HealthPlan, attrName: string): string => {
    const attr = plan.attributes?.find(a => a.name === attrName);
    return attr ? attr.value_name : 'N/A';
  }, []);

  // Clínicas únicas
  const uniqueClinicas = useMemo(() => {
    const clinicaMap = new Map<string, Clinica>();
    plansToCompare.forEach(plan => {
      plan.clinicas?.forEach(clinica => {
        if (!clinicaMap.has(clinica.item_id)) {
          clinicaMap.set(clinica.item_id, clinica);
        }
      });
    });
    return Array.from(clinicaMap.values()).sort((a, b) => 
      (a.entity || '').localeCompare(b.entity || '')
    );
  }, [plansToCompare]);

  // Regiones
  const regions = useMemo(() => {
    const regionSet = new Set<string>();
    uniqueClinicas.forEach(clinica => {
      clinica.ubicacion?.forEach(ub => {
        if (ub.region) regionSet.add(ub.region);
      });
    });
    return Array.from(regionSet).sort();
  }, [uniqueClinicas]);

  const getClinicasByRegion = useCallback((region: string): Clinica[] => {
    return uniqueClinicas.filter(clinica =>
      clinica.ubicacion?.some(ub => ub.region === region)
    );
  }, [uniqueClinicas]);

  const planIncludesClinica = useCallback((plan: HealthPlan, clinicaId: string): boolean => {
    return plan.clinicas?.some(c => c.item_id === clinicaId) ?? false;
  }, []);

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupName)) next.delete(groupName);
      else next.add(groupName);
      return next;
    });
  };

  const clinicasToShow = activeZone === "todas" 
    ? uniqueClinicas 
    : getClinicasByRegion(activeZone);

  if (plansToCompare.length < 2) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 flex flex-col bg-background overflow-hidden">
        {/* Header con gradiente */}
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
          <DialogTitle className="flex items-center justify-center gap-3 text-xl font-bold">
            <Swords className="w-6 h-6 text-primary" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Comparación Battle
            </span>
            <Swords className="w-6 h-6 text-accent transform scale-x-[-1]" />
          </DialogTitle>
        </DialogHeader>

        {/* Battle Arena - Planes */}
        <motion.div 
          className="px-6 py-4 flex items-center gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Plan 1 */}
          <BattlePlanCard
            plan={plansToCompare[0]}
            onRemove={() => onRemovePlan(plansToCompare[0]._id)}
            isLeft={true}
            isWinner={winnerIndex === 0}
          />

          {/* VS Badge */}
          <motion.div
            variants={battleVS}
            className="shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-xl"
          >
            <span className="text-xl font-black text-white">VS</span>
          </motion.div>

          {/* Plan 2 */}
          <BattlePlanCard
            plan={plansToCompare[1]}
            onRemove={() => onRemovePlan(plansToCompare[1]._id)}
            isLeft={false}
            isWinner={winnerIndex === 1}
          />
        </motion.div>

        {/* Tabs para Beneficios/Clínicas */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="mx-6 mb-2 w-auto justify-center bg-muted/50 p-1 rounded-full">
            <TabsTrigger 
              value="beneficios" 
              className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              ⚔️ Beneficios
            </TabsTrigger>
            <TabsTrigger 
              value="clinicas"
              className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              🏥 Clínicas
            </TabsTrigger>
          </TabsList>

          {/* Tab de Beneficios */}
          <TabsContent value="beneficios" className="flex-1 overflow-hidden m-0 px-6 pb-6">
            <ScrollArea className="h-full rounded-xl border border-border bg-card/50">
              <motion.div 
                className="p-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {Object.entries(groupedAttributes).map(([groupName, attrs]) => (
                  <div key={groupName} className="mb-4">
                    {/* Group Header */}
                    <button
                      onClick={() => toggleGroup(groupName)}
                      className="w-full flex items-center justify-between py-3 px-4 bg-primary/10 rounded-lg mb-2 hover:bg-primary/20 transition-colors"
                    >
                      <span className="font-bold text-primary">{groupName}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {attrs.length} atributos
                        </Badge>
                        {collapsedGroups.has(groupName) ? (
                          <ChevronDown className="w-4 h-4 text-primary" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </button>

                    {/* Attributes */}
                    <AnimatePresence>
                      {!collapsedGroups.has(groupName) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          {attrs.map((attrName, idx) => (
                            <BattleAttributeRow
                              key={attrName}
                              attrName={attrName}
                              plans={plansToCompare}
                              getPlanAttributeValue={getPlanAttributeValue}
                              index={idx}
                            />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </motion.div>
            </ScrollArea>
          </TabsContent>

          {/* Tab de Clínicas */}
          <TabsContent value="clinicas" className="flex-1 overflow-hidden m-0 flex flex-col px-6 pb-6">
            {/* Zone Filter */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium shrink-0">
                <MapPin className="w-4 h-4" />
                Zona:
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveZone("todas")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                  activeZone === "todas"
                    ? "bg-primary text-primary-foreground border-transparent shadow-lg"
                    : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                )}
              >
                Todas ({uniqueClinicas.length})
              </motion.button>

              {regions.map(region => (
                <motion.button
                  key={region}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveZone(region)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                    activeZone === region
                      ? "bg-primary text-primary-foreground border-transparent shadow-lg"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                  )}
                >
                  {region} ({getClinicasByRegion(region).length})
                </motion.button>
              ))}
            </div>

            {/* Clinicas List */}
            <ScrollArea className="flex-1 rounded-xl border border-border bg-card/50">
              <motion.div
                className="p-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {clinicasToShow.length > 0 ? (
                  clinicasToShow.map((clinica) => (
                    <BattleClinicaRow
                      key={clinica.item_id}
                      clinica={clinica}
                      plans={plansToCompare}
                      planIncludesClinica={planIncludesClinica}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No se encontraron clínicas en esta zona.
                  </div>
                )}
              </motion.div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ComparisonBattleModal;
