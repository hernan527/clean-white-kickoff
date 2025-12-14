import { HealthPlan } from "@/core/interfaces/plan/planes";
import { AttributeGroupRow } from "../molecules/AttributeGroupRow";
import { AttributeRow } from "../molecules/AttributeRow";

interface BeneficiosTableProps {
  plans: HealthPlan[];
  groupedAttributes: Record<string, string[]>;
  collapsedGroups: Set<string>;
  onToggleGroup: (groupName: string) => void;
  onRemovePlan: (planId: string) => void; // Se mantiene por compatibilidad, aunque el header lo maneja
  getPlanAttributeValue: (plan: HealthPlan, attrName: string) => string;
}

export const BeneficiosTable = ({
  plans,
  groupedAttributes,
  collapsedGroups,
  onToggleGroup,
  getPlanAttributeValue,
}: BeneficiosTableProps) => {
  
  return (
    <div className="w-full">
      {Object.entries(groupedAttributes).map(([groupName, attributes]) => (
        <div key={groupName}>
          {/* Header del Grupo */}
          <div className="grid grid-cols-1 md:grid-cols-4">
             <AttributeGroupRow
                groupName={groupName}
                attributeCount={attributes.length}
                isCollapsed={collapsedGroups.has(groupName)}
                onToggle={() => onToggleGroup(groupName)}
             />
          </div>

          {/* Filas de Atributos (Si no está colapsado) */}
          {!collapsedGroups.has(groupName) && (
            <div>
              {attributes.map((attrName, idx) => (
                <AttributeRow
                  key={`${groupName}-${attrName}-${idx}`}
                  attrName={attrName}
                  plans={plans}
                  getPlanAttributeValue={getPlanAttributeValue}
                />
              ))}
            </div>
          )}
        </div>
      ))}
      
      {Object.keys(groupedAttributes).length === 0 && (
        <div className="p-10 text-center text-slate-500">
            No hay beneficios para mostrar.
        </div>
      )}
    </div>
  );
};