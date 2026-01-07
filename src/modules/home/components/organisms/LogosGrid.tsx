const BRANDS = [
  { name: "Swiss Medical", logo: "/assets/imagenes/card-header/swissmedical.webp" },
  { name: "Galeno", logo: "/assets/imagenes/card-header/galeno.webp" },
  { name: "Osde", logo: "/assets/imagenes/card-header/osde.png" },
  { name: "Sancor", logo: "/assets/imagenes/card-header/sancorsalud.webp" },
  { name: "Omint", logo: "/assets/imagenes/card-header/omint.webp" },
  { name: "Medife", logo: "/assets/imagenes/card-header/medife.webp" },
];

export const LogosGrid = () => {
  return (
    <section className="py-12 bg-slate-50 border-b border-slate-200">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
          Trabajamos con las empresas líderes
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {BRANDS.map((brand, idx) => (
            <div key={idx} className="group">
                <img 
                    src={brand.logo} 
                    alt={brand.name} 
                    className="h-8 md:h-10 object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110" 
                />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};