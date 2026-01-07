import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Trophy, Check, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { HomePlanData } from "./HomePlanCard";

interface HomeComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: HomePlanData[];
  onWhatsApp: (planName: string) => void;
}

const ZONES = ["CABA", "GBA Norte", "GBA Sur", "GBA Oeste"];

// Sample clinic data by zone
const CLINICS_BY_ZONE: Record<string, string[]> = {
  "CABA": ["Hospital Italiano", "Clínica Favaloro", "Sanatorio Otamendi", "Trinidad Palermo"],
  "GBA Norte": ["Hospital Austral", "Sanatorio San Lucas", "Clínica del Valle"],
  "GBA Sur": ["Hospital Garrahan", "Clínica del Sur", "Sanatorio Modelo"],
  "GBA Oeste": ["Hospital Posadas", "Clínica Occidental", "Sanatorio Central"],
};

export const HomeComparisonModal = ({ isOpen, onClose, plans, onWhatsApp }: HomeComparisonModalProps) => {
  if (plans.length < 2) return null;

  const [planA, planB] = plans;
  const cheaperPlan = planA.price <= planB.price ? "A" : "B";

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);

  const ComparisonRow = ({ label, valueA, valueB, isPrice = false }: { label: string; valueA: string | boolean; valueB: string | boolean; isPrice?: boolean }) => {
    const renderValue = (val: string | boolean, isWinner: boolean) => {
      if (typeof val === "boolean") {
        return val ? (
          <Check className={cn("w-5 h-5", isWinner ? "text-success" : "text-primary")} />
        ) : (
          <X className="w-5 h-5 text-muted-foreground/50" />
        );
      }
      return <span className={cn("font-bold", isWinner && isPrice && "text-success")}>{val}</span>;
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="grid grid-cols-3 gap-4 py-3 border-b border-border/50 items-center"
      >
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="text-center">{renderValue(valueA, isPrice && cheaperPlan === "A")}</div>
        <div className="text-center">{renderValue(valueB, isPrice && cheaperPlan === "B")}</div>
      </motion.div>
    );
  };

  const PlanHeader = ({ plan, isWinner, side }: { plan: HomePlanData; isWinner: boolean; side: "A" | "B" }) => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: side === "A" ? 0.2 : 0.3 }}
      className={cn(
        "relative p-4 rounded-2xl border-2 text-center",
        isWinner
          ? "border-success bg-success/10 shadow-lg shadow-success/20"
          : "border-border bg-card"
      )}
    >
      {isWinner && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="absolute -top-3 left-1/2 -translate-x-1/2 bg-success text-success-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg"
        >
          <Trophy className="w-3 h-3" /> MEJOR PRECIO
        </motion.div>
      )}
      <div className="w-16 h-16 mx-auto bg-white rounded-xl p-2 mb-3 shadow-sm border border-border/50">
        <img src={`/assets/images/card-header/${plan.logo}`} alt={plan.empresa} className="w-full h-full object-contain" />
      </div>
      <h4 className="font-bold text-foreground text-sm mb-1">{plan.name}</h4>
      <p className="text-2xl font-black text-primary">{formatCurrency(plan.price)}</p>
      <p className="text-xs text-muted-foreground">por mes</p>
    </motion.div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 bg-background border-border">
        {/* Header */}
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-black text-foreground">⚔️ Batalla de Planes</h2>
              <p className="text-sm text-muted-foreground">Compará y elegí tu campeón</p>
            </div>
          </div>

          {/* Plan headers */}
          <div className="grid grid-cols-2 gap-4">
            <PlanHeader plan={planA} isWinner={cheaperPlan === "A"} side="A" />
            <PlanHeader plan={planB} isWinner={cheaperPlan === "B"} side="B" />
          </div>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="beneficios" className="flex-1">
          <TabsList className="w-full justify-start px-6 pt-4 bg-transparent">
            <TabsTrigger value="beneficios" className="font-bold">Beneficios</TabsTrigger>
            <TabsTrigger value="clinicas" className="font-bold">Clínicas</TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[40vh] px-6 py-4">
            <TabsContent value="beneficios" className="mt-0">
              <div className="space-y-1">
                <ComparisonRow label="Precio mensual" valueA={formatCurrency(planA.price)} valueB={formatCurrency(planB.price)} isPrice />
                <ComparisonRow label="Copago" valueA={planA.copago ? "Con copago" : "Sin copago"} valueB={planB.copago ? "Con copago" : "Sin copago"} />
                {planA.attributes.map((attr, idx) => (
                  <ComparisonRow
                    key={idx}
                    label={attr}
                    valueA={true}
                    valueB={planB.attributes.includes(attr)}
                  />
                ))}
                {planB.attributes.filter(a => !planA.attributes.includes(a)).map((attr, idx) => (
                  <ComparisonRow
                    key={`b-${idx}`}
                    label={attr}
                    valueA={false}
                    valueB={true}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="clinicas" className="mt-0">
              {ZONES.map((zone) => (
                <div key={zone} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    <h4 className="font-bold text-foreground">{zone}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Plan A clinics */}
                    <div className="space-y-2">
                      {CLINICS_BY_ZONE[zone]?.slice(0, 3).map((clinic, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center gap-2 text-xs bg-muted/50 rounded-lg px-3 py-2"
                        >
                          <Building2 className="w-3 h-3 text-primary" />
                          <span className="text-foreground">{clinic}</span>
                        </motion.div>
                      ))}
                    </div>
                    {/* Plan B clinics */}
                    <div className="space-y-2">
                      {CLINICS_BY_ZONE[zone]?.slice(1, 4).map((clinic, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center gap-2 text-xs bg-muted/50 rounded-lg px-3 py-2"
                        >
                          <Building2 className="w-3 h-3 text-primary" />
                          <span className="text-foreground">{clinic}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer CTAs */}
        <div className="p-6 border-t border-border bg-muted/30">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => onWhatsApp(planA.name)}
              className="bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold h-12 rounded-xl shadow-lg"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Cotizar {planA.empresa}
            </Button>
            <Button
              onClick={() => onWhatsApp(planB.name)}
              className="bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold h-12 rounded-xl shadow-lg"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Cotizar {planB.empresa}
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Un asesor te contactará en menos de 5 minutos
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
