import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Star, X, Filter, Check } from "lucide-react";

interface ResultsFilterSidebarProps {
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
}

// Map provider names to their logo filenames
const providerLogoMap: Record<string, string> = {
  'Avalian': 'avalian.webp',
  'BayresPlan': 'bayresplan.webp',
  'Cistal': 'cistal.webp',
  'Cristal': 'cristal.webp',
  'DoctorEd': 'doctored.webp',
  'Fosdic': 'fosdic.png',
  'Galeno': 'galeno.webp',
  'Hominis': 'hominis.png',
  'Luis Pasteur': 'luispasterur.webp',
  'Medife': 'medife.webp',
  'Omint': 'omint.webp',
  'OSDE': 'osde.png',
  'Premedic': 'premedic.webp',
  'Prevención Salud': 'prevencion.webp',
  'RAS': 'ras.webp',
  'Salud Central': 'saludcentral.webp',
  'Sancor Salud': 'sancorsalud.webp',
  'Swiss Medical': 'swissmedical.webp',
};

const getProviderLogo = (provider: string): string | null => {
  // Direct match
  if (providerLogoMap[provider]) {
    return `/assets/images/card-header/${providerLogoMap[provider]}`;
  }
  
  // Fuzzy match - check if provider name contains or is contained by a key
  const normalizedProvider = provider.toLowerCase().replace(/\s+/g, '');
  for (const [key, filename] of Object.entries(providerLogoMap)) {
    const normalizedKey = key.toLowerCase().replace(/\s+/g, '');
    if (normalizedProvider.includes(normalizedKey) || normalizedKey.includes(normalizedProvider)) {
      return `/assets/images/card-header/${filename}`;
    }
  }
  
  return null;
};

export const ResultsFilterSidebar = ({
  priceRange,
  onPriceRangeChange,
  providers,
  selectedProviders,
  onToggleProvider,
  minRating,
  onMinRatingChange,
  onClearFilters,
  minLimit,
  maxLimit
}: ResultsFilterSidebarProps) => {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-8">
      
      {/* --- HEADER FILTROS --- */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-2 text-foreground">
            <Filter size={20} className="text-primary" />
            <h2 className="text-lg font-bold">Filtros</h2>
        </div>
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 px-2"
        >
            <X size={14} className="mr-1" /> Limpiar
        </Button>
      </div>
    
      {/* --- RANGO DE PRECIO --- */}
      <div>
        <div className="flex justify-between items-center mb-4">
            <Label className="text-sm font-bold text-foreground">Presupuesto Mensual</Label>
        </div>
        
        <Slider
          min={minLimit}
          max={maxLimit}
          step={1000}
          minStepsBetweenThumbs={1}
          value={priceRange}
          onValueChange={onPriceRangeChange}
          className="py-4 cursor-pointer"
        />

        <div className="flex justify-between items-center mt-2">
          <div className="px-3 py-1.5 bg-muted border border-border rounded-lg text-xs font-bold text-muted-foreground tabular-nums">
            {formatCurrency(priceRange[0])}
          </div>
          <span className="text-muted-foreground/50">-</span>
          <div className="px-3 py-1.5 bg-muted border border-border rounded-lg text-xs font-bold text-muted-foreground tabular-nums">
            {formatCurrency(priceRange[1])}
          </div>
        </div>
      </div>

      {/* --- PROVEEDORES (PREPAGAS) - Modern Badge Style --- */}
      <div>
        <Label className="text-sm font-bold text-foreground mb-4 block">Prepagas</Label>
        <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {providers.map((provider) => {
            const isSelected = selectedProviders.includes(provider);
            const logoUrl = getProviderLogo(provider);
            
            return (
              <button
                key={provider}
                onClick={() => onToggleProvider(provider)}
                className={`
                  inline-flex items-center gap-2 px-3 py-2 
                  rounded-full border transition-all duration-200
                  text-sm font-medium cursor-pointer
                  ${isSelected 
                    ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                    : 'bg-card text-foreground border-border hover:border-primary/50 hover:bg-primary/5'
                  }
                `}
              >
                {/* Logo */}
                <div className={`
                  w-6 h-6 rounded-full overflow-hidden flex-shrink-0
                  ${isSelected ? 'bg-white' : 'bg-muted'}
                  flex items-center justify-center
                `}>
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt={provider} 
                      className="w-5 h-5 object-contain"
                    />
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">
                      {provider.charAt(0)}
                    </span>
                  )}
                </div>
                
                {/* Name */}
                <span className="whitespace-nowrap">{provider}</span>
                
                {/* Check icon when selected */}
                {isSelected && (
                  <Check size={14} className="flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- RATING MÍNIMO --- */}
      <div>
        <div className="flex justify-between items-center mb-4">
            <Label className="text-sm font-bold text-foreground">Calificación Mínima</Label>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-500/20 px-2 py-0.5 rounded-full">
                {minRating[0]} <Star size={10} fill="currentColor" />
            </div>
        </div>
        
        <Slider
            min={1}
            max={5}
            step={1}
            value={minRating}
            onValueChange={onMinRatingChange}
            className="py-2 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2 font-medium px-1">
            <span>1★</span>
            <span>5★</span>
        </div>
      </div>

    </div>
  );
};
