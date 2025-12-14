import { HealthPlan } from "@/core/interfaces/plan/planes";
import { Clinica } from "@/core/interfaces/plan/clinicas";
import { ClinicaRow } from "../molecules/ClinicaRow";
import { MapPin } from "lucide-react";

interface ClinicasContentProps {
  plans: HealthPlan[];
  uniqueClinicas: Clinica[];
  regions: string[];
  activeClinicaTab: string;
  onClinicaTabChange: (value: string) => void;
  onRemovePlan: (planId: string) => void;
  getClinicasByRegion: (region: string) => Clinica[];
  planIncludesClinica: (plan: HealthPlan, clinicaId: string) => boolean;
}

export const ClinicasContent = ({
  plans,
  uniqueClinicas,
  regions,
  activeClinicaTab,
  onClinicaTabChange,
  getClinicasByRegion,
  planIncludesClinica,
}: ClinicasContentProps) => {
  
  // Determinar qué clínicas mostrar - usar uniqueClinicas para "todas"
  const clinicasToShow = activeClinicaTab === "todas" 
    ? uniqueClinicas
    : getClinicasByRegion(activeClinicaTab);
  
  return (
    <div className="w-full">
      
      {/* Header de Filtros de Región */}
      <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 text-slate-400 text-sm font-bold mr-2">
            <MapPin size={16} /> Zona:
        </div>
        
        <button
            onClick={() => onClinicaTabChange("todas")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                activeClinicaTab === "todas"
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-transparent shadow-lg shadow-violet-500/25"
                : "bg-white/5 text-slate-400 border-white/10 hover:border-violet-500/50"
            }`}
        >
            Todas
        </button>

        {regions.map(region => (
            <button
                key={region}
                onClick={() => onClinicaTabChange(region)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    activeClinicaTab === region
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-transparent shadow-lg shadow-violet-500/25"
                    : "bg-white/5 text-slate-400 border-white/10 hover:border-violet-500/50"
                }`}
            >
                {region}
            </button>
        ))}
      </div>

      {/* Tabla de Clínicas */}
      <div>
        {clinicasToShow.length > 0 ? (
            clinicasToShow.map((clinica, idx) => (
                <ClinicaRow
                    key={`${clinica.item_id}-${idx}`}
                    clinica={clinica}
                    plans={plans}
                    planIncludesClinica={planIncludesClinica}
                />
            ))
        ) : (
            <div className="p-10 text-center text-slate-500">
                No se encontraron clínicas en esta zona.
            </div>
        )}
      </div>
    </div>
  );
};
