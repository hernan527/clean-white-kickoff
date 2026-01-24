import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface SavedQuote {
  id: string;
  user_id: string;
  plan_ids: string[];
  form_data: Json;
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
  // New fields for enhanced persistence
  quote_name: string | null;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  family_group: string;
  request_type: string;
  residence_zone: string;
  custom_message: string | null;
  edited_prices: Record<string, number>;
  pdf_html: string | null;
  // Public sharing fields
  public_token: string;
  access_code: string | null;
  is_public: boolean;
  view_count: number;
  last_viewed_at: string | null;
  first_viewed_at: string | null;
}

export interface CreateQuoteData {
  plan_ids: string[];
  form_data: Json;
  notes?: string;
  quote_name?: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  family_group?: string;
  request_type?: string;
  residence_zone?: string;
  custom_message?: string;
  edited_prices?: Record<string, number>;
  pdf_html?: string;
  is_public?: boolean;
  access_code?: string;
}

export interface UpdateQuoteData {
  quote_name?: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  family_group?: string;
  request_type?: string;
  residence_zone?: string;
  custom_message?: string;
  edited_prices?: Record<string, number>;
  pdf_html?: string;
  notes?: string;
  status?: QuoteStatus;
  is_public?: boolean;
  access_code?: string;
}

export type QuoteStatus = 'pending' | 'contacted' | 'completed' | 'cancelled';

export interface QuoteView {
  id: string;
  quote_id: string;
  viewed_at: string;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  time_on_page: number | null;
  downloaded_pdf: boolean;
}

/**
 * Get the current authenticated user ID
 */
const getCurrentUserId = async (): Promise<string | null> => {
  // Prefer local session (fast + reliable) to avoid transient getUser() nulls
  const { data: sessionData } = await supabase.auth.getSession();
  const sessionUserId = sessionData.session?.user?.id;
  if (sessionUserId) return sessionUserId;

  // Fallback to remote user fetch
  const { data: userData } = await supabase.auth.getUser();
  return userData.user?.id || null;
};

/**
 * Get all quotes for the current user
 */
export const getUserQuotes = async (
  userId: string
): Promise<{ quotes: SavedQuote[]; error: Error | null }> => {
  const currentUserId = await getCurrentUserId();
  
  // Security check: only allow fetching own quotes
  if (!currentUserId || currentUserId !== userId) {
    return { quotes: [], error: new Error('Unauthorized') };
  }

  const { data, error } = await supabase
    .from('saved_quotes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return {
    quotes: (data as SavedQuote[]) || [],
    error: error as Error | null,
  };
};

/**
 * Get a single quote by ID (with owner verification)
 */
export const getQuoteById = async (
  quoteId: string
): Promise<{ quote: SavedQuote | null; error: Error | null }> => {
  const currentUserId = await getCurrentUserId();
  
  if (!currentUserId) {
    return { quote: null, error: new Error('Not authenticated') };
  }

  const { data, error } = await supabase
    .from('saved_quotes')
    .select('*')
    .eq('id', quoteId)
    .eq('user_id', currentUserId) // Owner verification
    .maybeSingle();

  return {
    quote: data as SavedQuote | null,
    error: error as Error | null,
  };
};

/**
 * Public quote interface - excludes PII fields for security
 */
export interface PublicQuote {
  id: string;
  quote_name: string | null;
  family_group: string;
  request_type: string;
  residence_zone: string;
  plan_ids: string[];
  form_data: Json;
  custom_message: string | null;
  edited_prices: Record<string, number>;
  pdf_html: string | null;
  public_token: string;
  is_public: boolean;
  view_count: number;
  created_at: string | null;
  // PII fields excluded: client_name, client_email, client_phone, access_code
}

/**
 * Get a public quote by token - excludes PII fields for security
 */
