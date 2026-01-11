/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Trophy, Check, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { HomePlanData, ClinicData } from "./HomePlanCard";
import { useMemo } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Badge } from "@/components/ui/badge"; // ✅ Verificá este import
import { Sword } from "lucide-react";
import { featureIcons } from "./HomePlanCard"; // O la ruta correcta a tu archivo
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
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] flex flex-col">
        <VisuallyHidden>
<div className="flex justify-between items-center mb-4">
<div className="sr-only">
    <DialogTitle>Comparativa de Planes</DialogTitle>
    <DialogDescription>
      Detalles y beneficios de {planA.name} y {planB.name}
    </DialogDescription>
  </div>
{/* 🏷️ Badge corregido: Usamos 2 porque el comparador es de a pares */}
    <Badge variant="outline" className="font-bold border-primary text-primary bg-primary/10 uppercase text-[9px]">
      2 Planes en batalla
    </Badge>
      
    </div>          
        </VisuallyHidden>
        
       {/* 📌 CABECERA FIJA ULTRA-COMPACTA */}
<div className="bg-slate-900 px-4 py-3 text-white shrink-0 z-50 border-b border-white/10">
  <div className="flex justify-between items-center mb-3">
    <div className="flex items-center gap-2">
      <span className="text-sm">⚔️</span>
      <h2 className="text-xs font-black tracking-tighter italic uppercase">Batalla de Planes</h2>
    </div>
    <Badge className="bg-primary/20 text-primary border-primary/30 font-black text-[8px] px-2 py-0 h-4 uppercase">
      On the Go
    </Badge>
  </div>

  {/* 🏢 FILA DE COMPARACIÓN COMPACTA */}
  <div className="grid grid-cols-2 gap-3">
    {/* Plan A */}
    <div className="relative flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
      {/* Indicador de Ganador (Precio más bajo) */}
      {cheaperPlan === "A" && (
        <div className="absolute -top-2 -right-1 bg-green-500 text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg animate-bounce">
          MÁS ECONÓMICO
        </div>
      )}
      <div className="h-10 w-10 shrink-0 bg-white rounded-lg p-1 flex items-center justify-center">
        <img src={planA.empresas?.logo_url || planA.logo} alt="" className="max-h-full object-contain" />
      </div>
      <div className="min-w-0">
        <h3 className="text-[10px] font-black text-slate-400 uppercase leading-none truncate">{planA.name}</h3>
        <p className="text-primary font-black text-sm tracking-tighter">${planA.price.toLocaleString()}</p>
      </div>
    </div>

    {/* Plan B */}
    <div className="relative flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
      {cheaperPlan === "B" && (
        <div className="absolute -top-2 -right-1 bg-green-500 text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg animate-bounce">
          MÁS ECONÓMICO
        </div>
      )}
      <div className="h-10 w-10 shrink-0 bg-white rounded-lg p-1 flex items-center justify-center">
        <img src={planB.empresas?.logo_url || planB.logo} alt="" className="max-h-full object-contain" />
      </div>
      <div className="min-w-0">
        <h3 className="text-[10px] font-black text-slate-400 uppercase leading-none truncate">{planB.name}</h3>
        <p className="text-primary font-black text-sm tracking-tighter">${planB.price.toLocaleString()}</p>
      </div>
    </div>
  </div>
</div>
        {/* Cuerpo con Tabs */}
<div className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar rounded-t-[1.5rem] -mt-4 relative z-10">
  <Tabs defaultValue="beneficios" className="w-full flex flex-col">
{/* 📌 EL STICKY LIST: Se queda pegado al bajar */}
    <div className="sticky top-0 bg-white/95 backdrop-blur-md z-40 border-b shadow-sm">
      <TabsList className="w-full justify-around h-11 bg-transparent p-0 gap-0">
        <TabsTrigger 
          value="beneficios" 
          className="flex-1 text-[10px] font-black uppercase h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary transition-all"
        >
          Beneficios
        </TabsTrigger>
        <TabsTrigger 
          value="clinicas" 
          className="flex-1 text-[10px] font-black uppercase h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary transition-all"
        >
          Sanatorios
        </TabsTrigger>
      </TabsList>
    </div>

    <div className="p-3 md:p-6">
