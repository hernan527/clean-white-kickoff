import { HealthPlan } from "@/core/interfaces/plan/planes";
import { AttributeValue } from "../atoms/AttributeValue";

interface AttributeRowProps {
  attrName: string;
  plans: HealthPlan[];
  getPlanAttributeValue: (plan: HealthPlan, attrName: string) => string;
}

export const AttributeRow = ({ attrName, plans, getPlanAttributeValue }: AttributeRowProps) => (
  <div className="grid grid-cols-1 md:grid-cols-4 border-b border-white/5 hover:bg-white/5 transition-colors group">
    {/* Columna 1: Nombre del Atributo */}
    <div className="col-span-1 p-3 flex items-center text-sm font-medium text-slate-400 group-hover:text-slate-200">
      {attrName}
    </div>
    
    {/* Columnas 2-4: Valores de los planes */}
    {plans.map(plan => (
      <div key={`${plan._id}-${attrName}`} className="col-span-1">
        <AttributeValue value={getPlanAttributeValue(plan, attrName)} />
      </div>
    ))}
    
    {/* Rellenar columnas vacías si hay menos de 3 planes (para mantener el grid de 4) */}
    {Array.from({ length: 3 - plans.length }).map((_, i) => (
       <div key={`empty-${i}`} className="col-span-1 border-l border-white/5 hidden md:block" />
    ))}
  </div>
);
