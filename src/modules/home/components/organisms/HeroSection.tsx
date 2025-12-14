import { ArrowRight, Star, Users, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onQuoteClick: () => void;
}

export const HeroSection = ({ onQuoteClick }: HeroSectionProps) => {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-background">
      
      {/* ANIMATED BLOBS (Ambient Background) */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Violet Blob */}
        <div className="absolute top-0 -left-4 w-72 h-72 md:w-96 md:h-96 bg-primary/30 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob" />
        {/* Cyan Blob */}
        <div className="absolute top-0 -right-4 w-72 h-72 md:w-96 md:h-96 bg-secondary/30 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        {/* Fuchsia Blob */}
        <div className="absolute -bottom-8 left-20 w-72 h-72 md:w-96 md:h-96 bg-accent/30 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
        
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-hero" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* CONTENT */}
      <div className="container mx-auto px-4 relative z-20 flex flex-col lg:flex-row items-center justify-between gap-12 py-20">
        
        {/* Text Content */}
        <div className="text-foreground max-w-2xl text-center lg:text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-button rounded-full px-4 py-2 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="text-primary w-4 h-4" />
            <span className="text-sm font-medium text-muted-foreground">Elegido por +10.000 familias</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <span className="text-gradient">La salud</span> que querés,
            <br />
            <span className="text-foreground">al precio que podés.</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 font-medium max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 mx-auto lg:mx-0">
            Comparamos todas las prepagas del país para que encuentres tu plan ideal en menos de 2 minutos.
          </p>
          
          {/* Mobile CTA */}
          <div className="lg:hidden w-full">
            <Button 
              onClick={onQuoteClick}
              className="w-full bg-gradient-cta hover:opacity-90 text-white font-bold h-14 rounded-full text-lg shadow-xl neon-fuchsia transition-all hover:scale-105"
            >
              Cotizar Ahora <ArrowRight className="ml-2" />
            </Button>
          </div>

          {/* Stats */}
          <div className="hidden lg:flex items-center gap-8 mt-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="text-center">
              <p className="text-3xl font-black text-gradient">15+</p>
              <p className="text-sm text-muted-foreground">Prepagas</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <p className="text-3xl font-black text-gradient-cyan">200+</p>
              <p className="text-sm text-muted-foreground">Planes</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <p className="text-3xl font-black text-gradient">100%</p>
              <p className="text-sm text-muted-foreground">Gratis</p>
            </div>
          </div>
        </div>

        {/* GLASS CARD (Desktop) */}
        <div className="hidden lg:block w-full max-w-md glass-card p-8 animate-in slide-in-from-right-10 duration-1000 animate-float">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-primary animate-glow" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Cotizador Inteligente</span>
          </div>
          
          <h3 className="text-2xl font-bold text-foreground mb-2">Encontrá tu Plan</h3>
          <p className="text-muted-foreground mb-6 text-sm">Completá tus datos y recibí una comparativa personalizada.</p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={onQuoteClick} 
                className="p-4 rounded-2xl glass-strong border-primary/50 text-foreground font-bold text-sm flex flex-col items-center gap-2 transition-all hover:scale-105 hover:neon-violet"
              >
                <Users size={24} className="text-primary" /> Para Mí / Pareja
              </button>
              <button 
                onClick={onQuoteClick} 
                className="p-4 rounded-2xl glass border-white/10 hover:border-primary/30 text-muted-foreground font-bold text-sm flex flex-col items-center gap-2 transition-all hover:scale-105"
              >
                <Users size={24} /> Con Hijos
              </button>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={onQuoteClick}
                className="w-full bg-gradient-cta hover:opacity-90 text-white font-bold h-14 rounded-xl text-lg shadow-lg neon-fuchsia transition-all hover:scale-105"
              >
                Comenzar Cotización <ArrowRight className="ml-2" />
              </Button>
            </div>
            
            <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
              <ShieldCheck size={12} className="text-success" /> Tus datos están 100% protegidos
            </p>
          </div>
        </div>

      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
