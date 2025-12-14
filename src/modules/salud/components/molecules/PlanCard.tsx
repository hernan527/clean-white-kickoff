import { useRef, useCallback } from "react";
import { Check, ShoppingCart, Scale, Building2, Stethoscope, Plane, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button"; 
import type { HealthPlan } from "@/core/interfaces/plan/planes";

interface PlanCardProps {
  plan: HealthPlan;
  viewMode: "grid" | "list";
  isInComparison: boolean;
  onToggleComparison: (planId: string) => void;
  onOpenDetails: (plan: HealthPlan) => void;
  isRecommended?: boolean;
  highlightClinic?: string;
}

// Map logos
const EMPRESA_LOGOS: Record<string, string> = {
  "Swiss Medical": "swissmedical.webp",
  "Swiss-Medical": "swissmedical.webp",
  "Galeno": "galeno.webp",
  "OSDE": "osde.png",
  "Omint": "omint.webp",
  "Medife": "medife.webp",
  "Sancor Salud": "sancorsalud.webp",
  "Avalian": "avalian.webp",
  "Hominis": "hominis.png",
  "Salud Central": "saludcentral.webp",
  "Doctored": "doctored.webp",
  "Premedic": "premedic.webp"
};

const KEY_CLINICS = ["Hospital Italiano", "Clínica Favaloro", "Sanatorio Güemes", "Maternidad Suizo", "Trinidad", "Sanatorio Otamendi"];

export const PlanCard = ({
  plan,
  viewMode,
  isInComparison,
  onToggleComparison,
  onOpenDetails,
  isRecommended = false,
  highlightClinic
}: PlanCardProps) => {

  const includedKeyClinics = KEY_CLINICS.filter(keyClinic => 
    plan.clinicas?.some(c => c.entity?.toLowerCase().includes(keyClinic.toLowerCase()))
  );
  
  const isBestValue = isRecommended || plan.rating >= 4.5;
  const priceFinal = plan.precio || 0;
  const priceOriginal = (plan as any).priceOriginal || Math.round(priceFinal * 1.22); 
  const discount = Math.round(((priceOriginal - priceFinal) / priceOriginal) * 100);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);

  const getBannerConfig = () => {
    if (isBestValue) {
      return { text: "MÁS ELEGIDO", className: "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white" };
    }
    return null;
  };
  const banner = getBannerConfig();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCompareClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComparison(plan._id);
  }, [isInComparison, plan._id, onToggleComparison]);

  // Helper iconos visuales
  const getFeatureIcon = (text: string) => {
      const t = text.toLowerCase();
      if(t.includes('sanatorio') || t.includes('hospital')) return <Building2 size={12} className="text-cyan-400" />;
      if(t.includes('odonto')) return <Stethoscope size={12} className="text-emerald-400" />;
      if(t.includes('viajero')) return <Plane size={12} className="text-violet-400" />;
      if(t.includes('hab')) return <BedDouble size={12} className="text-slate-400" />;
      return <Check size={12} className="text-cyan-400" />;
  };

  const getFeatureStyle = (text: string) => {
      const t = text.toLowerCase();
      if(t.includes('sanatorio') || t.includes('hospital')) return "bg-cyan-500/10 text-cyan-300 border-cyan-500/20";
      if(t.includes('odonto')) return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
      if(t.includes('viajero')) return "bg-violet-500/10 text-violet-300 border-violet-500/20";
      return "bg-white/5 text-slate-300 border-white/10";
  };

  return (
    <div 
      ref={cardRef}
      className={`group relative w-full glassmorphism rounded-3xl border border-white/10 shadow-xl shadow-black/20 transition-all duration-300 flex flex-col overflow-hidden hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1 hover:border-white/20
        ${viewMode === "list" ? "md:flex-row md:items-stretch" : ""}
      `}
    >
      {banner && (
        <div className={`absolute top-0 left-0 text-[10px] font-bold px-3 py-1.5 rounded-br-xl rounded-tl-2xl z-20 uppercase tracking-wide shadow-lg ${banner.className}`}>
          {banner.text}
        </div>
      )}

      {/* HEADER LOGO */}
      <div className={`h-24 flex items-center justify-center p-4 border-b border-white/5 relative bg-white/5 ${viewMode === 'list' ? 'md:w-56 md:border-r md:border-b-0' : ''}`}>
         <div className="flex items-center gap-2 transform transition-transform group-hover:scale-105 duration-300">
           {EMPRESA_LOGOS[plan.empresa] ? (
              <img src={`/assets/images/card-header/${EMPRESA_LOGOS[plan.empresa]}`} alt={plan.empresa} className="h-10 w-auto object-contain brightness-110" />
           ) : (
              <span className="text-xl font-bold text-white">{plan.empresa}</span>
           )}
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="p-5 flex flex-col flex-grow relative">
        <div className="flex justify-between items-start mb-1">
            <div>
                <h3 className="font-bold text-xl text-white leading-tight">{(plan as any).nombre || plan.name}</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">{plan.linea} • Cartilla Global</p>
            </div>
            <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${plan.copagos ? 'bg-white/5 text-slate-400 border border-white/10' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                {plan.copagos ? 'Con Copagos' : 'Copago $0'}
            </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 mb-6">
            {includedKeyClinics.length > 0 ? (
                includedKeyClinics.slice(0, 2).map((clinic, idx) => (
                    <span key={idx} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 ${getFeatureStyle(clinic)}`}>
                        {getFeatureIcon(clinic)} {clinic}
                    </span>
                ))
            ) : (
                plan.attributes?.slice(0, 2).map((attr, idx) => (
                     <span key={idx} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 ${getFeatureStyle(attr.name)}`}>
                        {getFeatureIcon(attr.name)} {attr.name}
                    </span>
                ))
            )}
             <span className="px-2.5 py-1.5 rounded-lg bg-white/5 text-slate-400 border border-white/10 text-[11px] font-bold flex items-center gap-1.5">
                <Check size={12} /> + Beneficios
            </span>
        </div>

        <div className="border-t border-white/5 my-auto"></div>

        <div className={`pt-4 ${viewMode === 'list' ? 'md:flex md:justify-between md:items-end' : ''}`}>
            <div className="mb-4 md:mb-0">
                <div className="text-xs text-red-400/70 line-through font-medium mb-0.5 ml-1">{formatCurrency(priceOriginal)}</div>
                <div className="flex items-center gap-2">
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-white">{formatCurrency(priceFinal)}</span>
                        <span className="text-xs text-slate-500 font-medium">/mes</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">-{discount}% OFF</span>
                </div>
            </div>

            <div className="flex gap-3 items-center mt-4">
                <Button 
                    onClick={() => onOpenDetails(plan)}
                    className={`flex-1 font-bold h-11 rounded-xl text-sm shadow-lg transition-all active:scale-95 ${isBestValue ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-violet-500/25' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'}`}
                >
                    Ver Detalle
                </Button>
                <button onClick={handleCompareClick} className="group/compare flex flex-col items-center justify-center w-14 gap-1 cursor-pointer">
                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${isInComparison ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-white/5 border-white/10 text-slate-500 group-hover/compare:border-white/30 group-hover/compare:text-slate-300'}`}>
                        {isInComparison ? <Check size={18} strokeWidth={3} /> : <Scale size={18} />}
                    </div>
                    <span className="text-[9px] font-medium text-slate-500">Comparar</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
