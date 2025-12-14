import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeroSlideContent, HeroSlide } from "../molecules/HeroSlideContent";
import Autoplay from "embla-carousel-autoplay";

interface ResultsHeroBannerProps {
  slides: HeroSlide[];
  plansCount: number;
  providersCount: number;
  onWhatsAppClick: () => void;
}

export const ResultsHeroBanner = ({
  slides,
  plansCount,
  providersCount,
  onWhatsAppClick,
}: ResultsHeroBannerProps) => (
  <div className="relative bg-card overflow-hidden border-b border-border">
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
    
    <div className="container mx-auto px-4 py-8 lg:py-10 relative">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <Carousel
          opts={{ align: "start", loop: true }}
          plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
          className="flex-1 text-center md:text-left"
        >
          <CarouselContent>
            {slides.map((slide, index) => (
              <CarouselItem key={index}>
                <HeroSlideContent slide={slide} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
          <div className="flex gap-2">
            <Badge className="bg-primary text-primary-foreground border-0 font-bold text-sm px-4 py-1.5 shadow-lg">
              🔥 {plansCount} planes disponibles
            </Badge>
            <Badge className="bg-muted text-muted-foreground border-border font-semibold">
              {providersCount} prepagas
            </Badge>
          </div>
          
          <Button 
            className="bg-success text-success-foreground font-bold rounded-full px-6 py-2 shadow-lg hover:bg-success/90 transition-all"
            onClick={onWhatsAppClick}
          >
            📱 Consultar por WhatsApp
          </Button>
        </div>
      </div>
    </div>
  </div>
);
