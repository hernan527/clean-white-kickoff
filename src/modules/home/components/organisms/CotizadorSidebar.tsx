import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, User, Baby, Wallet } from 'lucide-react';

export function CotizadorSidebar({ filtros, setFiltros }) {
  // Lógica de categoría P vs D
  const esDesregulado = filtros.sueldo > 300000;

  return (
    <aside className="w-full md:w-[350px]">
      <Card className="sticky top-6 border-2 border-slate-100 shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-4 text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            Configurá tu perfil
          </h2>
          <p className="text-xs text-slate-400">Los precios se actualizan al instante</p>
        </div>
        
        <CardContent className="p-6 space-y-8">
          
          {/* 1. EDAD TITULAR */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-2 text-slate-600">
                <User size={16} /> Edad Titular
              </Label>
              <span className="font-bold text-lg text-blue-600">{filtros.edadTitular}</span>
            </div>
            <Slider 
              value={[filtros.edadTitular]} 
              min={18} max={65} step={1}
              onValueChange={([v]) => setFiltros({...filtros, edadTitular: v})}
            />
          </div>

          {/* 2. EDAD CÓNYUGE */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-2 text-slate-600">
                <Users size={16} /> Edad Cónyuge
              </Label>
              <span className="font-bold text-lg text-blue-600">
                {filtros.edadConyuge > 0 ? filtros.edadConyuge : "No"}
              </span>
            </div>
            <Slider 
              value={[filtros.edadConyuge]} 
              min={0} max={65} step={1}
              onValueChange={([v]) => setFiltros({...filtros, edadConyuge: v})}
            />
          </div>

          {/* 3. HIJOS */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-2 text-slate-600">
                <Baby size={16} /> Hijos
              </Label>
              <span className="font-bold text-lg text-blue-600">{filtros.hijos}</span>
            </div>
            <Slider 
              value={[filtros.hijos]} 
              min={0} max={5} step={1}
              onValueChange={([v]) => setFiltros({...filtros, hijos: v})}
            />
          </div>

          {/* 4. SUELDO / APORTES */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-2 text-slate-700 font-bold">
                <Wallet size={16} /> Sueldo Bruto
              </Label>
              <span className="font-bold text-lg text-green-600">
                ${filtros.sueldo.toLocaleString()}
              </span>
            </div>
            <Slider 
              className="py-2"
              value={[filtros.sueldo]} 
              min={0} max={3000000} step={10000}
              onValueChange={([v]) => setFiltros({...filtros, sueldo: v})}
            />
            
            {/* BADGE DINÁMICO P vs D */}
            <div className="mt-4 flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Modalidad Detectada
              </span>
              <Badge className={`w-fit py-1 px-3 text-md ${
                esDesregulado 
                ? "bg-green-100 text-green-700 border-green-200" 
                : "bg-blue-100 text-blue-700 border-blue-200"
              }`} variant="outline">
                {esDesregulado ? "D - Desregulado (Con Aportes)" : "P - Particular"}
              </Badge>
              <p className="text-[11px] text-slate-500 leading-tight">
                {esDesregulado 
                  ? "Tus aportes de ley se descuentan del valor del plan." 
                  : "Pagás el valor de lista de la prepaga."}
              </p>
            </div>
          </div>

        </CardContent>
      </Card>
    </aside>
  );
}