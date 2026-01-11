/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import AdminService from '../../services/admin.service';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from 'sonner';
import { Car, Clock, ShieldCheck, Stethoscope, Microscope, Activity, LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  "Guardia 24hs": Clock,
  "Estacionamiento": Car,
  "Quirófano": ShieldCheck,
  "Internación": Stethoscope,
  "Laboratorio": Microscope,
  "Diagnóstico": Activity,
};

export const CartillaManager = ({ clinicaId, onSelectionChange }: { clinicaId: string, onSelectionChange: (planes: number[], atributos: number[]) => void }) => {
  const [loading, setLoading] = useState(true);
  const [jerarquia, setJerarquia] = useState<any[]>([]);
  const [selectedPlanIds, setSelectedPlanIds] = useState<number[]>([]);
  const [allAtributos, setAllAtributos] = useState<any[]>([]);
  const [selectedAttrIds, setSelectedAttrIds] = useState<number[]>([]);

  // 1. CARGA INICIAL
  useEffect(() => {
    const loadData = async () => {
      if (!clinicaId) return;
      setLoading(true);
      try {
        const [planesData, atributosData, clinicaActual] = await Promise.all([
          AdminService.getJerarquiaPlanes(),
          AdminService.getAtributosMaestros(),
          AdminService.getClinicaById(clinicaId)
        ]);

        setJerarquia(planesData || []);
        setAllAtributos(atributosData || []);

        const planesVinculados = clinicaActual?.plan_clinica?.map((p: any) => Number(p.plan_id)) || [];
        const attrsVinculados = clinicaActual?.clinica_atributo?.map((a: any) => Number(a.atributo_id)) || [];

        setSelectedPlanIds(planesVinculados);
        setSelectedAttrIds(attrsVinculados);
      } catch (error) {
        toast.error("Error al sincronizar datos");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [clinicaId]);

  // 2. COMUNICACIÓN CON EL PADRE
  useEffect(() => {
    if (!loading) {
      onSelectionChange(selectedPlanIds, selectedAttrIds);
    }
  }, [selectedPlanIds, selectedAttrIds, loading]);

  // 3. HANDLERS
  const handlePlanToggle = (id: number) => {
    setSelectedPlanIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleAttrToggle = (id: number) => {
    setSelectedAttrIds(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const toggleEmpresaCompleta = (empresa: any, isChecked: boolean) => {
    const idsEmpresa = empresa.lineas.flatMap((l: any) => l.planes.map((p: any) => Number(p.id)));
    if (isChecked) {
      setSelectedPlanIds(prev => [...new Set([...prev, ...idsEmpresa])]);
    } else {
      setSelectedPlanIds(prev => prev.filter(id => !idsEmpresa.includes(id)));
    }
  };

  const saveAll = async () => {
    try {
      await AdminService.updateClinicaFull(clinicaId, {}, selectedPlanIds, selectedAttrIds);
      toast.success("Configuración guardada correctamente");
    } catch (error) {
      toast.error("Error al guardar");
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse text-slate-400 font-medium">Sincronizando cartilla...</div>;

  return (
    <div className="space-y-6 border p-6 rounded-2xl bg-white shadow-sm">
      {/* HEADER */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Planes y Servicios</h3>
          <p className="text-sm text-slate-500">Seleccioná los planes médicos que acepta esta sede</p>
        </div>
        <button onClick={saveAll} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-md">
          Guardar Cambios
        </button>
      </div>

      {/* SECCIÓN PLANES */}
      <section className="space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Coberturas Médicas</h4>
        <Accordion type="multiple" className="grid grid-cols-1 gap-2">
          {jerarquia.map((empresa) => {
            const idsEmpresa = empresa.lineas.flatMap((l: any) => l.planes.map((p: any) => Number(p.id)));
            const seleccionadosDeEstaEmpresa = idsEmpresa.filter((id: number) => selectedPlanIds.includes(id));
            
            const estaCompleta = idsEmpresa.length > 0 && seleccionadosDeEstaEmpresa.length === idsEmpresa.length;
            const estaParcial = seleccionadosDeEstaEmpresa.length > 0 && !estaCompleta;

            return (
              <AccordionItem key={empresa.id} value={empresa.id.toString()} className="border rounded-xl px-4 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={estaCompleta ? true : estaParcial ? "indeterminate" : false} 
                    onCheckedChange={(v) => toggleEmpresaCompleta(empresa, !!v)} 
                  />
                  <AccordionTrigger className="hover:no-underline py-4">
                    <span className="font-semibold text-slate-700">{empresa.nombre}</span>
                    <span className="ml-2 text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                      {seleccionadosDeEstaEmpresa.length} / {idsEmpresa.length}
                    </span>
                  </AccordionTrigger>
                </div>
                <AccordionContent className="pb-4">
                  {empresa.lineas.map((linea: any) => (
                    <div key={linea.nombre} className="mt-4 first:mt-0">
                      <div className="flex items-center gap-2 mb-2">
                         <div className="h-[1px] flex-1 bg-slate-200"></div>
                         <span className="text-[10px] font-bold text-slate-400 uppercase italic">{linea.nombre}</span>
                         <div className="h-[1px] flex-1 bg-slate-200"></div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {linea.planes.map((plan: any) => (
                          <label key={plan.id} className={`flex items-center gap-2 p-2 rounded-lg border transition-colors cursor-pointer ${selectedPlanIds.includes(Number(plan.id)) ? 'bg-white border-blue-200 shadow-sm' : 'border-transparent hover:bg-slate-100'}`}>
                            <Checkbox 
                              checked={selectedPlanIds.includes(Number(plan.id))} 
                              onCheckedChange={() => handlePlanToggle(Number(plan.id))} 
                            />
                            <span className="text-xs text-slate-600 font-medium">{plan.nombre_plan}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </section>

      {/* SECCIÓN SERVICIOS */}
      <section className="pt-6 border-t">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Servicios e Infraestructura</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {allAtributos.map((attr) => {
            const Icon = iconMap[attr.nombre] || ShieldCheck;
            const isChecked = selectedAttrIds.includes(Number(attr.id));
            return (
              <div 
                key={attr.id}
                onClick={() => handleAttrToggle(Number(attr.id))}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  isChecked ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-100' : 'border-slate-100 hover:border-slate-200 bg-white'
                }`}
              >
                <Icon size={24} className={isChecked ? 'text-blue-600' : 'text-slate-300'} />
                <span className={`text-[11px] font-bold mt-2 text-center ${isChecked ? 'text-blue-700' : 'text-slate-500'}`}>
                  {attr.nombre}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};