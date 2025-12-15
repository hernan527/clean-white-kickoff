import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Users, RefreshCw, Search, Loader2, Sparkles } from 'lucide-react';
import { QuoteFormData } from '@/core/interfaces/plan/quoteFormData';
import { getGroupDescription, getFamilySummary } from '@/hooks/useCotizacion';

interface QuoteRecoveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedFormData: QuoteFormData | null;
  onRecover: () => void;
  onStartNew: () => void;
  isLoading?: boolean;
}

const QuoteRecoveryModal: React.FC<QuoteRecoveryModalProps> = ({
  open,
  onOpenChange,
  savedFormData,
  onRecover,
  onStartNew,
  isLoading = false
}) => {
  if (!savedFormData) return null;

  const groupDescription = getGroupDescription(savedFormData.group);
  const familySummary = getFamilySummary(savedFormData);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <AlertDialogTitle className="text-xl">
              ¡Qué bueno verte de nuevo!
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left space-y-4">
            <p className="text-muted-foreground">
              Vemos que ya cotizaste antes. ¿Querés ver esos planes o preferís hacer una nueva cotización?
            </p>
            
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-medium">
                  {groupDescription}
                </Badge>
                <span className="text-xs text-muted-foreground">• Tu última búsqueda</span>
              </div>
              
              {familySummary && (
                <p className="text-sm text-foreground font-medium">
                  {familySummary}
                </p>
              )}
              
              {savedFormData.tipo && (
                <p className="text-sm text-muted-foreground">
                  Tipo: {savedFormData.tipo === 'D' ? 'Dependiente' : 'Particular'}
                  {savedFormData.tipo === 'D' && savedFormData.sueldo > 0 && (
                    <span> • ${savedFormData.sueldo.toLocaleString('es-AR')}</span>
                  )}
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            onClick={onStartNew}
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
            Recotizar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onRecover}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {isLoading ? 'Cargando...' : 'Ver mis planes'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default QuoteRecoveryModal;
