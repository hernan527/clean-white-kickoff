import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AttributeGroupRowProps {
  groupName: string;
  attributeCount: number;
  isCollapsed: boolean;
  onToggle: () => void;
}

export const AttributeGroupRow = ({ 
  groupName, 
  attributeCount, 
  isCollapsed, 
  onToggle 
}: AttributeGroupRowProps) => (
  <div 
    className="col-span-full flex items-center gap-2 px-4 py-3 bg-white/5 border-y border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
    onClick={onToggle}
  >
    {isCollapsed ? (
      <ChevronRight className="w-4 h-4 text-slate-500" />
    ) : (
      <ChevronDown className="w-4 h-4 text-violet-400" />
    )}
    <span className="font-bold text-sm text-white uppercase tracking-wide">{groupName}</span>
    <Badge variant="secondary" className="text-[10px] bg-white/10 border-white/10 text-slate-400 ml-2">
      {attributeCount}
    </Badge>
  </div>
);
