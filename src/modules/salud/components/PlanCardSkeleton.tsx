import * as React from 'react';

// Define las props para que el esqueleto pueda adaptarse a la vista de lista o grilla
interface PlanCardSkeletonProps {
  viewMode: "grid" | "list";
}

export const PlanCardSkeleton: React.FC<PlanCardSkeletonProps> = ({ viewMode }) => {
  const baseClasses = "border border-border rounded-xl p-6 bg-card shadow-sm animate-pulse";

  if (viewMode === "list") {
    // Vista de Lista: Elemento largo con información apilada
    return (
      <div className={`${baseClasses} flex items-center space-x-4 h-32`}>
        {/* Logo/Icono (Lado izquierdo) */}
        <div className="h-16 w-16 bg-muted rounded-full"></div> 
        
        {/* Contenido (Centro) */}
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-muted w-3/4 rounded"></div> {/* Título */}
          <div className="h-3 bg-muted w-1/2 rounded"></div> {/* Descripción/Detalle */}
          <div className="h-3 bg-muted w-2/5 rounded"></div> {/* Precio */}
        </div>
        
        {/* Botón de Acción (Lado derecho) */}
        <div className="h-8 w-20 bg-muted rounded"></div>
      </div>
    );
  }

  // Vista de Grilla (por defecto)
  return (
    <div className={baseClasses}>
      {/* Encabezado: Logo y Precio/Rating */}
      <div className="flex justify-between items-start mb-4">
        {/* Logo */}
        <div className="h-12 w-12 bg-muted rounded-full"></div> 
        {/* Precio */}
        <div className="h-6 w-1/4 bg-muted rounded"></div> 
      </div>

      {/* Título Principal */}
      <div className="space-y-3 mb-6">
        <div className="h-5 bg-muted w-full rounded"></div>
        <div className="h-5 bg-muted w-3/4 rounded"></div>
      </div>
      
      {/* Atributos / Coberturas */}
      <div className="space-y-2 mb-6">
        <div className="h-3 bg-muted w-1/2 rounded"></div>
        <div className="h-3 bg-muted w-2/3 rounded"></div>
        <div className="h-3 bg-muted w-1/3 rounded"></div>
      </div>

      {/* Botones de Acción */}
      <div className="flex justify-between mt-4">
        <div className="h-10 w-2/5 bg-muted rounded"></div>
        <div className="h-10 w-2/5 bg-primary/20 rounded"></div>
      </div>
    </div>
  );
};