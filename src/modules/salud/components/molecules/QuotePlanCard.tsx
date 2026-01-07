import { Check, MessageCircle, Star, Building2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuotePlanCardProps {
  name: string;
  empresa: string;
  precio: number;
  isRecommended?: boolean; // Para destacar uno
}

// Mapeo de logos (Reutilizamos el que ya tienes)
const EMPRESA_LOGOS: Record<string, string> = {
  "Swiss Medical": "swissmedical.webp",
  "Galeno": "galeno.webp",
  "OSDE": "osde.png",
  "Omint": "omint.webp",
  "Sancor Salud": "sancorsalud.webp",
  // ... resto
};

export const QuotePlanCard = ({ name, empresa, precio, isRecommended }: QuotePlanCardProps) => {
  
  const formatCurrency = (val: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
  const logoFile = EMPRESA_LOGOS[empresa] || EMPRESA_LOGOS[Object.keys(EMPRESA_LOGOS).find(k => empresa.includes(k)) || ""];

  // Link de WhatsApp pre-armado
  const whatsappLink = `https://wa.me/5491100000000?text=Hola,%20me%20interesa%20el%20plan%20${name}%20de%20${empresa}%20que%20vi%20en%20la%20cotización.`;

  return (
    <div className={`relative bg-card rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col md:flex-row
        ${isRecommended 
            ? 'border-accent/50 shadow-xl scale-[1.02] md:scale-105 z-10 ring-4 ring-accent/10' 
            : 'border-border shadow-sm hover:shadow-md'
        }
    `}>
      
      {/* Badge Recomendado */}
      {isRecommended && (
        <div className="bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest text-center py-1 md:absolute md:top-6 md:-left-8 md:w-32 md:-rotate-45 md:shadow-md">
            Recomendado
        </div>
      )}

      {/* 1. LOGO & INFO */}
      <div className="p-6 flex-1 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border">
        <div className="flex items-center gap-4 mb-4">
            <div className="h-14 w-14 bg-white rounded-xl flex items-center justify-center p-2 border border-border/50 shadow-sm">
                {logoFile ? (
                    <img src={`/assets/imagenes/card-header/${logoFile}`} alt={empresa} className="h-full w-full object-contain" />
                ) : (
                    <span className="font-bold text-muted-foreground text-xs">{empresa}</span>
                )}
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-900">{name}</h3>
                <p className="text-sm text-slate-500">{empresa}</p>
            </div>
        </div>
        
        {/* Features Rápidos (Simulados para visual) */}
        <div className="flex gap-2 flex-wrap">
            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md border border-blue-100 flex items-center gap-1">
                <Building2 size={10} /> Sanatorios Top
            </span>
            <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-md border border-green-100 flex items-center gap-1">
                <ShieldCheck size={10} /> Cobertura Total
            </span>
        </div>
      </div>

      {/* 2. PRECIO & ACCIÓN */}
      <div className="p-6 bg-slate-50/50 md:w-72 flex flex-col justify-center items-center text-center">
        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Cuota Mensual</p>
        <div className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
            {formatCurrency(precio)}
        </div>
        
        <Button 
            className={`w-full font-bold rounded-xl h-12 shadow-lg transition-all active:scale-95 gap-2
                ${isRecommended ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200' : 'bg-slate-900 hover:bg-slate-800 text-white'}
            `}
            onClick={() => window.open(whatsappLink, '_blank')}
        >
            <MessageCircle size={18} />
            {isRecommended ? 'Quiero este Plan' : 'Consultar Plan'}
        </Button>
      </div>

    </div>
  );
};