import { supabase } from '@/integrations/supabase/client';
import { QuoteFormData, QuoteResponse } from '@/core/interfaces/plan/quoteFormData';

/**
 * Submits a quote request through the Supabase edge function
 */
export const submitQuote = async (formData: QuoteFormData): Promise<QuoteResponse> => {
  try {
    console.log('📤 Enviando cotización a edge function...');
    console.log("DATOS ENVIADOS A SUPABASE:", JSON.stringify(formData, null, 2));
    const { data, error } = await supabase.functions.invoke('submit-quote', {
      body: formData
    });

    if (error) {
      console.error('❌ Error submitting quote to Supabase:', error);
      return {
        success: false,
        error: error.message || 'Error al enviar la cotización'
      };
    }
    
    console.log('✅ Resultado de Supabase:', data);
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('❌ Error en submitQuote:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

// --- Health Service Object ---
export const HealthService = {
  submitQuote: submitQuote
};

export default HealthService;