export const getQuoteByToken = async (
  token: string
): Promise<{ quote: PublicQuote | null; error: Error | null }> => {
  // Only select non-PII fields to prevent data exposure
  const { data, error } = await supabase
    .from('saved_quotes')
    .select(`
      id,
      quote_name,
      family_group,
      request_type,
      residence_zone,
      plan_ids,
      form_data,
      custom_message,
      edited_prices,
      pdf_html,
      public_token,
      is_public,
      view_count,
      created_at
    `)
    .eq('public_token', token)
    .eq('is_public', true)
    .maybeSingle();

  return {
    quote: data as PublicQuote | null,
    error: error as Error | null,
  };
};

/**
 * Save a new quote
 */
export const saveQuote = async (
  userId: string,
  quoteData: CreateQuoteData
): Promise<{ quote: SavedQuote | null; error: Error | null }> => {
  const currentUserId = await getCurrentUserId();
  
  // Security check: only allow saving quotes for current user
  if (!currentUserId || currentUserId !== userId) {
    return { quote: null, error: new Error('Unauthorized') };
  }

  const { data, error } = await supabase
    .from('saved_quotes')
    .insert([
      {
        user_id: userId,
        plan_ids: quoteData.plan_ids,
        form_data: quoteData.form_data,
        notes: quoteData.notes || null,
        quote_name: quoteData.quote_name || null,
        client_name: quoteData.client_name || null,
        client_email: quoteData.client_email || null,
        client_phone: quoteData.client_phone || null,
        family_group: quoteData.family_group || 'individual',
        request_type: quoteData.request_type || 'particular',
        residence_zone: quoteData.residence_zone || 'AMBA',
        custom_message: quoteData.custom_message || null,
        edited_prices: quoteData.edited_prices || {},
        pdf_html: quoteData.pdf_html || null,
        is_public: quoteData.is_public || false,
        access_code: quoteData.access_code || null,
      },
    ])
    .select()
    .single();

  return {
    quote: data as SavedQuote | null,
    error: error as Error | null,
  };
};

/**
 * Update an existing quote (with owner verification)
 */
export const updateQuote = async (
  quoteId: string,
  quoteData: UpdateQuoteData
): Promise<{ quote: SavedQuote | null; error: Error | null }> => {
  const currentUserId = await getCurrentUserId();
  
  if (!currentUserId) {
    return { quote: null, error: new Error('Not authenticated') };
  }

  const { data, error } = await supabase
    .from('saved_quotes')
    .update(quoteData)
    .eq('id', quoteId)
    .eq('user_id', currentUserId) // Owner verification
    .select()
    .single();

  return {
    quote: data as SavedQuote | null,
    error: error as Error | null,
  };
};

/**
 * Update quote status (with owner verification)
 */
export const updateQuoteStatus = async (
  quoteId: string,
  status: QuoteStatus
): Promise<{ quote: SavedQuote | null; error: Error | null }> => {
  const currentUserId = await getCurrentUserId();
  
  if (!currentUserId) {
    return { quote: null, error: new Error('Not authenticated') };
  }

  const { data, error } = await supabase
    .from('saved_quotes')
    .update({ status })
    .eq('id', quoteId)
    .eq('user_id', currentUserId) // Owner verification
    .select()
    .single();

  return {
    quote: data as SavedQuote | null,
    error: error as Error | null,
  };
};

/**
 * Update quote notes (with owner verification)
 */
export const updateQuoteNotes = async (
  quoteId: string,
  notes: string
): Promise<{ quote: SavedQuote | null; error: Error | null }> => {
  const currentUserId = await getCurrentUserId();
  
  if (!currentUserId) {
    return { quote: null, error: new Error('Not authenticated') };
  }

  const { data, error } = await supabase
    .from('saved_quotes')
    .update({ notes })
    .eq('id', quoteId)
    .eq('user_id', currentUserId) // Owner verification
    .select()
    .single();

  return {
    quote: data as SavedQuote | null,
    error: error as Error | null,
  };
};

/**
 * Delete a quote (with owner verification)
 */
export const deleteQuote = async (
  quoteId: string
): Promise<{ error: Error | null }> => {
  const currentUserId = await getCurrentUserId();
  
  if (!currentUserId) {
    return { error: new Error('Not authenticated') };
  }

  const { error } = await supabase
    .from('saved_quotes')
    .delete()
    .eq('id', quoteId)
    .eq('user_id', currentUserId); // Owner verification

  return { error: error as Error | null };
};

