interface HeroSlide {
  title: string;
  subtitle: string;
}

interface HeroSlideContentProps {
  slide: HeroSlide;
}

export const HeroSlideContent = ({ slide }: HeroSlideContentProps) => (
  <>
    <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground dark:text-primary-foreground drop-shadow-lg">
      {slide.title}
    </h1>
    <p className="text-muted-foreground dark:text-primary-foreground/90 text-base mt-2 font-medium">
      {slide.subtitle}
    </p>
  </>
);

export type { HeroSlide };
