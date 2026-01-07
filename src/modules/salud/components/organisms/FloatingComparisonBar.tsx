import { ArrowRight } from "lucide-react";
import { HealthPlan } from "@/core/interfaces/plan/planes";

// Mapeo de logos (puedes importarlo de un archivo de constantes si lo prefieres compartido)
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

interface FloatingComparisonBarProps {
  plans: HealthPlan[];
  onCompare: () => void;
}

export const FloatingComparisonBar = ({ plans, onCompare }: FloatingComparisonBarProps) => {
  
  // Si no hay planes o solo hay 1, no mostramos la barra (o puedes mostrarla disabled si prefieres)
  if (plans.length === 0) return null;

  return (
    <div 
      onClick={onCompare}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background px-5 py-3 rounded-full shadow-2xl flex items-center gap-4 z-50 hover:scale-105 transition-all duration-300 cursor-pointer animate-in slide-in-from-bottom-10 fade-in border border-border/50 hover:bg-foreground/90 group"
    >
      {/* --- AVATARES DE LOGOS --- */}
      <div className="flex -space-x-3">
        {plans.map((plan) => {
            const logoFile = EMPRESA_LOGOS[plan.empresa];
            return (
                <div 
                    key={plan._id} 
                    className="w-10 h-10 rounded-full bg-white border-2 border-foreground flex items-center justify-center overflow-hidden relative z-0 hover:z-10 transition-all shadow-sm"
                >
                    {logoFile ? (
                        <img 
                            src={`/assets/imagenes/card-header/${logoFile}`} 
                            alt={plan.empresa} 
                            className="w-full h-full object-contain p-1" 
                        />
                    ) : (
                        <span className="text-[10px] font-bold text-foreground">
                            {plan.empresa.substring(0, 2).toUpperCase()}
                        </span>
                    )}
                </div>
            );
        })}
      </div>

      {/* --- TEXTO INFORMATIVO --- */}
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] text-background/60 font-medium uppercase tracking-wide">Comparando</span>
        <span className="text-sm font-bold text-background">
            {plans.length} {plans.length === 1 ? 'Plan' : 'Planes'}
        </span>
      </div>

      {/* --- SEPARADOR --- */}
      <div className="h-8 w-[1px] bg-background/20 mx-1"></div>

      {/* --- ACCIÓN --- */}
      <div className="flex items-center gap-2 text-sm font-bold text-primary group-hover:text-primary/80 transition-colors">
        Ver Tabla <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
};