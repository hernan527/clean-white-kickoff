import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomePlanCard, HomePlanData } from "./HomePlanCard";
import { HomeComparisonModal } from "./HomeComparisonModal";
import { cn } from "@/lib/utils";

// Sample plan data - replace with API data
const SAMPLE_PLANS: HomePlanData[] = [
  {
    id: "1",
    name: "Plan 220",
    empresa: "Galeno",
    logo: "galeno.webp",
    price: 89000,
    originalPrice: 115000,
    attributes: ["Hab. Individual", "Sin Copago", "Emergencias 24hs"],
    clinics: ["Hospital Italiano", "Sanatorio Güemes", "Trinidad"],
    copago: false,
  },
  {
    id: "2",
    name: "SMG 30",
    empresa: "Swiss Medical",
    logo: "swissmedical.webp",
    price: 95000,
    originalPrice: 120000,
    attributes: ["Hab. Compartida", "Odontología", "Cobertura Internacional"],
    clinics: ["Clínica Favaloro", "Sanatorio Otamendi"],
    copago: true,
  },
  {
    id: "3",
    name: "Plan 310",
    empresa: "OSDE",
    logo: "osde.png",
    price: 120000,
    originalPrice: 150000,
    attributes: ["Hab. Individual", "PMI", "Sin Carencias"],
    clinics: ["Hospital Alemán", "Fleni", "Hospital Británico"],
    copago: false,
  },
  {
    id: "4",
    name: "Omint 4500",
    empresa: "Omint",
    logo: "omint.webp",
    price: 110000,
    originalPrice: 140000,
    attributes: ["Premium", "Hab. Suite", "Viajero Plus"],
    clinics: ["Sanatorio Güemes", "Trinidad Palermo"],
    copago: false,
  },
  {
    id: "5",
    name: "Azul 3000",
    empresa: "Medife",
    logo: "medife.webp",
    price: 75000,
    originalPrice: 95000,
    attributes: ["Cobertura Básica", "Odontología", "Urgencias"],
    clinics: ["Hospital Italiano", "Clínica del Valle"],
    copago: true,
  },
  {
    id: "6",
    name: "Plan 3500",
    empresa: "Sancor Salud",
    logo: "sancorsalud.webp",
    price: 72000,
    originalPrice: 90000,
    attributes: ["Hab. Compartida", "Maternidad", "Pediatría"],
    clinics: ["Sanatorio Central", "Hospital Regional"],
    copago: true,
  },
];

const WHATSAPP_NUMBER = "5491112345678"; // Cambiar por número real

export const PlansSection = () => {
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  const togglePlan = (planId: string) => {
    setSelectedPlans((prev) => {
      if (prev.includes(planId)) {
        return prev.filter((id) => id !== planId);
      }
      if (prev.length >= 2) {
        return [prev[1], planId]; // Replace oldest
      }
      return [...prev, planId];
    });
  };

  // Auto-open modal when 2 plans selected
  useEffect(() => {
    if (selectedPlans.length === 2) {
      const timer = setTimeout(() => setShowModal(true), 300);
      return () => clearTimeout(timer);
    }
  }, [selectedPlans]);

  const selectedPlanData = selectedPlans
    .map((id) => SAMPLE_PLANS.find((p) => p.id === id))
    .filter(Boolean) as HomePlanData[];

  const handleWhatsApp = (planName?: string) => {
    const message = planName
      ? `Hola! Me interesa cotizar el plan ${planName}. ¿Podrían darme más información?`
      : `Hola! Me interesa cotizar planes de salud. ¿Podrían ayudarme?`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const clearSelection = () => {
    setSelectedPlans([]);
    setShowModal(false);
  };

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full filter blur-[100px] opacity-50" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-accent/10 rounded-full filter blur-[100px] opacity-50" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary">PLANES DESTACADOS</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
            Elegí <span className="text-gradient">2 planes</span> y compará
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Seleccioná dos planes para ver una batalla lado a lado. O cotizá directo por WhatsApp.
          </p>
        </motion.div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {SAMPLE_PLANS.map((plan, index) => (
            <HomePlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlans.includes(plan.id)}
              onSelect={() => togglePlan(plan.id)}
              onWhatsApp={() => handleWhatsApp(plan.name)}
              index={index}
            />
          ))}
        </div>

        {/* Floating selection bar */}
        <AnimatePresence>
          {selectedPlans.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
            >
              <div className="bg-card/95 backdrop-blur-lg border border-border rounded-2xl shadow-2xl p-4 flex items-center gap-4">
                {/* Selected plans */}
                <div className="flex items-center gap-3">
                  {selectedPlanData.map((plan, idx) => (
                    <motion.div
                      key={plan.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="relative"
                    >
                      <div className="w-12 h-12 bg-white rounded-xl p-1.5 shadow-md border border-border">
                        <img
                          src={`/assets/images/card-header/${plan.logo}`}
                          alt={plan.empresa}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <button
                        onClick={() => togglePlan(plan.id)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs"
                      >
                        <X size={12} />
                      </button>
                    </motion.div>
                  ))}

                  {/* VS badge or empty slot */}
                  {selectedPlans.length === 2 ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center"
                    >
                      <span className="text-sm font-black text-white">VS</span>
                    </motion.div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                      <span className="text-muted-foreground text-lg">+</span>
                    </div>
                  )}
                </div>

                {/* Action button */}
                <Button
                  onClick={() => selectedPlans.length === 2 && setShowModal(true)}
                  disabled={selectedPlans.length < 2}
                  className={cn(
                    "font-bold h-12 px-6 rounded-xl transition-all",
                    selectedPlans.length === 2
                      ? "bg-gradient-cta text-white shadow-lg"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Scale className="w-4 h-4 mr-2" />
                  {selectedPlans.length === 2 ? "¡Batalla!" : `${selectedPlans.length}/2 seleccionados`}
                </Button>

                {/* Clear button */}
                <button
                  onClick={clearSelection}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Limpiar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Comparison modal */}
      <HomeComparisonModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        plans={selectedPlanData}
        onWhatsApp={handleWhatsApp}
      />
    </section>
  );
};
