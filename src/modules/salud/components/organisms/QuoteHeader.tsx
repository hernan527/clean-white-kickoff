import { Calendar, Users, MapPin, FileText, Phone, Mail, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface QuoteHeaderProps {
  quoteName?: string;
  createdAt?: string;
  familyGroup?: string;
  requestType?: string;
  residenceZone?: string;
  customMessage?: string | null;
  // Datos del Asesor (Podrían venir de la cotización o del usuario vendedor)
  advisorName?: string;
  advisorPhone?: string;
}

export const QuoteHeader = ({
  quoteName,
  createdAt,
  familyGroup,
  requestType,
  residenceZone,
  customMessage,
  advisorName = "Tu Asesor de Confianza", // Default o prop
  advisorPhone
}: QuoteHeaderProps) => {
  
  return (
    <div className="w-full bg-white border-b border-slate-200 pb-8 pt-6 px-4 md:px-8 rounded-b-[2.5rem] shadow-sm mb-8">
      <div className="max-w-5xl mx-auto">
        
        {/* 1. BARRA SUPERIOR: ASESOR Y TÍTULO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-slate-100 pb-6">
            
            {/* Perfil Asesor */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Avatar className="h-14 w-14 border-2 border-teal-100 shadow-sm">
                        <AvatarImage src="/assets/imagenes/avatars/advisor-placeholder.png" />
                        <AvatarFallback className="bg-teal-50 text-teal-700 font-bold text-lg">
                            {advisorName.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 h-4 w-4 rounded-full border-2 border-white" title="Online"></div>
                </div>
                <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Cotización presentada por</p>
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">{advisorName}</h2>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500 flex items-center gap-1"><ShieldCheck size={12} className="text-teal-600"/> Mat. 1234</span>
                        {advisorPhone && <span className="text-xs text-slate-500 flex items-center gap-1"><Phone size={12} /> {advisorPhone}</span>}
                    </div>
                </div>
            </div>

            {/* Badge de Estado */}
            <div className="flex flex-col items-end">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                    Propuesta Personalizada
                </Badge>
                <p className="text-xs text-slate-400 mt-2">Válida por 15 días</p>
            </div>
        </div>

        {/* 2. MENSAJE PERSONALIZADO (Si existe) */}
        {customMessage && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-8 relative">
                <div className="absolute -top-3 left-6 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Mensaje del Asesor
                </div>
                <p className="text-slate-700 text-sm italic leading-relaxed">
                    "{customMessage}"
                </p>
            </div>
        )}

        {/* 3. DATOS DEL PERFIL (Grid limpia) */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg text-slate-400 shadow-sm"><Users size={16} /></div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Grupo Familiar</p>
                        <p className="text-sm font-bold text-slate-800 capitalize">{familyGroup || "Individual"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg text-slate-400 shadow-sm"><MapPin size={16} /></div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Zona</p>
                        <p className="text-sm font-bold text-slate-800">{residenceZone || "AMBA"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg text-slate-400 shadow-sm"><FileText size={16} /></div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Tipo</p>
                        <p className="text-sm font-bold text-slate-800 capitalize">{requestType === 'cambio_os' ? 'Derivación Aportes' : 'Particular'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg text-slate-400 shadow-sm"><Calendar size={16} /></div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Fecha</p>
                        <p className="text-sm font-bold text-slate-800">{new Date(createdAt || Date.now()).toLocaleDateString('es-AR')}</p>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};