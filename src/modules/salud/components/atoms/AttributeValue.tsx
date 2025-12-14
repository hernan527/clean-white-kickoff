import { PlanBadge } from './PlanBadge';

interface AttributeValueProps {
  value: string;
}

export const AttributeValue = ({ value }: AttributeValueProps) => (
  <div className="px-3 py-3 text-center border-l border-white/5">
    <PlanBadge value={value} />
  </div>
);
