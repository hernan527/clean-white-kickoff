import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CheckCircle2, ArrowRight, Star, ShieldCheck, TrendingDown, Clock, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormQuote } from "@/modules/salud/components/organisms/FormQuote";
import { ClinicZoneSelector } from "@/modules/salud/components/organisms/ClinicZoneSelector";
import { useToast } from "@/hooks/use-toast";
import { QuoteFormData } from "@/core/interfaces/plan/quoteFormData";

const STORAGE_KEY = 'last_cotizacion_form';

// DATOS ESPECÍFICOS DE SANCOR (Tu conocimiento experto)
const SANCOR_DATA = {
  name: "SanCor Salud",
  logo: "sancorsalud.webp",
  heroTitle: "SanCor Salud: La Cobertura Federal N°1",
  heroSubtitle: "Accedé a los planes Gen 1000, 3000 y 4000 con descuentos exclusivos por derivación de aportes. Te asesoramos con la verdad, sin letra chica.",
  expertTip: "Tip de Ex-Empleado: El Plan 3000 tiene la mejor relación precio-calidad si tenés hijos, por su cobertura en odontología y ortodoncia.",
  plans: [
    {
      name: "Plan Gen 1000",
      tag: "Entrada de Gama",
      price: "$ Low",
      features: ["Copagos bajos", "Habitación compartida", "Cartilla zonal básica"]
    },
    {
      name: "Plan Gen 3000",
      tag: "Recomendado",
      price: "$ Mid",
      highlight: true,
      features: ["Sin copagos", "Habitación individual", "Cirugía refractiva", "Ortodoncia"]
    },
    {
      name: "Plan Gen 4000",
      tag: "Premium",
      price: "$ High",
      features: ["Reintegros altos", "Estética", "Implantes odontológicos", "Cobertura internacional"]
    }
  ]
};

