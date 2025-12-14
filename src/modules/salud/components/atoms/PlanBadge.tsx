import { Badge } from "@/components/ui/badge";

interface PlanBadgeProps {
  value: string;
  className?: string;
}

export const PlanBadge = ({ value, className = "" }: PlanBadgeProps) => (
  <Badge 
    variant={value === 'N/A' || value === 'No' || value === '-' ? 'secondary' : 'default'}
    className={`text-xs font-normal ${value === 'N/A' || value === 'No' || value === '-' ? 'bg-white/5 text-slate-500 border-white/10' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/20'} ${className}`}
  >
    {value}
  </Badge>
);