<TabsContent value="beneficios" className="mt-0 outline-none">
  <div className="grid grid-cols-2 gap-3">
    
    {/* COLUMNA PLAN A */}
    <div className="space-y-3">
      <div className="text-[10px] font-black text-primary uppercase text-center mb-1 tracking-tighter opacity-70">
        {planA.name}
      </div>  
    <div className="flex flex-col gap-2">
       {console.log("ESTRUCTURA PLAN A:", planA?.plan_prestacion)}
        {console.log("¿Qué tiene planA realmente?:", planA)}
  {(planA.plan_prestacion || []).map((item: any, idx: number) => {
    // 🎯 ACCESO SEGÚN TU JSON:
    const maestra = item?.prestaciones_maestras;
    const nombre = maestra?.nombre;
    const emoji = maestra?.icono_emoji || "✅";
    const valor = item?.valor;

    if (!nombre) return null;

    return (
      <div key={idx} className="flex items-center justify-between bg-white border border-slate-100 rounded-xl p-2.5 shadow-sm min-h-[44px]">
        <div className="flex items-center gap-2 overflow-hidden pl-1">
          {/* EMOJI DIRECTO */}
          <span className="text-base shrink-0">{emoji}</span>

          {/* NOMBRE DIRECTO */}
          <span className="text-[10px] font-black text-slate-700 uppercase leading-tight truncate">
            {nombre}
          </span>
        </div>

        {/* VALOR (Si existe en el JSON) */}
        {valor && valor.trim() !== "" && (
          <span className="text-[9px] font-black text-primary mr-2 shrink-0 bg-primary/5 px-1.5 py-1 rounded-lg border border-primary/10 uppercase">
            {valor}
          </span>
        )}
      </div>
    );
  })}
</div>
    </div>

    {/* COLUMNA PLAN B */}
    <div className="space-y-3 border-l border-slate-100 pl-3">
      <div className="text-[10px] font-black text-slate-500 uppercase text-center mb-1 tracking-tighter opacity-70">
        {planB.name}
      </div>
      <div className="flex flex-col gap-2">
        {(planB.plan_prestacion || planB.beneficios || planB.attributes || []).map((item: any, idx: number) => {
          const maestra = item?.prestaciones_maestras;
          const nombre = typeof item === 'string' ? item : (maestra?.nombre || item?.nombre);
          const emojiDB = maestra?.icono_emoji;
          
          if (!nombre) return null;

          const entry = Object.entries(featureIcons).find(([key]) => 
            nombre.toLowerCase().includes(key.toLowerCase())
          );
          
          const iconData = entry ? entry[1] : null;
          const Icon = iconData?.icon;
          const valor = typeof item === 'object' ? item?.valor : null;

          return (
            <div key={idx} className="flex items-center justify-between bg-white border border-slate-100 rounded-xl p-2.5 shadow-sm min-h-[48px]">
              <div className="flex items-center gap-2 overflow-hidden pl-1">
                {Icon ? (
                  <div className={cn("p-1.5 rounded-lg shrink-0", iconData.bg, iconData.color)}>
                    <Icon size={12} />
                  </div>
                ) : (
                  <div className="p-1.5 rounded-lg shrink-0 bg-slate-50 flex items-center justify-center w-[26px] h-[26px]">
                    <span className="text-sm">{emojiDB || "✅"}</span>
                  </div>
                )}
                <span className="text-[10px] font-black text-slate-700 uppercase leading-tight truncate">
                  {nombre}
                </span>
              </div>
              {valor && (
                <span className="text-[9px] font-black text-slate-500 mr-2 shrink-0 bg-slate-50 px-1.5 py-1 rounded-lg border border-slate-200">
                  {valor}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>

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
{/* Contenedor del Logo */}
<div className="w-8 h-8 rounded border bg-white flex items-center justify-center overflow-hidden shrink-0 mt-0.5 shadow-sm">
  {clinic?.imagenes && clinic.imagenes.length > 0 ? (
    <img 
      src={clinic.imagenes[0].url || clinic.imagenes[0].logo || "/placeholder.svg"} 
      alt={clinic.nombre_abreviado || 'Logo'} 
      className="w-full h-full object-contain p-0.5"
      onError={(e) => {
        // Si la URL está rota o da 404, mostramos el icono de edificio
        console.log("Error cargando imagen de:", clinic.nombre);
        e.currentTarget.style.display = 'none';
        const parent = e.currentTarget.parentElement;
        if (parent) {
          parent.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-300"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>';
        }
      }}
    />
  ) : (
    <Building2 className="w-4 h-4 text-slate-300" />
  )}
</div>                              <div className="flex flex-col">
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
{/* Contenedor del Logo */}
  <div className="w-8 h-8 rounded border bg-white flex items-center justify-center overflow-hidden shrink-0 mt-0.5 shadow-sm">
  {clinic?.imagenes && clinic.imagenes.length > 0 && clinic.imagenes[0]?.url ? (
    <img 
      src={clinic.imagenes[0].url} 
      alt={clinic.nombre_abreviado || 'Logo clínica'} 
      className="w-full h-full object-contain p-0.5"
      // Si la imagen existe pero no carga (404), mostramos el icono por defecto
      onError={(e) => {
        console.error("Error cargando logo de:", clinic.nombre_abreviado);
        e.currentTarget.style.display = 'none';
        // Buscamos el elemento hermano (el icono) o forzamos un fallback
        const parent = e.currentTarget.parentElement;
        if (parent) parent.innerHTML = '<div class="flex items-center justify-center w-full h-full bg-slate-50"><span class="text-[8px] font-bold text-slate-400">N/A</span></div>';
      }}
    />
  ) : (
    <Building2 className="w-4 h-4 text-slate-400" />
  )}
</div>                      <div className="flex flex-col">
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
</div>
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