export const ProviderLandingPage = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

  // Lógica simple para demo
  const isSancor = providerId?.includes("sancor");
  const data = isSancor ? SANCOR_DATA : SANCOR_DATA;

  useEffect(() => {
    const handleScroll = () => setShowSticky(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleQuoteComplete = (formData: QuoteFormData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    setFormOpen(false);
    navigate('/resultados', { state: { fromQuote: true, formData } });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Helmet>
        <title>Cotizar {data.name} 2025 | Precios Oficiales y Descuentos</title>
      </Helmet>

      <FormQuote isOpen={formOpen} onClose={() => setFormOpen(false)} onComplete={handleQuoteComplete} />

      {/* 1. HERO SECTION: IMPACTO VISUAL */}
      <header className="relative bg-slate-900 text-white overflow-hidden">
        {/* Fondo con gradiente moderno */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 opacity-90"></div>
        <div className="absolute -right-20 -top-20 w-[600px] h-[600px] bg-teal-500 rounded-full blur-[120px] opacity-20"></div>
        
        <div className="container mx-auto px-6 pt-24 pb-20 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
                
                {/* Columna Izquierda: Copywriting Persuasivo */}
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        <Star size={12} fill="currentColor" /> Asesoramiento Experto
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-black leading-tight">
                        {data.heroTitle}
                        <span className="text-teal-400">.</span>
                    </h1>
                    
                    <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
                        {data.heroSubtitle}
                    </p>

                    {/* Expert Tip Box */}
                    <div className="bg-white/5 border-l-4 border-teal-500 p-4 rounded-r-xl backdrop-blur-sm">
                        <p className="text-sm text-slate-200 italic">
                            <span className="font-bold text-teal-400 not-italic block mb-1">💡 El dato del experto:</span>
                            "{data.expertTip}"
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button 
                            onClick={() => setFormOpen(true)}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-14 px-8 rounded-full text-lg shadow-lg shadow-orange-500/20 transition-transform hover:scale-105"
                        >
                            Cotizar Ahora
                        </Button>
                        <div className="flex items-center gap-2 text-sm text-slate-400 px-4">
                            <div className="flex -space-x-2">
                                {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900"></div>)}
                            </div>
                            <p>+200 consultas hoy</p>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Elemento Visual Interactivo */}
                <div className="relative hidden lg:block">
                    {/* Aquí insertamos el Selector de Zonas como elemento visual potente */}
                    <div className="absolute -top-10 -right-10 w-20 h-20 bg-orange-500 rounded-full blur-3xl opacity-30"></div>
                    <ClinicZoneSelector />
                    
                    {/* Floating Badge */}
                    <div className="absolute -bottom-6 -left-6 bg-white text-slate-900 p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-slow">
                        <div className="bg-green-100 p-2 rounded-full text-green-600">
                            <TrendingDown size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase">Ahorro Promedio</p>
                            <p className="text-xl font-black">30% OFF</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </header>

      {/* 2. COMPARATIVA DE PLANES (La "Carne") */}
      <section className="py-20 container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Elegí el plan que se adapta a vos</h2>
            <p className="text-slate-500">
                No pagues por lo que no usás. Analizamos las 3 opciones más populares de {data.name}.
            </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {data.plans.map((plan, idx) => (
                <div 
                    key={idx} 
                    className={`relative bg-white rounded-[2rem] p-8 border transition-all duration-300 hover:-translate-y-2
                        ${plan.highlight 
                            ? 'border-teal-500 shadow-2xl shadow-teal-900/10 z-10 scale-105' 
                            : 'border-slate-200 shadow-sm hover:shadow-xl'
                        }
                    `}
                >
                    {plan.highlight && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-xs font-bold px-4 py-1 rounded-b-xl uppercase tracking-wider">
                            Más Elegido
                        </div>
                    )}
                    
                    <div className="mb-6">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${plan.highlight ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                            {plan.tag}
                        </span>
                        <h3 className="text-2xl font-black text-slate-900 mt-3">{plan.name}</h3>
                    </div>

                    <ul className="space-y-4 mb-8">
                        {plan.features.map((feat, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                <CheckCircle2 className={`w-5 h-5 shrink-0 ${plan.highlight ? 'text-teal-500' : 'text-slate-400'}`} />
                                {feat}
                            </li>
                        ))}
                    </ul>

                    <Button 
                        onClick={() => setFormOpen(true)}
                        className={`w-full font-bold h-12 rounded-xl ${plan.highlight ? 'bg-teal-600 hover:bg-teal-700' : 'bg-slate-900 hover:bg-slate-800'}`}
                    >
                        Cotizar {plan.name}
                    </Button>
                </div>
            ))}
        </div>
      </section>

      {/* 3. SECCIÓN DE AUTORIDAD (Por qué con nosotros) */}
      <section className="py-20 bg-slate-100">
        <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">
                        ¿Por qué cotizar con Vitalia y no directo?
                    </h2>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm shrink-0">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Conocemos la "Letra Chica"</h4>
                                <p className="text-sm text-slate-600 mt-1">
                                    Al haber trabajado adentro, sabemos qué planes tienen topes ocultos y cuáles funcionan de verdad.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-teal-600 shadow-sm shrink-0">
                                <TrendingDown size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Descuentos Corporativos</h4>
                                <p className="text-sm text-slate-600 mt-1">
                                    Accedemos a listas de precios preferenciales por volumen que no siempre están en ventanilla.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Gestión de Alta Express</h4>
                                <p className="text-sm text-slate-600 mt-1">
                                    Nos encargamos del papelerío de derivación de aportes para que no pierdas tiempo en AFIP.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Visual de Confianza */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4 overflow-hidden">
                        <img src="/assets/imagenes/avatars/advisor-placeholder.png" alt="Asesor" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-lg font-bold text-slate-900">"Mi objetivo es que tengas el mejor plan posible con tu presupuesto actual."</p>
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="font-bold text-teal-600">Hernán Pérez</p>
                        <p className="text-xs text-slate-400">Ex-Ejecutivo de Cuentas SanCor Salud</p>
                    </div>
                    <Button onClick={() => window.open("https://wa.me/...", "_blank")} variant="outline" className="mt-6 w-full gap-2 border-green-200 text-green-700 hover:bg-green-50">
                        <MessageCircle size={18} /> Hablar por WhatsApp
                    </Button>
                </div>
            </div>
        </div>
      </section>

      {/* 4. STICKY CTA (Móvil y Desktop) */}
      <div className={`fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-[0_-5px_30px_rgba(0,0,0,0.1)] z-50 transition-transform duration-300 ${showSticky ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="container mx-auto max-w-5xl flex items-center justify-between gap-4">
            <div className="hidden md:block">
                <p className="font-bold text-slate-900 text-lg">No te quedes con dudas</p>
                <p className="text-xs text-slate-500">La cotización es gratuita y sin compromiso.</p>
            </div>
            <Button 
                onClick={() => setFormOpen(true)}
                className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl h-12 px-8 shadow-lg flex-1 md:flex-none"
            >
                Cotizar {data.name} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
        </div>
      </div>

    </div>
  );
};