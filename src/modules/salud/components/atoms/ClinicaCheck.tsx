import { Check, X } from "lucide-react";

interface ClinicaCheckProps {
  included: boolean;
}

export const ClinicaCheck = ({ included }: ClinicaCheckProps) => (
  <div className="px-3 py-3 text-center border-l border-white/5 flex items-center justify-center">
    {included ? (
      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
        <Check className="h-4 w-4 text-emerald-400" />
      </div>
    ) : (
      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
        <X className="h-4 w-4 text-slate-600" />
      </div>
    )}
  </div>
);
