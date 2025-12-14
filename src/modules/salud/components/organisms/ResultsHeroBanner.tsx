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
  <div className="relative bg-gradient-to-br from-slate-900 via-violet-950/50 to-slate-900 overflow-hidden border-b border-white/10">
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-transparent to-cyan-600/10" />
    
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
            <Badge className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-0 font-bold text-sm px-4 py-1.5 shadow-lg shadow-violet-500/25">
              🔥 {plansCount} planes disponibles
            </Badge>
            <Badge className="bg-white/10 text-white border-white/20 hover:bg-white/20 font-semibold backdrop-blur-sm">
              {providersCount} prepagas
            </Badge>
          </div>
          
          <Button 
            className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold rounded-full px-6 py-2 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
            onClick={onWhatsAppClick}
          >
            📱 Consultar por WhatsApp
          </Button>
        </div>
      </div>
    </div>
  </div>
);
