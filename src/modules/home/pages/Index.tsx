import { Helmet } from "react-helmet-async";
import Layout from "@/layouts/Layout";
import masterPlanes from "@/data/planes_mock.json"; // Succionamos la data maestra
// ... tus otros componentes (Hero, Search, etc)
// Organismos del Home
import { BattleHeroSection } from "../components/organisms/BattleHeroSection";
import { PlansSection } from "../components/organisms/PlansSection";
import { HowItWorks } from "../components/organisms/HowItWorks";
import { FAQ } from "../components/organisms/FAQ";
import { Testimonials } from "../components/organisms/Testimonials";

import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight } from "lucide-react";

const WHATSAPP_NUMBER = "5491112345678";

const Index = () => {
  const handleWhatsApp = () => {
    const message = "Hola! Quiero comparar planes de salud y encontrar el mejor para mí.";
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
  
  };
// 1. Limpiamos las empresas para que el Meta Tag no sea infinito
// Solo agarramos las primeras 10 para que Google no se atore
const empresasArray = [...new Set(masterPlanes.planes.map(p => p.empresas.nombre))];
const empresasShort = empresasArray.slice(0, 10).join(", ") + "...";
const cantidadPlanes = masterPlanes.planes.length;
  return (
    <Layout>
      <Helmet>
<meta 
        name="description" 
        content={`Compará planes de ${empresasShort}. Precios actualizados 2025. ¡Ahorrá hasta un 30% derivando aportes!`} 
      />
      
      {/* 📱 Open Graph (WhatsApp/Social) - Sin comentarios entre tags */}
      <meta property="og:title" content="Vitalia: El Cotizador de Salud #1 de Argentina" />
      <meta property="og:description" content="Encontrá tu plan de salud ideal entre miles de opciones. Simple y rápido." />
      <meta property="og:image" content="https://tusitio.com/assets/imagenes/og-home.webp" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://tusitio.com" />
      
      <link rel="canonical" href="https://tusitio.com" />
      </Helmet>

      {/* 1. HERO BATTLE - Ahora lleva a WhatsApp */}
      <BattleHeroSection onQuoteClick={handleWhatsApp} />

      {/* 2. CARDS DE PLANES - Seleccioná 2 para comparar */}
      <PlansSection />

      {/* 3. CÓMO FUNCIONA - Con CTAs a WhatsApp */}
      <HowItWorks />

      {/* 4. TESTIMONIOS */}
      <Testimonials />

      {/* 5. FAQ */}
      <FAQ />

      {/* 6. CTA FINAL - WhatsApp */}
      <section className="py-20 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-blob" />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-accent/20 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
        </div>
        
        <div className="container mx-auto px-4 max-w-3xl relative z-10">
          <div className="glass-card p-10 text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-6">
              <span className="text-gradient">¿Listo para mejorar</span> tu cobertura?
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              Unite a las miles de personas que ya eligieron cuidar su salud y su bolsillo con Vitalia.
            </p>
            <Button 
              onClick={handleWhatsApp}
              className="bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold h-16 px-10 rounded-full text-xl shadow-2xl transition-all hover:scale-105"
            >
              <MessageCircle className="mr-2 w-6 h-6" />
              Cotizar por WhatsApp
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;