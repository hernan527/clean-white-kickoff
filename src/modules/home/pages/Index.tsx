import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/layouts/Layout";

// Importamos los Organismos
import { BattleHeroSection } from "../components/organisms/BattleHeroSection";
import { LogosGrid } from "../components/organisms/LogosGrid";
import { HowItWorks } from "../components/organisms/HowItWorks";
import { FAQ } from "../components/organisms/FAQ";
import { Testimonials } from "../components/organisms/Testimonials";

// Importamos el Cotizador (que está en modules/salud)
import { FormQuote } from "@/modules/salud/components/organisms/FormQuote";
import { Button } from "@/components/ui/button";
import { ArrowRight, Swords } from "lucide-react";
import { QuoteFormData } from "@/core/interfaces/plan/quoteFormData";

const STORAGE_KEY = 'last_cotizacion_form';

const Index = () => {
  const [formOpen, setFormOpen] = useState(false);
  const navigate = useNavigate();

  const handleQuoteComplete = (data: QuoteFormData) => {
    // Guardar los datos del formulario en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Cerrar el modal
    setFormOpen(false);
    // Navegar a resultados con flag para que cargue los datos
    navigate('/resultados', { state: { fromQuote: true, formData: data } });
  };

  return (
    <Layout>
      <Helmet>
        <title>Vitalia | Comparador de Salud N°1 de Argentina</title>
        <meta name="description" content="Encontrá tu plan de salud ideal. Compará precios y coberturas de las mejores prepagas." />
      </Helmet>

      {/* MODAL COTIZADOR GLOBAL */}
      <FormQuote 
        isOpen={formOpen} 
        onClose={() => setFormOpen(false)}
        onComplete={handleQuoteComplete}
      />

      {/* 1. HERO BATTLE (Propuesta de valor principal) */}
      <BattleHeroSection onQuoteClick={() => setFormOpen(true)} />

      {/* 2. LOGOS (Prueba Social) */}
      <LogosGrid />

      {/* 3. CÓMO FUNCIONA */}
      <HowItWorks />

      {/* 4. TESTIMONIOS (Si lo tienes) */}
      <Testimonials />

      {/* 5. FAQ */}
      <FAQ />

      {/* 6. CTA FINAL */}
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
                onClick={() => setFormOpen(true)}
                className="bg-gradient-cta hover:opacity-90 text-white font-bold h-16 px-10 rounded-full text-xl shadow-2xl neon-fuchsia transition-all hover:scale-105"
            >
                <Swords className="mr-2" />
                Armar Mi Batalla <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

    </Layout>
  );
};

export default Index;