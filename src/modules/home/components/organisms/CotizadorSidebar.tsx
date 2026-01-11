import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Users, User, Baby, Wallet, Settings2, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";

export function CotizadorSidebar({ filtros, setFiltros }) {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const esDesregulado = filtros.sueldo > 300000;

  return (
    <aside className="w-full lg:w-[350px] relative">
      <div className={cn(
        "lg:sticky lg:top-24 lg:self-start z-40",
        "sticky top-[64px] left-0 right-0 w-full lg:relative lg:top-0 transition-all duration-300"
      )}>
        <Card className="border-2 border-slate-100 shadow-2xl rounded-b-[2rem] lg:rounded-[2.5rem] overflow-hidden bg-white/95 backdrop-blur-md">
          
          {/* HEADER / DISPARADOR (Móvil) */}
          <div 
            onClick={() => { if (window.innerWidth < 1024) setIsOpenMobile(!isOpenMobile); }}
            className="bg-slate-900 p-4 lg:p-6 text-white cursor-pointer lg:cursor-default flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-1.5 rounded-lg">
                <Settings2 size={18} className="text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-sm lg:text-xl font-black tracking-tight uppercase">Tu Perfil</h2>
                <p className="hidden lg:block text-[10px] text-slate-400 font-bold mt-1 uppercase italic">Cálculo en vivo</p>
              </div>
            </div>

            <div className="flex items-center gap-4 lg:hidden">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block font-bold uppercase">Sueldo</span>
                <span className="text-sm font-black text-green-400">${filtros.sueldo.toLocaleString()}</span>
              </div>
              <motion.div animate={{ rotate: isOpenMobile ? 180 : 0 }}>
                <ChevronDown size={20} className="text-primary" />
              </motion.div>
            </div>
          </div>
          
          {/* CONTENIDO */}
          <div className={cn(
            "overflow-hidden transition-all duration-500",
            isOpenMobile ? "max-h-[85vh] overflow-y-auto" : "max-h-0 lg:max-h-none"
          )}>
  <CardContent className="p-6 lg:p-8 space-y-5 bg-white lg:bg-transparent">
  
  {/* Leyenda única para el grupo familiar */}
  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter text-center mb-2">
    Deslizá para sumar integrantes y ajustar edades
  </p>

  {/* 1. SLIDER: TITULAR */}
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <Label className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[10px]">
        <User size={14} className="text-primary" /> Edad Titular
      </Label>
      <span className="font-black text-xl text-slate-900">{filtros.edadTitular} años</span>
    </div>
    <Slider 
      value={[filtros.edadTitular]} 
      min={18} max={65} step={1}
      onValueChange={([v]) => setFiltros({...filtros, edadTitular: v})}
    />
  </div>

  {/* 2. SLIDER: CÓNYUGE */}
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <Label className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[10px]">
        <Users size={14} className="text-primary" /> Cónyuge
      </Label>
      <span className={cn(
        "font-black text-xl transition-colors",
        filtros.edadConyuge >= 18 ? "text-slate-900" : "text-slate-300 italic text-sm"
      )}>
        {filtros.edadConyuge >= 18 ? `${filtros.edadConyuge} años` : "No incluye"}
      </span>
    </div>
    <Slider 
      value={[filtros.edadConyuge]} 
      min={0} max={65} step={1}
      onValueChange={([v]) => {
        const valReal = (v > 0 && v < 18) ? 18 : v;
        setFiltros({...filtros, edadConyuge: valReal});
      }}
    />
  </div>

  {/* 3. SLIDER: HIJOS */}
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <Label className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[10px]">
        <Baby size={14} className="text-primary" /> Hijos
      </Label>
      <span className={cn(
        "font-black text-xl transition-colors",
        filtros.hijos > 0 ? "text-slate-900" : "text-slate-300 italic text-sm"
      )}>
        {filtros.hijos > 0 ? filtros.hijos : "No incluye"}
      </span>
    </div>
    <Slider 
      value={[filtros.hijos]} 
      min={0} max={5} step={1}
      onValueChange={([v]) => setFiltros({...filtros, hijos: v})}
    />
  </div>

  {/* SLIDER: SUELDO (Separado un poco más para jerarquía) */}
  <div className="space-y-4 pt-4 border-t border-slate-100">
    <div className="flex justify-between items-center">
      <Label className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase">
        <Wallet size={16} className="text-green-500" /> Sueldo Bruto
      </Label>
      <span className="font-black text-lg text-green-600">${filtros.sueldo.toLocaleString()}</span>
    </div>
    <Slider 
      value={[filtros.sueldo]} 
      min={0} max={3000000} step={10000}
      onValueChange={([v]) => setFiltros({...filtros, sueldo: v})}
    />
                
                {/* INFO BOX */}
                <div className={cn(
                  "mt-4 p-4 rounded-3xl border-2 transition-colors",
                  esDesregulado ? "bg-green-50 border-green-100 text-green-700" : "bg-blue-50 border-blue-100 text-blue-700"
                )}>
                  <p className="text-[11px] font-black uppercase mb-1">
                    Sistema {esDesregulado ? 'Desregulado' : 'Particular'}
                  </p>
                  <p className="text-[10px] font-bold opacity-80 leading-tight">
                    {esDesregulado ? "Aportes de ley bonifican tu plan." : "Valor de cuota pura sin aportes."}
                  </p>
                </div>
              </div>

              {/* BOTÓN MÓVIL */}
              <button 
                onClick={() => setIsOpenMobile(false)}
                className="w-full lg:hidden py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase"
              >
                Cerrar Filtros
              </button>
            </CardContent>
          </div>
        </Card>
      </div>
    </aside>
  );
}