import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Scale, Check, Building2, Stethoscope, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { normalizeLogoPath } from "@/lib/supabase-helpers";

// Rotating taglines for each plan
const TAGLINES = [
  "Sin letra chica",
  "Atención 24/7",
  "Cobertura nacional",
  "Mejor precio garantizado",
  "Sin carencias",
  "Alta inmediata",
];

export interface HomePlanData {
  id: string;
  name: string;
  item_id: string;
  empresa: string;
  logo: string;
  price: number;
  originalPrice: number;
  attributes: string[];
  clinics: string[];
  copago: boolean;
}

interface HomePlanCardProps {
  plan: HomePlanData;
  isSelected: boolean;
  onSelect: () => void;
  onWhatsApp: () => void;
  index: number;
}

const WHATSAPP_NUMBER = "5491112345678"; // Cambiar por número real

export const HomePlanCard = ({ plan, isSelected, onSelect, onWhatsApp, index }: HomePlanCardProps) => {
  const [currentTagline, setCurrentTagline] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTagline((prev) => (prev + 1) % TAGLINES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const discount = Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);

  const getFeatureIcon = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes("sanatorio") || t.includes("hospital")) return <Building2 size={12} className="text-primary" />;
    if (t.includes("odonto")) return <Stethoscope size={12} className="text-secondary" />;
    return <Check size={12} className="text-primary" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={cn(
        "group relative bg-card border-2 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2",
        isSelected 
          ? "border-primary shadow-xl shadow-primary/20 ring-2 ring-primary/30" 
          : "border-border hover:border-primary/50"
      )}
    >
      {/* Selected indicator */}
      {isSelected && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 z-20 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg"
        >
          <Check className="w-5 h-5 text-primary-foreground" strokeWidth={3} />
        </motion.div>
      )}

      {/* Header with logo */}
      <div className="h-20 flex items-center justify-center p-4 bg-muted/30 border-b border-border">
        <div className="bg-white rounded-xl p-2 shadow-sm border border-border/50 transition-transform group-hover:scale-110">
          <img
            src={normalizeLogoPath(plan.logo)}
            alt={plan.empresa}
            className="h-10 w-auto object-contain"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Plan name */}
        <h3 className="font-bold text-lg text-foreground leading-tight mb-1">{plan.name}</h3>
        
        {/* Rotating tagline */}
        <div className="h-5 overflow-hidden mb-4">
          <motion.p
            key={currentTagline}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="text-xs text-primary flex items-center gap-1"
          >
            <Sparkles size={12} /> {TAGLINES[currentTagline]}
          </motion.p>
        </div>

        {/* Attributes */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {plan.attributes.slice(0, 3).map((attr, idx) => (
            <span
              key={idx}
              className="px-2 py-1 rounded-md text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1"
            >
              {getFeatureIcon(attr)} {attr}
            </span>
          ))}
        </div>

        {/* Clinic badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {plan.clinics.slice(0, 2).map((clinic, idx) => (
            <span
              key={idx}
              className="px-2 py-1 rounded-md text-[10px] font-medium bg-muted text-muted-foreground border border-border"
            >
              {clinic}
            </span>
          ))}
          {plan.clinics.length > 2 && (
            <span className="px-2 py-1 rounded-md text-[10px] font-medium bg-muted text-muted-foreground border border-border">
              +{plan.clinics.length - 2} más
            </span>
          )}
        </div>

        {/* Price section */}
        <div className="border-t border-border pt-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-destructive/70 line-through">{formatCurrency(plan.originalPrice)}</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-foreground">{formatCurrency(plan.price)}</span>
                <span className="text-xs text-muted-foreground">/mes</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
              -{discount}% OFF
            </span>
          </div>
          <span className={cn(
            "inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase",
            plan.copago 
              ? "bg-muted text-muted-foreground" 
              : "bg-success/10 text-success border border-success/20"
          )}>
            {plan.copago ? "Con Copago" : "Copago $0"}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            onClick={onWhatsApp}
            className="flex-1 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold h-11 rounded-xl text-sm shadow-lg transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Cotizar
          </Button>
          <button
            onClick={onSelect}
            className={cn(
              "w-12 h-11 rounded-xl border flex items-center justify-center transition-all",
              isSelected
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-muted border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            <Scale size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
