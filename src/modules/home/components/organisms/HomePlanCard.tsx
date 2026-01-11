/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, 
  Scale, 
  Check, 
  Building2, 
  Sparkles, 
  Bed, 
  Brain, 
  Glasses, 
  Smile, 
  Video, 
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { normalizeLogoPath } from "@/lib/supabase-helpers";
import React from "react";

export const featureIcons: Record<string, { icon: any; color: string; bg: string }> = {
  "Habitación Individual": { icon: Bed, color: "text-blue-600", bg: "bg-blue-50" },
  "Habitación VIP": { icon: Sparkles, color: "text-indigo-600", bg: "bg-indigo-50" },
  "Ortodoncia": { icon: Smile, color: "text-purple-600", bg: "bg-purple-50" },
  "Bruxismo": { icon: ShieldCheck, color: "text-orange-600", bg: "bg-orange-50" },
  "Óptica": { icon: Glasses, color: "text-emerald-600", bg: "bg-emerald-50" },
  "Salud Mental": { icon: Brain, color: "text-pink-600", bg: "bg-pink-50" },
  "Video Consulta": { icon: Video, color: "text-cyan-600", bg: "bg-cyan-50" },
  "Médico a Domicilio": { icon: Building2, color: "text-slate-600", bg: "bg-slate-50" },
};


export interface ClinicData {
  id?: number;
  nombre: string;
  nombre_abreviado?: string;
  ubicaciones?: {
    barrio?: string;
    region?: string;
    direccion?: string;
  };
}

export interface HomePlanData {
  id: string;
  name: string;
  precio_total: number;
  precio_lista: number;
  valor_aporte?: number;
  item_id: string;
  empresa: string;
  precio_final?: number;
  empresas: {
    nombre: string;
    logo_url: string;
    slogan?: string; // Lo que arreglamos antes
  };
  logo: string;
  price: number;
  originalPrice: number;
  attributes: string[];
  slogans?: string[]; // Propiedad necesaria para el Sparkles
  clinics: string[];
  clinicsData: ClinicData[];
  copago: boolean;
  modalidad?: 'P' | 'D';
  plan_prestacion?: any[];
  beneficios?: any[];

}

interface HomePlanCardProps {
  plan: HomePlanData;
  isSelected: boolean;
  onSelect: () => void;
  onWhatsApp: () => void;
  index: number;
}


