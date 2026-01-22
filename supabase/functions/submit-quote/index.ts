import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Zod schema for input validation
const personalDataSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().min(8).max(20),
  region: z.string().max(50).optional().default(''),
  medioContacto: z.string().max(20).optional().default(''),
});

// Transform to handle empty personalData objects
const quoteRequestSchema = z.object({
  group: z.number().min(1).max(4),
  edad_1: z.number().min(0).max(120),
  edad_2: z.number().min(0).max(120).optional(),
  numkids: z.number().min(0).max(5).optional(),
  edadHijo1: z.number().min(0).max(30).optional(),
  edadHijo2: z.number().min(0).max(30).optional(),
  edadHijo3: z.number().min(0).max(30).optional(),
  edadHijo4: z.number().min(0).max(30).optional(),
  edadHijo5: z.number().min(0).max(30).optional(),
  zone_type: z.string().max(50).optional(),
  empresa_prepaga: z.string().max(50).optional(),
  tipo: z.enum(['P', 'D']),
  sueldo: z.number().min(0).max(100000000).optional(),
  aporteOS: z.number().min(0).max(100000000).optional(),
  // personalData - accept any object shape, validate only if has non-empty values
  personalData: z.any().optional(),
}).transform((data) => {
  // If personalData exists but has empty required fields, set it to undefined
  if (data.personalData) {
    const pd = data.personalData;
    const hasValidData = pd.name?.trim() && pd.email?.trim() && pd.phone?.trim();
    if (!hasValidData) {
      return { ...data, personalData: undefined };
    }
    // Validate the personalData only if it has content
    const validatedPd = personalDataSchema.safeParse(pd);
    if (!validatedPd.success) {
      return { ...data, personalData: undefined };
    }
    return { ...data, personalData: validatedPd.data };
  }
  return data;
});

type QuoteRequest = z.infer<typeof quoteRequestSchema>;

// Simple in-memory rate limiter (per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // Max 10 requests per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ error: 'Demasiadas solicitudes. Intente nuevamente en un minuto.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar que la URL externa esté configurada (fail-fast)
    const EXTERNAL_QUOTE_URL = Deno.env.get('HEALTH_EXTERNAL_QUOTE_URL');
    if (!EXTERNAL_QUOTE_URL) {
      console.error('ERROR: Variable de entorno HEALTH_EXTERNAL_QUOTE_URL no configurada.');
      return new Response(
        JSON.stringify({ error: 'Configuración de servidor incompleta.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parsear y validar el cuerpo de la solicitud
    const rawData = await req.json();
    const parseResult = quoteRequestSchema.safeParse(rawData);
    
    if (!parseResult.success) {
      console.error('Validation error:', parseResult.error.flatten());
      return new Response(
        JSON.stringify({ 
          error: 'Datos de solicitud inválidos.',
          details: parseResult.error.flatten().fieldErrors
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const quoteData: QuoteRequest = parseResult.data;
    
    // Log only non-sensitive data
    console.log('Submit Quote - Processing request', { 
      group: quoteData.group, 
      tipo: quoteData.tipo,
      hasPersonalData: !!quoteData.personalData 
    });

    // Preparar datos para enviar al endpoint externo
    const externalPayload = {
      group: quoteData.group,
      empresa_prepaga: quoteData.empresa_prepaga || "todas", // <--- AGREGÁ ESTA LÍNEA
      edad_1: quoteData.edad_1,
      edad_2: quoteData.edad_2 || 0,
      numkids: quoteData.numkids || 0,
      edadHijo1: quoteData.edadHijo1 || 0,
      edadHijo2: quoteData.edadHijo2 || 0,
      edadHijo3: quoteData.edadHijo3 || 0,
      edadHijo4: quoteData.edadHijo4 || 0,
      edadHijo5: quoteData.edadHijo5 || 0,
      zone_type: quoteData.zone_type || '',
      tipo: quoteData.tipo,
      sueldo: quoteData.sueldo || 0,
      aporteOS: quoteData.aporteOS || 0,
      personalData: quoteData.personalData,
      timestamp: new Date().toISOString()
    };

    // Hacer la llamada al endpoint externo
    const externalResponse = await fetch(EXTERNAL_QUOTE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(externalPayload),
    });

    if (!externalResponse.ok) {
      const errorText = await externalResponse.text();
      console.error(`Submit Quote - External endpoint error (${externalResponse.status})`);
      return new Response(
        JSON.stringify({ 
          error: 'Error al procesar la cotización',
        }),
        { 
          status: externalResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const externalData = await externalResponse.json();
    console.log('Submit Quote - Success');

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: externalData,
        message: 'Cotización enviada exitosamente' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Submit Quote - Unexpected error:', error instanceof Error ? error.message : 'Unknown');
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
