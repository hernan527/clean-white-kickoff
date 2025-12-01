import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

interface FloatingQuoteButtonProps {
  onClick: () => void;
}

export const FloatingQuoteButton = ({ onClick }: FloatingQuoteButtonProps) => {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed top-4 right-4 z-50 shadow-lg hover:shadow-xl transition-shadow"
    >
      <Calculator className="mr-2 h-5 w-5" />
      Cotizar Plan
    </Button>
  );
};
