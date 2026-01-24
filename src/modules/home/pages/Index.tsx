/* eslint-disable @typescript-eslint/no-explicit-any */
import { Helmet } from "react-helmet-async";
import Layout from "@/layouts/Layout";
import masterPlanes from "@/data/planes_mock.json";
import { BattleHeroSection } from "../components/organisms/BattleHeroSection";
import { PlansSection } from "../components/organisms/PlansSection";
import { HowItWorks } from "../components/organisms/HowItWorks";
import { FAQ } from "../components/organisms/FAQ";
import { Testimonials } from "../components/organisms/Testimonials";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight, Filter, Zap, Shield, Star } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
const WHATSAPP_NUMBER = "5491112345678";

const Index = () => {
  const handleWhatsApp = () => {
    const message = "Hola! Quiero comparar planes de salud y encontrar el mejor para mí.";
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const empresasArray = [...new Set(masterPlanes.planes.map(p => p.empresas?.nombre).filter(Boolean))];
  const empresasShort = empresasArray.slice(0, 10).join(", ") + "...";

  return (
    <Layout>
      <Helmet>
        <title>Vitalia | El Comparador de Salud #1 de Argentina</title>
        <meta name="description" content={`Compará planes de ${empresasShort}. Precios 2026.`} />
        <meta property="og:title" content="Vitalia: Cotizador de Salud Inteligente" />
        <meta property="og:image" content="/og-image.jpg" />
      </Helmet>

      {/* 1. HERO BATTLE - El gran impacto inicial */}
      <BattleHeroSection onQuoteClick={handleWhatsApp} />

      {/* 2. BARRA DE FILTROS "ASOMBROSA" (Quick Stats & Filter) */}
      <section className="relative -mt-12 z-40 container mx-auto px-4">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 backdrop-blur-2xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-6 md:p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            {/* Buscador Rápido Estilo Apple */}
            <div className="md:col-span-1 border-r border-slate-100 pr-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 p-2 rounded-xl text-primary">
                  <Filter size={18} />
                </div>
                <span className="font-black text-slate-800 uppercase text-xs tracking-widest">Filtros Pro</span>
              </div>
              <p className="text-slate-500 text-sm">Personalizá tu búsqueda</p>
            </div>

            {/* Chips de Categorías Inteligentes */}
            <div className="md:col-span-3 flex flex-wrap gap-3">
              {[
                { label: "Más Económicos", icon: <Zap size={14} />, color: "hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200" },
                { label: "Sin Copagos", icon: <Shield size={14} />, color: "hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200" },
                { label: "Planes Premium", icon: <Star size={14} />, color: "hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200" },
              ].map((chip, i) => (
                <button 
                  key={i}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 text-slate-600 text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-sm",
                    chip.color
                  )}
                >
                  {chip.icon}
                  {chip.label}
                </button>
              ))}
              
              {/* Contador de Planes */}
              <div className="ml-auto hidden xl:flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-tighter">
                  {masterPlanes.planes.length} Planes Online
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. CARDS DE PLANES (Ahora el usuario llega filtrado) */}
      <div className="pt-20">
        <PlansSection />
      </div>

      <HowItWorks />
      <Testimonials />
      <FAQ />

      {/* 4. CTA FINAL CON EFECTO GLASSMISM */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/30 rounded-full filter blur-[100px] animate-blob" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full filter blur-[100px] animate-blob animation-delay-2000" />
        </div>
        
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-[3rem] p-12 text-center shadow-2xl">
            <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">
              ¿Listo para <span className="text-primary underline decoration-primary/30">ahorrar</span>?
            </h2>
            <p className="text-slate-600 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              Un asesor experto te ayudará a elegir el plan que mejor se adapte a tu bolsillo y salud.
            </p>
            <Button 
              onClick={handleWhatsApp}
              className="bg-slate-900 hover:bg-black text-white font-black h-20 px-12 rounded-[2rem] text-xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-2 flex items-center gap-4 mx-auto"
            >
              <MessageCircle className="w-8 h-8 text-[#25D366]" />
              CHATEAR CON EXPERTO
              <ArrowRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;