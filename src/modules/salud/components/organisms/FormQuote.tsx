import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { QuoteFormData } from '@/core/interfaces/plan/quoteFormData';
// Iconos
import { User, Users, UserPlus, Phone, MessageSquare, Minus, Plus, ArrowRight, Info } from 'lucide-react';
// UI Components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,      // <--- Verificar
  DialogTitle,       // <--- Verificar
  DialogDescription, // <--- Verificar
} from "@/components/ui/dialog";
import { initialFormData } from '@/data/initialFormData';


const PERSONAL_DATA_STORAGE_KEY = 'visitor_personal_data';

interface FormQuoteProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: QuoteFormData) => void;
}

export const FormQuote: React.FC<FormQuoteProps> = ({ isOpen, onClose, onComplete }) => {
  const { toast } = useToast();
  
  // --- ESTADOS ---
  const [activeStep, setActiveStep] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [edadTitular, setEdadTitular] = useState(30);
  const [edadConyuge, setEdadConyuge] = useState(30);
  const [cantidadHijos, setCantidadHijos] = useState(0);
  const [sueldoInput, setSueldoInput] = useState('');
  const [aportesType, setAportesType] = useState<string | null>('rel'); 
  const [cotizacionVisible, setCotizacionVisible] = useState(false);
  const [contactoType, setContactoType] = useState<string | null>(null);
  const [formData, setFormData] = useState<QuoteFormData>(initialFormData);
  
  // Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- EFECTOS Y CALLBACKS ---
  const updateFormData = useCallback((fields: Partial<QuoteFormData>) => {
    setFormData(prev => ({ ...prev, ...fields }));
  }, []);

  const updatePersonalData = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      personalData: { ...prev.personalData, [field]: value }
    }));
  }, []);

  const updateChildAge = useCallback((index: number, value: number) => {
    const controlName = `edadHijo${index + 1}` as keyof QuoteFormData;
    updateFormData({ [controlName]: value });
  }, [updateFormData]);

  useEffect(() => {
    updateFormData({ edad_1: edadTitular, edad_2: edadConyuge, numkids: cantidadHijos });
  }, [edadTitular, edadConyuge, cantidadHijos, updateFormData]);

  useEffect(() => {
    if (isOpen) {
      try {
        const storedData = localStorage.getItem(PERSONAL_DATA_STORAGE_KEY);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData.name) setFormData(prev => ({ ...prev, personalData: parsedData }));
        }
      } catch (e) { console.error(e); }
    } else {
      const timer = setTimeout(() => {
        setActiveStep(1);
        setSueldoInput('');
        setCotizacionVisible(false);
        setContactoType(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // --- HANDLERS ---
  const selectGroup = (group: number) => {
    // Si hace click en el grupo ya seleccionado, deseleccionar para mostrar todas las opciones
    if (selectedGroup === group) {
      setSelectedGroup(null);
      return;
    }
    setSelectedGroup(group);
    updateFormData({ group });
    if (group === 1 || group === 3) setCantidadHijos(0);
    if (group === 1 || group === 2) setEdadConyuge(0);
  };

  const incrementar = (member: 'titular' | 'conyuge' | 'hijos') => {
    if (member === 'titular') setEdadTitular(p => p + 1);
    else if (member === 'conyuge') {
      // Si está en 0, saltar directamente a 18 (edad mínima)
      setEdadConyuge(p => p === 0 ? 18 : p + 1);
    }
    else if (member === 'hijos' && cantidadHijos < 5) {
      setCantidadHijos(p => { updateChildAge(p, 1); return p + 1; });
    }
  };

  const decrementar = (member: 'titular' | 'conyuge' | 'hijos') => {
    if (member === 'titular' && edadTitular > 18) setEdadTitular(p => p - 1);
    else if (member === 'conyuge') {
      // Si está en 18, saltar a 0 (no hay pareja); si no, decrementar
      setEdadConyuge(p => p <= 18 ? 0 : p - 1);
    }
    else if (member === 'hijos' && cantidadHijos > 0) {
      setCantidadHijos(p => { updateChildAge(p - 1, 0); return p - 1; });
    }
  };

  const startContinuous = (action: () => void) => {
    action();
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(action, 100);
    }, 500);
  };

  const stopContinuous = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) { setSueldoInput(''); updateFormData({ sueldo: 0 }); return; }
    setSueldoInput(raw);
    updateFormData({ sueldo: parseInt(raw, 10) });
  };
  
  const formattedSueldo = sueldoInput ? new Intl.NumberFormat('es-AR').format(parseInt(sueldoInput)) : '';

  const handleFinish = async () => {
      const quoteData = { ...formData, contact: { ...formData.personalData, method: contactoType } };
    
    // 1. Identificar usuario en Chatwoot (El truco de consultor)
    if ((window as any).$chatwoot) {
        (window as any).$chatwoot.setUser(formData.personalData.email, {
            name: formData.personalData.name,
            phone_number: formData.personalData.phone,
        });
        
        // Etiquetar para que n8n sepa qué hacer
        (window as any).$chatwoot.addTags(['cotizacion_web', 'lead_caliente']);
    }

    if (onComplete) {
       onComplete(quoteData); 
    } else {
       // Cierra el modal visualmente
       onClose();

       // 2. Feedback al usuario + TU MARCA PERSONAL
       toast({ 
         title: "¡Cotización en proceso!", 
         description: "Tu asistente inteligente está analizando los datos...",
         // Aquí metemos tu marca sutilmente en el mensaje de éxito
         action: (
            <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Tecnología</span>
                <span className="text-xs font-bold text-teal-600">By [Tu Nombre/Agencia]</span>
            </div>
         ),
         duration: 5000,
       });

       // 3. Abrir el chat automáticamente después de 1.5 segundos
       // (Damos tiempo a que lea el toast y se cierre el modal)
       setTimeout(() => {
          if ((window as any).$chatwoot) {
            (window as any).$chatwoot.toggle("open");
          }
       }, 1500);
    }
  };

  const selectContactoType = (type: string) => {
    setContactoType(type);
    updatePersonalData('medioContacto', type);
    setCotizacionVisible(true);
    setTimeout(() => handleFinish(), 1500);
  };

  const goToNextStep = () => {
    if (activeStep === 1) {
      if (!selectedGroup) return;
      // Validar edad de pareja si es grupo 3 o 4
      if ((selectedGroup === 3 || selectedGroup === 4) && edadConyuge < 18) {
        toast({ title: "Error", description: "La edad de la pareja debe ser al menos 18 años", variant: "destructive" });
        return;
      }
      setActiveStep(2);
    } else if (activeStep === 2) {
      if (aportesType === 'rel' && (!sueldoInput || parseInt(sueldoInput) === 0)) {
         toast({ title: "Error", description: "Ingresa un sueldo válido", variant: "destructive" });
         return;
      }
      // Si hay onComplete, ir directo a resultados sin pedir datos personales
      // IMPORTANTE: El servidor espera tipo 'P' (particular) o 'D' (dependencia)
      if (onComplete) {
        const quoteData = { ...formData, tipo: aportesType === 'rel' ? 'D' : 'P' };
        onComplete(quoteData);
        return;
      }
      setActiveStep(3);
    }
  };

  const progress = activeStep === 1 ? '33%' : activeStep === 2 ? '66%' : '100%';

   return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-card border-0 shadow-2xl rounded-3xl gap-0 outline-none">
        
        {/* ================================================================= */}
        {/* SOLUCIÓN AL ERROR DE ACCESIBILIDAD (Esto elimina el warning)      */}
        {/* ================================================================= */}
        <DialogHeader className="px-8 pt-6 pb-0">
          <DialogTitle className="sr-only">Cotizador de Planes</DialogTitle>
          <DialogDescription className="sr-only">
            Completa los pasos para recibir tu cotización.
          </DialogDescription>
        </DialogHeader>
        {/* ================================================================= */}

        {/* HEADER VISUAL */}
        <div className="px-8 pt-2 pb-2 bg-card z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-foreground">
              {activeStep === 1 && "Grupo Familiar"}
              {activeStep === 2 && "Forma de Ingreso"}
              {activeStep === 3 && (cotizacionVisible ? "¡Listo!" : "Tus Datos")}
            </h2>
          </div>
          
          {/* Barra de Progreso */}
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out rounded-full" 
              style={{ width: progress }}
            />
          </div>
        </div>

        {/* BODY SCROLLABLE (Resto del formulario) */}
        <div className="p-8 flex-grow flex flex-col justify-between overflow-y-auto max-h-[65vh]">
          {/* ... (Todo el contenido de los pasos 1, 2 y 3 sigue igual) ... */}
          {/* PASO 1 */}
          {activeStep === 1 && (
            <div className="flex flex-col h-full animate-in slide-in-from-right-8 fade-in duration-300">
               <p className="text-sm text-muted-foreground mb-6 font-medium">Seleccioná quiénes estarán cubiertos.</p>
               
               <div className={`grid gap-3 mb-6 transition-all duration-300 ${selectedGroup ? 'grid-cols-1' : 'grid-cols-2'}`}>
                 {[ 
                   { id: 1, label: 'Individual', icon: <User size={24} strokeWidth={2.5} /> },
                   { id: 3, label: 'Pareja', icon: <Users size={24} strokeWidth={2.5} /> },
                   { id: 2, label: 'Titular + Hijos', icon: <UserPlus size={24} strokeWidth={2.5} /> },
                   { id: 4, label: 'Pareja + Hijos', icon: <Users size={24} strokeWidth={2.5} /> }
                 ]
                 .filter(opt => !selectedGroup || opt.id === selectedGroup)
                 .map(opt => (
                    <button 
                      key={opt.id}
                      onClick={() => selectGroup(opt.id)}
                      className={`rounded-2xl border-2 flex items-center gap-3 transition-all duration-300
                        ${selectedGroup === opt.id 
                            ? 'p-3 border-primary bg-primary/10 text-primary shadow-sm' 
                            : 'p-4 flex-col border-border bg-card hover:border-primary/40 text-muted-foreground'
                        }`}
                    >
                      <div className={`${selectedGroup === opt.id ? 'text-primary' : 'text-foreground/70'}`}>{opt.icon}</div>
                      <span className={`font-bold ${selectedGroup === opt.id ? 'text-sm' : 'text-xs'}`}>{opt.label}</span>
                      {selectedGroup === opt.id && (
                        <span className="ml-auto text-xs text-muted-foreground">(click para cambiar)</span>
                      )}
                    </button>
                 ))}
               </div>

               {selectedGroup && (
                 <div className="space-y-3">
                    <AgeControl label="Tu Edad" value={edadTitular} onInc={() => startContinuous(() => incrementar('titular'))} onDec={() => startContinuous(() => decrementar('titular'))} stop={stopContinuous} />
                    {(selectedGroup === 3 || selectedGroup === 4) && (
                       <AgeControl label="Edad Pareja" value={edadConyuge} onInc={() => startContinuous(() => incrementar('conyuge'))} onDec={() => startContinuous(() => decrementar('conyuge'))} stop={stopContinuous} />
                    )}
                    {(selectedGroup === 2 || selectedGroup === 4) && (
                       <AgeControl label="Cantidad Hijos" value={cantidadHijos} onInc={() => startContinuous(() => incrementar('hijos'))} onDec={() => startContinuous(() => decrementar('hijos'))} stop={stopContinuous} />
                    )}
                 </div>
               )}

               <div className="mt-8">
                 <Button onClick={goToNextStep} disabled={!selectedGroup} className="w-full h-12 bg-foreground hover:bg-foreground/90 text-background font-bold rounded-xl text-lg shadow-lg flex items-center justify-center gap-2">
                    Siguiente <ArrowRight size={20} />
                 </Button>
               </div>
            </div>
          )}

          {/* PASO 2 */}
          {activeStep === 2 && (
             <div className="flex flex-col h-full animate-in slide-in-from-right-8 fade-in duration-300">
                <p className="text-sm text-muted-foreground mb-6 font-medium">¿Cómo vas a contratar el plan?</p>

                <div className="grid grid-cols-2 bg-muted p-1.5 rounded-xl mb-10">
                  <button onClick={() => setAportesType('rel')} className={`py-2.5 rounded-lg text-sm font-bold transition-all ${aportesType === 'rel' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>Rel. Dependencia</button>
                  <button onClick={() => setAportesType('priv')} className={`py-2.5 rounded-lg text-sm font-bold transition-all ${aportesType === 'priv' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>Particular</button>
                </div>

                {aportesType === 'rel' ? (
                   <div className="animate-in fade-in zoom-in-95">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-6 text-center">Ingresá tu Sueldo Bruto</label>
                      <div className="relative max-w-[280px] mx-auto group">
                         <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-bold text-muted-foreground/50">$</span>
                         <input type="tel" value={formattedSueldo} onChange={handleSalaryChange} placeholder="0" autoFocus className="w-full pl-8 pr-4 py-2 text-4xl font-bold text-center text-primary border-b-2 border-border focus:border-primary outline-none bg-transparent" />
                      </div>
                      <p className="text-center text-xs text-muted-foreground mt-6">Usaremos esto para calcular tus aportes.</p>
                   </div>
                ) : (
                   <div className="text-center py-8 bg-secondary/10 rounded-2xl border border-secondary/20">
                      <Info size={32} className="text-secondary mx-auto mb-3" />
                      <h3 className="text-foreground font-bold mb-1">Modo Particular</h3>
                      <p className="text-sm text-muted-foreground px-4">Abonarás el 100% de la cuota + IVA.</p>
                   </div>
                )}

                <div className="mt-auto pt-6 flex gap-3">
                   <Button onClick={() => setActiveStep(1)} variant="ghost" className="w-1/3 h-14 rounded-xl font-bold text-muted-foreground">Atrás</Button>
                   <Button onClick={goToNextStep} className="w-2/3 h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg">Ver Precios</Button>
                </div>
             </div>
          )}

          {/* PASO 3 */}
          {activeStep === 3 && (
            <div className="flex flex-col h-full animate-in slide-in-from-right-8 fade-in duration-300">
               {!cotizacionVisible ? (
                 <>
                    <div className="text-center mb-8">
                       <h3 className="text-2xl font-bold text-foreground">Datos Personales</h3>
                       <p className="text-sm text-muted-foreground">Para enviarte la cotización detallada.</p>
                    </div>
                    <div className="space-y-4">
                       <div className="relative group">
                          <input type="text" value={formData.personalData.name} onChange={(e) => updatePersonalData('name', e.target.value)} className="peer w-full bg-muted border border-border rounded-xl px-4 pt-5 pb-2 font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground" placeholder=" " />
                          <label className="absolute left-4 top-3.5 text-xs font-bold text-muted-foreground uppercase transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-focus:-translate-y-2.5 peer-focus:text-[10px]">Nombre</label>
                       </div>
                       <div className="relative group">
                          <input type="email" value={formData.personalData.email} onChange={(e) => updatePersonalData('email', e.target.value)} className="peer w-full bg-muted border border-border rounded-xl px-4 pt-5 pb-2 font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground" placeholder=" " />
                          <label className="absolute left-4 top-3.5 text-xs font-bold text-muted-foreground uppercase transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-focus:-translate-y-2.5 peer-focus:text-[10px]">Email</label>
                       </div>
                       <div className="relative group">
                          <input type="tel" value={formData.personalData.phone} onChange={(e) => updatePersonalData('phone', e.target.value)} className="peer w-full bg-muted border border-border rounded-xl px-4 pt-5 pb-2 font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground" placeholder=" " />
                          <label className="absolute left-4 top-3.5 text-xs font-bold text-muted-foreground uppercase transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-focus:-translate-y-2.5 peer-focus:text-[10px]">Celular</label>
                       </div>
                    </div>
                    <div className="mt-8">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase text-center mb-3">¿Cómo te contactamos?</p>
                       <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => selectContactoType('whatsapp')} className="p-3 border-2 border-border rounded-xl flex items-center justify-center gap-2 hover:bg-secondary/10 hover:border-secondary transition-colors">
                             <MessageSquare className="text-secondary w-5 h-5" /> <span className="text-sm font-bold text-foreground">WhatsApp</span>
                          </button>
                          <button onClick={() => selectContactoType('phone')} className="p-3 border-2 border-border rounded-xl flex items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary transition-colors">
                             <Phone className="text-primary w-5 h-5" /> <span className="text-sm font-bold text-foreground">Llamada</span>
                          </button>
                       </div>
                    </div>
                 </>
               ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center animate-in zoom-in-95">
                     <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mb-6 shadow-sm">
                        {contactoType === 'whatsapp' ? <MessageSquare size={40} className="text-secondary" /> : <Phone size={40} className="text-primary" />}
                     </div>
                     <h3 className="text-2xl font-bold text-foreground mb-2">¡Gracias!</h3>
                     <p className="text-muted-foreground px-8">
                        {contactoType === 'whatsapp' ? 'Te enviaremos la cotización por WhatsApp en breve.' : 'Un asesor te llamará en unos minutos.'}
                     </p>
                  </div>
               )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Componente auxiliar Edad
interface AgeControlProps {
    label: string;
    value: number;
    onInc: () => void;
    onDec: () => void;
    stop: () => void;
}

const AgeControl: React.FC<AgeControlProps> = ({ label, value, onInc, onDec, stop }) => (
  <div className="flex items-center justify-between p-4 bg-muted rounded-2xl border border-border">
      <span className="font-bold text-foreground text-sm">{label}</span>
      <div className="flex items-center gap-4">
          <button 
             onMouseDown={onDec} onMouseUp={stop} onMouseLeave={stop} onTouchStart={onDec} onTouchEnd={stop}
             className="w-9 h-9 rounded-full bg-card border border-border text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition shadow-sm active:scale-95">
             <Minus size={16} strokeWidth={3} />
          </button>
          <span className="text-xl font-bold text-foreground w-8 text-center">{value}</span>
          <button 
             onMouseDown={onInc} onMouseUp={stop} onMouseLeave={stop} onTouchStart={onInc} onTouchEnd={stop}
             className="w-9 h-9 rounded-full bg-card border border-border text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition shadow-sm active:scale-95">
             <Plus size={16} strokeWidth={3} />
          </button>
      </div>
  </div>
);

export default FormQuote;