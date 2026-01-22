import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 15000); // 15 segundos max
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VPS_PUPPETEER_URL = Deno.env.get('VPS_PUPPETEER_URL');

// Simple in-memory rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60000; // 1 minute in ms
const MAX_HTML_SIZE = 500000; // 500KB max HTML size

function getRateLimitKey(req: Request): string {
  return req.headers.get('x-forwarded-for') || 
         req.headers.get('x-real-ip') || 
         'unknown';
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(key);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }
  
  if (record.count >= RATE_LIMIT) {
    return true;
  }
  
  record.count++;
  return false;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting
  const clientKey = getRateLimitKey(req);
  if (isRateLimited(clientKey)) {
    console.warn('Rate limit exceeded for:', clientKey);
    return new Response(
      JSON.stringify({ error: 'Demasiadas solicitudes. Intente nuevamente en un momento.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!VPS_PUPPETEER_URL) {
    return new Response(
      JSON.stringify({ error: 'Falta configurar la variable VPS_PUPPETEER_URL' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const { htmlContent } = body;

    // Validate HTML content exists and is a string
    if (!htmlContent || typeof htmlContent !== 'string') {
      return new Response(
        JSON.stringify({ error: 'No se proporcionó contenido HTML válido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check HTML size
    if (htmlContent.length > MAX_HTML_SIZE) {
      console.warn('HTML content too large:', htmlContent.length);
      return new Response(
        JSON.stringify({ error: 'El contenido HTML excede el tamaño máximo permitido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic validation - ensure it looks like HTML
    if (!htmlContent.includes('<') || !htmlContent.includes('>')) {
      return new Response(
        JSON.stringify({ error: 'El contenido no parece ser HTML válido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Proxy: Enviando contenido HTML a Contabo/Puppeteer, tamaño:', htmlContent.length);

const pdfResponse = await fetch(VPS_PUPPETEER_URL, {
  method: 'POST',
  signal: controller.signal, // Agregamos la señal
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ htmlContent }),
});
clearTimeout(timeout);

    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text();
      console.error('Contabo PDF generation failed:', errorText);
      return new Response(
        JSON.stringify({ error: `Error en servidor PDF: ${errorText}` }),
        { status: pdfResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Proxy: PDF recibido de Contabo. Reenviando al cliente.');

    // Get the PDF as array buffer
    const pdfBuffer = await pdfResponse.arrayBuffer();

    // Return the PDF directly as binary
    return new Response(pdfBuffer, { 
      status: 200, 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="comparacion-planes.pdf"',
      }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error al procesar la solicitud';
    console.error('Error in generate-pdf function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