/**
 * Record a quote view (for public quotes)
 */
export const recordQuoteView = async (
  quoteId: string,
  accessCode?: string,
  userAgent?: string,
  referrer?: string
): Promise<{ success: boolean; error: Error | null }> => {
  const { data, error } = await supabase
    .rpc('record_quote_view', {
      p_quote_id: quoteId,
      p_access_code: accessCode || null,
      p_ip_address: null,
      p_user_agent: userAgent || null,
      p_referrer: referrer || null,
    });

  return {
    success: !error,
    error: error as Error | null,
  };
};

/**
 * Get quote views (with owner verification)
 */
export const getQuoteViews = async (
  quoteId: string
): Promise<{ views: QuoteView[]; error: Error | null }> => {
  const currentUserId = await getCurrentUserId();
  
  if (!currentUserId) {
    return { views: [], error: new Error('Not authenticated') };
  }

  // First verify the quote belongs to the current user
  const { data: quote } = await supabase
    .from('saved_quotes')
    .select('id')
    .eq('id', quoteId)
    .eq('user_id', currentUserId)
    .maybeSingle();
    
  if (!quote) {
    return { views: [], error: new Error('Quote not found or unauthorized') };
  }

  const { data, error } = await supabase
    .from('quote_views')
    .select('*')
    .eq('quote_id', quoteId)
    .order('viewed_at', { ascending: false });

  return {
    views: (data as QuoteView[]) || [],
    error: error as Error | null,
  };
};

/**
 * Generate a public sharing URL for a quote
 */
export const getPublicQuoteUrl = (token: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/cotizacion/${token}`;
};

/**
 * Toggle quote public status (with owner verification)
 */
export const toggleQuotePublic = async (
  quoteId: string,
  isPublic: boolean
): Promise<{ quote: SavedQuote | null; error: Error | null }> => {
  const currentUserId = await getCurrentUserId();
  
  if (!currentUserId) {
    return { quote: null, error: new Error('Not authenticated') };
  }

  const { data, error } = await supabase
    .from('saved_quotes')
    .update({ is_public: isPublic })
    .eq('id', quoteId)
    .eq('user_id', currentUserId) // Owner verification
    .select()
    .single();

  return {
    quote: data as SavedQuote | null,
    error: error as Error | null,
  };
};

/**
 * Set access code for a quote (with owner verification)
 */
export const setQuoteAccessCode = async (
  quoteId: string,
  accessCode: string | null
): Promise<{ quote: SavedQuote | null; error: Error | null }> => {
  const currentUserId = await getCurrentUserId();
  
  if (!currentUserId) {
    return { quote: null, error: new Error('Not authenticated') };
  }

  const { data, error } = await supabase
    .from('saved_quotes')
    .update({ access_code: accessCode })
    .eq('id', quoteId)
    .eq('user_id', currentUserId) // Owner verification
    .select()
    .single();

  return {
    quote: data as SavedQuote | null,
    error: error as Error | null,
  };
};

/**
 * Make a quote public (alias for toggleQuotePublic with isPublic=true)
 */
export const makeQuotePublic = async (
  quoteId: string
): Promise<{ quote: SavedQuote | null; error: Error | null }> => {
  return toggleQuotePublic(quoteId, true);
};

/**
 * Make a quote private (alias for toggleQuotePublic with isPublic=false)
 */
export const makeQuotePrivate = async (
  quoteId: string
): Promise<{ quote: SavedQuote | null; error: Error | null }> => {
  return toggleQuotePublic(quoteId, false);
};

const QuotesService = {
  getUserQuotes,
  getQuoteById,
  getQuoteByToken,
  saveQuote,
  updateQuote,
  updateQuoteStatus,
  updateQuoteNotes,
  deleteQuote,
  recordQuoteView,
  getQuoteViews,
  getPublicQuoteUrl,
  toggleQuotePublic,
  setQuoteAccessCode,
  makeQuotePublic,
  makeQuotePrivate,
};

export default QuotesService;
