import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Check, Scale, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HealthPlan } from "@/core/interfaces/plan/planes";

interface GroupedPlansListProps {
  plans: HealthPlan[];
  loading: boolean;
  comparisonPlans: string[];
  onToggleComparison: (planId: string) => void;
  onOpenDetails: (plan: HealthPlan) => void;
}

// Map logos
const EMPRESA_LOGOS: Record<string, string> = {
  "Swiss Medical": "swissmedical.webp",
  "Swiss-Medical": "swissmedical.webp",
  "Galeno": "galeno.webp",
  "OSDE": "osde.png",
  "Omint": "omint.webp",
  "Medife": "medife.webp",
  "Sancor Salud": "sancorsalud.webp",
  "Avalian": "avalian.webp",
  "Hominis": "hominis.png",
  "Salud Central": "saludcentral.webp",
  "Doctored": "doctored.webp",
  "Premedic": "premedic.webp",
  "Prevención Salud": "prevencion.webp",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);

interface CompanyGroupProps {
  empresa: string;
  plans: HealthPlan[];
  isExpanded: boolean;
  onToggle: () => void;
  comparisonPlans: string[];
  onToggleComparison: (planId: string) => void;
  onOpenDetails: (plan: HealthPlan) => void;
}

const CompanyGroup = ({
  empresa,
  plans,
  isExpanded,
  onToggle,
  comparisonPlans,
  onToggleComparison,
  onOpenDetails,
}: CompanyGroupProps) => {
  const minPrice = Math.min(...plans.map(p => p.precio));
  const logoFile = EMPRESA_LOGOS[empresa];

  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg dark:shadow-lg dark:shadow-black/20">
      {/* Header - Always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 md:p-5 bg-card hover:bg-muted/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="w-16 h-12 md:w-20 md:h-14 flex items-center justify-center bg-white rounded-xl p-2 border border-border/50 shadow-sm">
            {logoFile ? (
              <img
                src={`/assets/imagenes/card-header/${logoFile}`}
                alt={empresa}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-sm font-bold text-foreground">{empresa}</span>
            )}
          </div>

          {/* Info */}
          <div className="text-left">
            <h3 className="font-bold text-lg text-foreground">{empresa}</h3>
            <p className="text-sm text-muted-foreground">
              {plans.length} plan{plans.length > 1 ? 'es' : ''} disponible{plans.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Right side - Price & Chevron */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Desde</p>
            <p className="text-xl font-bold text-primary">{formatCurrency(minPrice)}</p>
          </div>
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center bg-muted transition-all duration-300",
            isExpanded && "bg-primary/10"
          )}>
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-primary" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded Content - Mini Cards */}
      <div className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="p-4 pt-2 border-t border-border">
          <div className="flex flex-wrap gap-3">
            {plans.map((plan) => {
              const isInComparison = comparisonPlans.includes(plan._id);
              const planName = (plan as any).nombre || plan.name || plan.linea;
              
              return (
                <div
                  key={plan._id}
                  className={cn(
                    "flex-1 min-w-[200px] max-w-[320px] p-4 rounded-xl border transition-all duration-200 hover:shadow-md",
                    isInComparison
                      ? "bg-secondary/10 border-secondary"
                      : "bg-muted/50 border-border hover:border-primary/30"
                  )}
                >
                  {/* Plan Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground leading-tight">
                        {planName}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {plan.linea}
                      </p>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      plan.copagos
                        ? "bg-muted text-muted-foreground"
                        : "bg-success/10 text-success"
                    )}>
                      {plan.copagos ? "Copagos" : "$0 Copago"}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    <span className="text-2xl font-black text-foreground">
                      {formatCurrency(plan.precio)}
                    </span>
                    <span className="text-xs text-muted-foreground">/mes</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenDetails(plan)}
                      className="flex-1 h-9 text-xs font-medium"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      Detalles
                    </Button>
                    <Button
                      variant={isInComparison ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => onToggleComparison(plan._id)}
                      className={cn(
                        "h-9 w-9 p-0",
                        isInComparison && "bg-secondary/20 border-secondary text-secondary"
                      )}
                    >
                      {isInComparison ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Scale className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton for loading state
const GroupedPlansSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-14 bg-muted rounded-xl" />
            <div>
              <div className="h-5 w-32 bg-muted rounded mb-2" />
              <div className="h-4 w-24 bg-muted/70 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <div className="h-3 w-12 bg-muted/70 rounded mb-1" />
              <div className="h-6 w-24 bg-muted rounded" />
            </div>
            <div className="w-10 h-10 bg-muted rounded-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const GroupedPlansList = ({
  plans,
  loading,
  comparisonPlans,
  onToggleComparison,
  onOpenDetails,
}: GroupedPlansListProps) => {
  // Group plans by empresa
  const groupedPlans = useMemo(() => {
    const groups: Record<string, HealthPlan[]> = {};
    plans.forEach((plan) => {
      const empresa = plan.empresa || "Otros";
      if (!groups[empresa]) groups[empresa] = [];
      groups[empresa].push(plan);
    });
    
    // Sort groups by minimum price
    return Object.entries(groups)
      .map(([empresa, plans]) => ({
        empresa,
        plans: plans.sort((a, b) => a.precio - b.precio),
        minPrice: Math.min(...plans.map(p => p.precio)),
      }))
      .sort((a, b) => a.minPrice - b.minPrice);
  }, [plans]);

  // Track expanded companies (first one expanded by default)
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (groupedPlans.length > 0) {
      initial.add(groupedPlans[0].empresa);
    }
    return initial;
  });

  const toggleCompany = (empresa: string) => {
    setExpandedCompanies((prev) => {
      const next = new Set(prev);
      if (next.has(empresa)) {
        next.delete(empresa);
      } else {
        next.add(empresa);
      }
      return next;
    });
  };

  if (loading) {
    return <GroupedPlansSkeleton />;
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-12 bg-card border border-border rounded-xl p-8">
        <p className="text-muted-foreground">No se encontraron planes con los filtros seleccionados</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groupedPlans.map(({ empresa, plans }) => (
        <CompanyGroup
          key={empresa}
          empresa={empresa}
          plans={plans}
          isExpanded={expandedCompanies.has(empresa)}
          onToggle={() => toggleCompany(empresa)}
          comparisonPlans={comparisonPlans}
          onToggleComparison={onToggleComparison}
          onOpenDetails={onOpenDetails}
        />
      ))}
    </div>
  );
};
