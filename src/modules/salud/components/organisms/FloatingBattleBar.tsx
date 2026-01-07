import { motion, AnimatePresence } from "framer-motion";
import { Swords, X, Plus, Sparkles } from "lucide-react";
import { HealthPlan } from "@/core/interfaces/plan/planes";
import { cn } from "@/lib/utils";

interface FloatingBattleBarProps {
  plans: HealthPlan[];
  onCompare: () => void;
  onRemove: (planId: string) => void;
  maxPlans?: number;
}

// Mapa de logos de empresas
const EMPRESA_LOGOS: Record<string, string> = {
  "GALENO": "galeno.webp",
  "OSDE": "osde.png",
  "SWISS MEDICAL": "swissmedical.webp",
  "OMINT": "omint.webp",
  "MEDIFE": "medife.webp",
  "SANCOR SALUD": "sancorsalud.webp",
  "PREVENCION SALUD": "prevencion.webp",
  "AVALIAN": "avalian.webp",
  "HOMINIS": "hominis.png",
  "DOCTORED": "doctored.webp",
};

export const FloatingBattleBar = ({ 
  plans, 
  onCompare, 
  onRemove,
  maxPlans = 2 
}: FloatingBattleBarProps) => {
  const canBattle = plans.length === maxPlans;
  const needsMore = plans.length < maxPlans;

  if (plans.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl",
          canBattle 
            ? "bg-gradient-to-r from-primary/90 via-accent/90 to-primary/90 border-primary/50" 
            : "bg-background/95 border-border"
        )}>
          {/* Plan Slots */}
          <div className="flex items-center gap-2">
            {/* Plan 1 */}
            <PlanSlot 
              plan={plans[0]} 
              onRemove={() => plans[0] && onRemove(plans[0]._id)}
              isEmpty={!plans[0]}
            />

            {/* VS / Plus Icon */}
            <motion.div
              animate={canBattle ? { rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: canBattle ? Infinity : 0, duration: 1.5 }}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-black text-sm",
                canBattle 
                  ? "bg-white text-primary shadow-lg" 
                  : "bg-muted text-muted-foreground"
              )}
            >
              {canBattle ? "VS" : <Plus className="w-4 h-4" />}
            </motion.div>

            {/* Plan 2 */}
            <PlanSlot 
              plan={plans[1]} 
              onRemove={() => plans[1] && onRemove(plans[1]._id)}
              isEmpty={!plans[1]}
            />
          </div>

          {/* Divider */}
          <div className={cn(
            "w-px h-10 mx-2",
            canBattle ? "bg-white/30" : "bg-border"
          )} />

          {/* Battle Button */}
          <motion.button
            onClick={onCompare}
            disabled={!canBattle}
            whileHover={canBattle ? { scale: 1.05 } : {}}
            whileTap={canBattle ? { scale: 0.95 } : {}}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
              canBattle 
                ? "bg-white text-primary hover:bg-white/90 shadow-lg cursor-pointer" 
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {canBattle ? (
              <>
                <Swords className="w-4 h-4" />
                <span>¡Batalla!</span>
                <Sparkles className="w-4 h-4" />
              </>
            ) : (
              <span className="text-xs">Seleccioná otro plan</span>
            )}
          </motion.button>
        </div>

        {/* Hint Text */}
        {needsMore && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-xs text-muted-foreground mt-2"
          >
            Seleccioná {maxPlans - plans.length} plan{maxPlans - plans.length > 1 ? 'es' : ''} más para comparar
          </motion.p>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// Slot de plan individual
const PlanSlot = ({ 
  plan, 
  onRemove, 
  isEmpty 
}: { 
  plan?: HealthPlan; 
  onRemove: () => void; 
  isEmpty: boolean;
}) => {
  if (isEmpty || !plan) {
    return (
      <motion.div 
        className="w-14 h-14 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/30"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <Plus className="w-5 h-5 text-muted-foreground/50" />
      </motion.div>
    );
  }

  const logoFile = EMPRESA_LOGOS[plan.empresa];

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className="relative group"
    >
      <div className="w-14 h-14 rounded-xl bg-white border border-border flex items-center justify-center p-1.5 shadow-md overflow-hidden">
        {logoFile ? (
          <img
            src={`/assets/imagenes/card-header/${logoFile}`}
            alt={plan.empresa}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-xs font-bold text-primary">
            {plan.empresa.substring(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      {/* Remove Button */}
      <motion.button
        onClick={onRemove}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
      >
        <X className="w-3 h-3" />
      </motion.button>

      {/* Plan name tooltip */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-foreground text-background text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
          {plan.name}
        </div>
      </div>
    </motion.div>
  );
};

export default FloatingBattleBar;
