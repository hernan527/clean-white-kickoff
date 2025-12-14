import { HealthPlan } from "@/core/interfaces/plan/planes";
import { Clinica } from "@/core/interfaces/plan/clinicas";
import { PlanHeader } from "../molecules/PlanHeader";
import { ClinicaRow } from "../molecules/ClinicaRow";
import { EmptyState } from "../molecules/EmptyState";

interface ClinicasTableProps {
  plans: HealthPlan[];
  clinicas: Clinica[];
  onRemovePlan: (planId: string) => void;
  planIncludesClinica: (plan: HealthPlan, clinicaId: string) => boolean;
}

export const ClinicasTable = ({
  plans,
  clinicas,
  onRemovePlan,
  planIncludesClinica,
}: ClinicasTableProps) => {
  if (plans.length === 0) {
    return <EmptyState message="No hay planes seleccionados para comparar cartillas." />;
  }

  if (clinicas.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No se encontraron clínicas para esta selección.</p>
      </div>
    );
  }

  return (
    <div className="comparison-scroll-container">
      <table className="min-w-full table-fixed divide-y divide-border condensed-table">
        <thead className="sticky-header">
          <tr>
            <th scope="col" className="w-[350px] px-3 py-2 sticky-col corner-cell text-left text-xs font-semibold uppercase">
              Clínica
            </th>
            {plans.map(plan => (
              <th key={plan._id} scope="col" className="w-[120px] border-l border-border">
                <PlanHeader plan={plan} onRemovePlan={onRemovePlan} compact />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-background">
          {clinicas.map((clinica) => (
            <ClinicaRow
              key={clinica.item_id}
              clinica={clinica}
              plans={plans}
              planIncludesClinica={planIncludesClinica}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