export const HomePlanCard = ({ plan, isSelected, onWhatsApp, onSelect, index }: HomePlanCardProps) => {
  const [currentTagline, setCurrentTagline] = useState(0);
// 1. Definimos el límite de ítems a mostrar inicialmente

  const [expanded, setExpanded] = useState(false);// 1. Extraemos los beneficios de forma segura
  // Si tu relación en Supabase se llama plan_prestacion, usamos eso
// 1. Extraemos la data real de la relación
const listaReal = plan.plan_prestacion || [];

// 2. Filtramos solo las que marcaste para mostrar en la Card (listar === true)
const prestacionesFiltradas = listaReal.filter((p: any) => p.listar === true);

const limit = 4;
const mostrarPrestaciones = expanded ? prestacionesFiltradas : prestacionesFiltradas.slice(0, limit);
const TAGLINES = useMemo(() => {
    // 1. Limpiamos los slogans que vienen de la DB
    const validSlogans = (plan.slogans || []).filter(s => s && s.trim() !== "");

    // 2. Si no hay nada en la DB, mostramos backups de MARKETING
    if (validSlogans.length === 0) {
      return ["Cobertura Nacional", "Atención 24/7", "Tu salud en buenas manos"];
    }

    return validSlogans;
  }, [plan.slogans]);

  useEffect(() => {
    if (TAGLINES.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentTagline((prev) => (prev + 1) % TAGLINES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [TAGLINES]);

  const discount = Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", { 
      style: "currency", 
      currency: "ARS", 
      maximumFractionDigits: 0 
    }).format(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={cn(
        "group relative bg-card border-2 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full",
        isSelected 
          ? "border-primary shadow-xl shadow-primary/20 ring-2 ring-primary/30" 
          : "border-border hover:border-primary/50"
      )}
    >
      {/* Badge Modalidad */}
      <div className="absolute top-3 left-3 z-20">
        <Badge className={cn(
          "px-2 py-0.5 text-[10px] uppercase font-black border-none",
          plan.modalidad === 'D' ? "bg-green-500 text-white" : "bg-blue-600 text-white shadow-sm"
        )}>
          Mod. {plan.modalidad || 'P'}
        </Badge>
      </div>

      {/* Header Logo */}
      <div className="h-24 flex items-center justify-center p-4 bg-muted/20 border-b border-border/50">
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-border/50 transition-transform group-hover:scale-105">
          <img
            src={normalizeLogoPath(plan.logo)}
            alt={plan.empresa}
            className="h-10 w-auto object-contain"
          />
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Nombre y Tagline Rotativo */}
        <div className="mb-4">
          <h3 className="font-black text-lg text-foreground leading-tight">{plan.name}</h3>
          <div className="h-4 overflow-hidden mt-1">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentTagline}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                className="text-[10px] text-primary font-bold flex items-center gap-1 uppercase tracking-wider"
              >
                <Sparkles size={10} /> {TAGLINES[currentTagline]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Prestaciones Médicas (Attributes) - Filtrando slogans para que no se repitan */}
      {/* Prestaciones Médicas - Usando data real del objeto */}
<div className="space-y-2 mb-4">
  {plan.plan_prestacion
    ?.filter((pp: any) => pp.listar === true)
    .slice(0, 4) // Solo mostramos los primeros 4
    .map((item: any, idx: number) => {
      const maestra = item?.prestaciones_maestras;
      const nombre = maestra?.nombre;
      const emoji = maestra?.icono_emoji || "✅";
      const valor = item?.valor;

      // 🔍 Mantenemos tu lógica de Lucide para los colores/iconos si existen
      const entry = Object.entries(featureIcons).find(([key]) => 
        nombre?.toLowerCase().includes(key.toLowerCase())
      );
      
      const iconData = entry ? entry[1] : { icon: null, color: "text-slate-500", bg: "bg-slate-50" };
      const Icon = iconData.icon;

      return (
        <div key={idx} className={cn("flex items-center justify-between gap-2 p-1.5 rounded-xl border border-slate-50 transition-all", iconData.bg)}>
          <div className="flex items-center gap-2 overflow-hidden">
            {/* Si hay Icono de Lucide lo usa, si no, usa el Emoji del JSON */}
            <div className={cn("p-1.5 rounded-lg bg-white shadow-sm shrink-0 flex items-center justify-center w-7 h-7", iconData.color)}>
              {Icon ? <Icon size={14} /> : <span className="text-sm">{emoji}</span>}
            </div>
            
            <span className="text-[10px] font-bold text-slate-700 truncate uppercase">
              {nombre}
            </span>
          </div>

          {/* 💰 Valor a la derecha (si existe) */}
          {valor && (
            <span className="text-[9px] font-black text-primary bg-white/50 px-1.5 py-0.5 rounded-md border border-white shrink-0">
              {valor}
            </span>
          )}
        </div>
      );
    })}
</div>

        {/* CLÍNICAS DESTACADAS */}
        <div className="mt-auto">
          <div className="flex flex-wrap gap-1 mb-4">
            {plan.clinicsData?.slice(0, 2).map((clinic, idx) => (
              <Badge key={idx} variant="outline" className="bg-white text-[9px] font-medium py-0 px-2 text-slate-500 border-slate-200">
                <Building2 size={10} className="mr-1" /> {clinic.nombre_abreviado || clinic.nombre}
              </Badge>
            ))}
            {plan.clinicsData && plan.clinicsData.length > 2 && (
              <span className="text-[9px] font-bold text-slate-400 self-center ml-1">+{plan.clinicsData.length - 2} más</span>
            )}
          </div>

          {/* PRECIO */}
          <div className="border-t border-dashed border-border pt-4 mb-4">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[11px] text-destructive/70 line-through font-medium">
                  {formatCurrency(plan.originalPrice)}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-foreground tracking-tighter">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">/mes</span>
                </div>
              </div>
              {discount > 0 && (
                <div className="bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-sm mb-1">
                  {discount}% OFF
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <Badge className={cn(
                "text-[9px] font-black border",
                plan.copago 
                  ? "bg-slate-100 text-slate-500 border-slate-200" 
                  : "bg-green-50 text-green-600 border-green-200"
              )}>
                {plan.copago ? "CON COPAGOS" : "SISTEMA SIN COPAGOS"}
              </Badge>
            </div>
          </div>

          {/* ACCIONES */}
          <div className="flex gap-2">
            <Button
              onClick={(e) => { e.stopPropagation(); onWhatsApp(); }}
              className="flex-1 bg-[#25D366] hover:bg-[#20BD5A] text-white font-black h-12 rounded-2xl text-sm shadow-md transition-all active:scale-95 group/btn"
            >
              <MessageCircle className="w-5 h-5 mr-2 group-hover/btn:animate-bounce" />
              LO QUIERO
            </Button>
            
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
              className={cn(
                "w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all shadow-sm",
                isSelected
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-white border-border text-muted-foreground hover:border-primary/50"
              )}
              title="Comparar"
            >
              <Scale size={20} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};