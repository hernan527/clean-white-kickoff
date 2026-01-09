import { Helmet } from 'react-helmet-async';

interface PlanSEOProps {
  plan: {
    nombre_plan: string;
    item_id: string;
    empresas: {
      nombre: string;
      imagenes: {
        logo: string;
      };
    };
    plan_clinica?: Array<{
      clinicas: {
        nombre: string;
      };
    }>;
  };
}

export const PlanSEO = ({ plan }: PlanSEOProps) => {
  if (!plan) return null;

  const nombreEmpresa = plan.empresas?.nombre || "Prepaga";
  const title = `Plan ${plan.nombre_plan} de ${nombreEmpresa} | Precios y Cartilla`;
  
  // Succionamos los nombres de las clínicas para que Google se relama
  const clinicasTexto = plan.plan_clinica && plan.plan_clinica.length > 0
    ? plan.plan_clinica.slice(0, 3).map(c => c.clinicas.nombre).join(", ")
    : "las mejores instituciones";

  const description = `Cotizá el plan ${plan.nombre_plan} de ${nombreEmpresa}. Cobertura médica en ${clinicasTexto}. ¡Obtené tu presupuesto online ahora!`;
  const canonicalUrl = `${window.location.origin}/planes/${plan.item_id}`;

  return (
    <Helmet>
      {/* 💎 Título y Descripción: Lo que Google penetra primero */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* 📱 Open Graph: Para que el link se ponga duro en redes sociales */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={plan.empresas?.imagenes?.logo} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="product" />

      {/* 🐦 Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={plan.empresas?.imagenes?.logo} />
    </Helmet>
  );
};