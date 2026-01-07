import { motion } from "framer-motion";
import { MessageCircle, Scale, Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const WHATSAPP_NUMBER = "5491112345678";

export const HowItWorks = () => {
  const handleWhatsApp = () => {
    const message = "Hola! Quiero comparar planes de salud y encontrar el mejor para mí.";
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const steps = [
    {
      number: "1",
      icon: <Scale className="w-8 h-8" />,
      title: "Elegí 2 planes",
      description: "Seleccioná los planes que te interesan de nuestra lista para compararlos.",
      color: "bg-primary/10 text-primary border-primary/20",
    },
    {
      number: "2",
      icon: <Trophy className="w-8 h-8" />,
      title: "Mirá la batalla",
      description: "Compará precios, beneficios y clínicas lado a lado en un duelo visual.",
      color: "bg-accent/10 text-accent border-accent/20",
    },
    {
      number: "3",
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Cotizá por WhatsApp",
      description: "Contactanos al instante y un asesor te ayuda a cerrar tu plan ideal.",
      color: "bg-success/10 text-success border-success/20",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
            Tu plan ideal en <span className="text-gradient">3 pasos</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Olvidate de llamar a 10 lugares distintos. Nosotros hacemos el trabajo duro por vos.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative mb-12">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[15%] right-[15%] h-0.5 bg-border -z-10" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="text-center group"
            >
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg border-2 ${step.color} group-hover:scale-110 transition-transform duration-300`}>
                {step.icon}
              </div>
              <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-black text-sm flex items-center justify-center mx-auto -mt-10 mb-4 shadow-md">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button
            onClick={handleWhatsApp}
            size="lg"
            className="bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold h-14 px-8 rounded-full text-lg shadow-xl transition-all hover:scale-105 group"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Empezar ahora
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};