import { HealthPlan } from "@/core/interfaces/plan/planes";
import { Clinica } from "@/core/interfaces/plan/clinicas";
import { ResultsFilterSidebar } from "./ResultsFilterSidebar";
import { ResultsHeaderBar } from "./ResultsHeaderBar";
import { ResultsGrid } from "./ResultsGrid";

interface ResultsMainContentProps {
  // Filter props
  priceRange: number[];
  onPriceRangeChange: (value: number[]) => void;
  providers: string[];
  selectedProviders: string[];
  onToggleProvider: (provider: string) => void;
  minRating: number[];
  onMinRatingChange: (value: number[]) => void;
  onClearFilters: () => void;
  minLimit: number;
  maxLimit: number;
  // Header props
  sortBy: string;
  onSortChange: (value: string) => void;
  viewMode: "grid" | "list" | "grouped";
  onViewModeChange: (mode: "grid" | "list" | "grouped") => void;
  filteredPlansCount: number;
  onOpenFilters: () => void;
  allClinicas: Clinica[];
  selectedClinicas: Clinica[];
  onToggleClinica: (clinica: Clinica) => void;
  onRemoveClinica: (clinicaId: string) => void;
  openClinicSearch: boolean;
  onOpenClinicSearchChange: (open: boolean) => void;
  // Grid props
  plans: HealthPlan[];
  loading: boolean;
  comparisonPlans: string[];
  onToggleComparison: (planId: string) => void;
  onOpenDetails: (plan: HealthPlan) => void;
}

export const ResultsMainContent = ({
  priceRange,
  onPriceRangeChange,
  providers,
  selectedProviders,
  onToggleProvider,
  minRating,
  onMinRatingChange,
  onClearFilters,
  minLimit,
  maxLimit,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  filteredPlansCount,
  onOpenFilters,
  allClinicas,
  selectedClinicas,
  onToggleClinica,
  onRemoveClinica,
  openClinicSearch,
  onOpenClinicSearchChange,
  plans,
  loading,
  comparisonPlans,
  onToggleComparison,
  onOpenDetails,
}: ResultsMainContentProps) => (
  <div className="container mx-auto px-6 py-8">
    <div className="grid lg:grid-cols-[320px_1fr] gap-6">
      {/* Sidebar de Filtros - Desktop */}
      <aside className="hidden lg:block bg-card border border-border rounded-xl p-6 h-fit lg:sticky lg:top-6 shadow-sm">
        <ResultsFilterSidebar
          priceRange={priceRange}
          onPriceRangeChange={onPriceRangeChange}
          providers={providers}
          selectedProviders={selectedProviders}
          onToggleProvider={onToggleProvider}
          minRating={minRating}
          onMinRatingChange={onMinRatingChange}
          onClearFilters={onClearFilters}
          minLimit={minLimit}
          maxLimit={maxLimit}
        />
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 space-y-6">
        <ResultsHeaderBar
          sortBy={sortBy}
          onSortChange={onSortChange}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          filteredPlansCount={filteredPlansCount}
          onOpenFilters={onOpenFilters}
          allClinicas={allClinicas}
          selectedClinicas={selectedClinicas}
          onToggleClinica={onToggleClinica}
          onRemoveClinica={onRemoveClinica}
          openClinicSearch={openClinicSearch}
          onOpenClinicSearchChange={onOpenClinicSearchChange}
        />

        <ResultsGrid
          plans={plans}
          loading={loading}
          viewMode={viewMode}
          comparisonPlans={comparisonPlans}
          onToggleComparison={onToggleComparison}
          onOpenDetails={onOpenDetails}
        />
      </main>
    </div>
  </div>
);
