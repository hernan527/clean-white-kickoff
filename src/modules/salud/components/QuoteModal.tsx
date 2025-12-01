import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface QuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  group: string;
  edad_1: number;
  edad_2: number;
  cantidadDeHijos: number;
  residencia: string;
  edadHijo1: number;
  tipo: string;
  agree: boolean;
  aporteOS: number;
  sueldo: number;
  personalData: {
    name: string;
    email: string;
    phone: string;
    region: string;
    medioContacto: string;
  };
}

export const QuoteModal = ({ open, onOpenChange }: QuoteModalProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    group: '',
    edad_1: 18,
    edad_2: 0,
    cantidadDeHijos: 0,
    residencia: '',
    edadHijo1: 0,
    tipo: '',
    agree: true,
    aporteOS: 0,
    sueldo: 0,
    personalData: {
      name: '',
      email: '',
      phone: '',
      region: '',
      medioContacto: ''
    }
  });

  const handleGroupChange = (value: string) => {
    setFormData({ ...formData, group: value });
  };

  const handleResidenciaChange = (value: string) => {
    setFormData({ ...formData, residencia: value });
  };

  const handleNextStep = () => {
    if (step === 1 && (!formData.group || !formData.residencia)) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }
    if (step === 2 && formData.edad_1 < 1) {
      toast({
        title: "Error",
        description: "Por favor ingrese su edad",
        variant: "destructive"
      });
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('https://servidorplus.avalianonline.com.ar/cotizacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStep(5);
      } else {
        toast({
          title: "Error",
          description: "Hubo un problema al enviar su cotización",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo conectar con el servidor",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      group: '',
      edad_1: 18,
      edad_2: 0,
      cantidadDeHijos: 0,
      residencia: '',
      edadHijo1: 0,
      tipo: '',
      agree: true,
      aporteOS: 0,
      sueldo: 0,
      personalData: {
        name: '',
        email: '',
        phone: '',
        region: '',
        medioContacto: ''
      }
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cotizar Plan de Salud</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-lg leading-relaxed">
              <p className="mb-4">El plan es para:</p>
              <Select value={formData.group} onValueChange={handleGroupChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione una opción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Mi</SelectItem>
                  <SelectItem value="2">Mi y mi pareja</SelectItem>
                  <SelectItem value="3">Mi y mi/s hijo/s</SelectItem>
                  <SelectItem value="4">Mi, mi pareja y mi/s hijo/s</SelectItem>
                </SelectContent>
              </Select>

              <p className="mt-6 mb-4">Que vivimos en la zona de:</p>
              <Select value={formData.residencia} onValueChange={handleResidenciaChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione una zona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CABA">CABA</SelectItem>
                  <SelectItem value="GBA Zona Norte">GBA Zona Norte</SelectItem>
                  <SelectItem value="GBA Zona Sur">GBA Zona Sur</SelectItem>
                  <SelectItem value="GBA Zona Oeste">GBA Zona Oeste</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleNextStep} className="w-full">
              Siguiente
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-lg leading-relaxed space-y-4">
              <p>Nuestras edades son:</p>
              
              <div>
                <Label>La del titular</Label>
                <Input
                  type="number"
                  min="18"
                  max="100"
                  value={formData.edad_1}
                  onChange={(e) => setFormData({ ...formData, edad_1: parseInt(e.target.value) || 18 })}
                  className="mt-2"
                />
              </div>

              {(formData.group === '2' || formData.group === '4') && (
                <div>
                  <Label>Mi pareja</Label>
                  <Input
                    type="number"
                    min="18"
                    max="100"
                    value={formData.edad_2}
                    onChange={(e) => setFormData({ ...formData, edad_2: parseInt(e.target.value) || 0 })}
                    className="mt-2"
                  />
                </div>
              )}

              {(formData.group === '3' || formData.group === '4') && (
                <>
                  <div>
                    <Label>Cantidad de hijos</Label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={formData.cantidadDeHijos}
                      onChange={(e) => setFormData({ ...formData, cantidadDeHijos: parseInt(e.target.value) || 0 })}
                      className="mt-2"
                    />
                  </div>
                  
                  {formData.cantidadDeHijos > 0 && (
                    <div>
                      <Label>Edad del primer hijo</Label>
                      <Input
                        type="number"
                        min="0"
                        max="25"
                        value={formData.edadHijo1}
                        onChange={(e) => setFormData({ ...formData, edadHijo1: parseInt(e.target.value) || 0 })}
                        className="mt-2"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Anterior
              </Button>
              <Button onClick={handleNextStep} className="flex-1">
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-lg leading-relaxed space-y-4">
              <p>Mi ingreso al plan sería como:</p>
              
              <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione una opción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="P">Particular</SelectItem>
                  <SelectItem value="D">Empleado con obra social</SelectItem>
                </SelectContent>
              </Select>

              {formData.tipo === 'D' && (
                <div>
                  <Label>Mi sueldo bruto es de alrededor de</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Ingrese su sueldo en pesos"
                    value={formData.sueldo}
                    onChange={(e) => setFormData({ ...formData, sueldo: parseInt(e.target.value) || 0 })}
                    className="mt-2"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Anterior
              </Button>
              <Button onClick={handleNextStep} className="flex-1">
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Datos Personales</h3>
              
              <div>
                <Label>Nombre completo</Label>
                <Input
                  value={formData.personalData.name}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    personalData: { ...formData.personalData, name: e.target.value }
                  })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.personalData.email}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    personalData: { ...formData.personalData, email: e.target.value }
                  })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Teléfono</Label>
                <Input
                  type="tel"
                  value={formData.personalData.phone}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    personalData: { ...formData.personalData, phone: e.target.value }
                  })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Medio de contacto preferido</Label>
                <Select 
                  value={formData.personalData.medioContacto} 
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    personalData: { ...formData.personalData, medioContacto: value }
                  })}
                >
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Seleccione una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="llamada">Llamada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                Anterior
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                Enviar Cotización
              </Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="text-center space-y-6 py-8">
            <div className="text-6xl">🎉</div>
            <h3 className="text-2xl font-bold">¡Gracias!</h3>
            <p className="text-lg text-muted-foreground">
              Hemos recibido su solicitud de cotización. Nos pondremos en contacto con usted muy pronto.
            </p>
            <Button onClick={resetForm} className="w-full">
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
