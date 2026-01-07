import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Trophy, Zap, Shield, ArrowRight, Sparkles, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BattleHeroSectionProps {
  onQuoteClick: () => void;
}

// Empresas para el efecto visual
const BATTLE_PAIRS = [
  { left: { name: "GALENO", logo: "galeno.webp", price: "$89.000" }, right: { name: "SWISS MEDICAL", logo: "swissmedical.webp", price: "$95.000" } },
  { left: { name: "OSDE", logo: "osde.png", price: "$120.000" }, right: { name: "OMINT", logo: "omint.webp", price: "$115.000" } },
  { left: { name: "MEDIFE", logo: "medife.webp", price: "$75.000" }, right: { name: "SANCOR SALUD", logo: "sancorsalud.webp", price: "$72.000" } },
];

export const BattleHeroSection = ({ onQuoteClick }: BattleHeroSectionProps) => {
  const [currentPair, setCurrentPair] = useState(0);
  const [showWinner, setShowWinner] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowWinner(true);
      setTimeout(() => {
        setShowWinner(false);
        setCurrentPair((prev) => (prev + 1) % BATTLE_PAIRS.length);
      }, 2000);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const pair = BATTLE_PAIRS[currentPair];

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* ANIMATED BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Battle Arena Glow */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/20 via-transparent to-transparent rounded-full"
        />
        
        {/* Left Team Glow */}
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/30 rounded-full filter blur-[100px] opacity-60" />
        
        {/* Right Team Glow */}
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-accent/30 rounded-full filter blur-[100px] opacity-60" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* CONTENT */}
      <div className="container mx-auto px-4 relative z-20 py-20">
        
        {/* Top Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 glass-button rounded-full px-5 py-2.5">
            <Swords className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">COMPARADOR INTELIGENTE</span>
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-4">
            <span className="text-gradient">Enfrentá</span> a las prepagas,
            <br />
            <span className="text-foreground">elegí la ganadora.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Compará dos planes lado a lado y descubrí cuál te da más por menos. 
            <span className="text-primary font-semibold"> Sin vueltas, sin letra chica.</span>
          </p>
        </motion.div>

        {/* BATTLE ARENA VISUAL */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div className="glass-card p-6 md:p-8 rounded-3xl relative overflow-hidden">
            {/* Battle Label */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-foreground/10 backdrop-blur-md rounded-full px-4 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Vista previa en vivo
            </div>

            <div className="flex items-center justify-center gap-4 md:gap-8 pt-8">
              {/* Left Plan */}
              <motion.div
                key={`left-${currentPair}`}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className={cn(
                  "flex-1 max-w-[180px] md:max-w-[220px] p-4 md:p-6 rounded-2xl border-2 transition-all",
                  showWinner && pair.left.price < pair.right.price
                    ? "border-success bg-success/10 shadow-lg shadow-success/20"
                    : "border-border bg-card/50"
                )}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-white rounded-xl p-2 mb-4 shadow-md">
                  <img 
                    src={`/assets/imagenes/card-header/${pair.left.logo}`} 
                    alt={pair.left.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-center font-bold text-foreground text-sm md:text-base">{pair.left.name}</p>
                <p className="text-center text-xl md:text-2xl font-black text-primary mt-2">{pair.left.price}</p>
                <p className="text-center text-xs text-muted-foreground">por mes</p>
                
                <AnimatePresence>
                  {showWinner && pair.left.price < pair.right.price && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center justify-center gap-1 mt-3 text-success text-xs font-bold"
                    >
                      <Trophy className="w-4 h-4" /> ¡GANA!
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* VS Badge */}
              <motion.div
                animate={{ 
                  rotate: showWinner ? [0, 360] : 0,
                  scale: showWinner ? [1, 1.2, 1] : 1
                }}
                transition={{ duration: 0.5 }}
                className="shrink-0 w-14 h-14 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-xl"
              >
                <span className="text-lg md:text-2xl font-black text-white">VS</span>
              </motion.div>

              {/* Right Plan */}
              <motion.div
                key={`right-${currentPair}`}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 50, opacity: 0 }}
                className={cn(
                  "flex-1 max-w-[180px] md:max-w-[220px] p-4 md:p-6 rounded-2xl border-2 transition-all",
                  showWinner && pair.right.price < pair.left.price
                    ? "border-success bg-success/10 shadow-lg shadow-success/20"
                    : "border-border bg-card/50"
                )}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-white rounded-xl p-2 mb-4 shadow-md">
                  <img 
                    src={`/assets/imagenes/card-header/${pair.right.logo}`} 
                    alt={pair.right.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-center font-bold text-foreground text-sm md:text-base">{pair.right.name}</p>
                <p className="text-center text-xl md:text-2xl font-black text-primary mt-2">{pair.right.price}</p>
                <p className="text-center text-xs text-muted-foreground">por mes</p>
                
                <AnimatePresence>
                  {showWinner && pair.right.price < pair.left.price && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center justify-center gap-1 mt-3 text-success text-xs font-bold"
                    >
                      <Trophy className="w-4 h-4" /> ¡GANA!
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Battle Features */}
            <div className="flex flex-wrap justify-center gap-3 mt-6 pt-6 border-t border-border/50">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1.5">
                <Check className="w-3 h-3 text-success" /> Beneficios comparados
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1.5">
                <Check className="w-3 h-3 text-success" /> Clínicas por zona
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1.5">
                <Check className="w-3 h-3 text-success" /> Precio real
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Button 
            onClick={onQuoteClick}
            size="lg"
            className="bg-gradient-cta hover:opacity-90 text-white font-bold h-16 px-10 rounded-full text-lg md:text-xl shadow-2xl neon-fuchsia transition-all hover:scale-105 group"
          >
            <Swords className="mr-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
            Armar Mi Batalla
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <p className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-success" />
            Gratis • Sin compromiso • En 2 minutos
          </p>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">+10.000 usuarios</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-sm text-muted-foreground ml-1">4.9/5</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
