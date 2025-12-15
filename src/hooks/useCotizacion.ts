import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { QuoteFormData } from '@/core/interfaces/plan/quoteFormData';
import { submitQuote } from '@/services/health.service';
import {  type HealthPlan } from '@/core/interfaces/plan/planes';

import { initialFormData } from '@/data/initialFormData';
const STORAGE_KEY = 'last_cotizacion_form';
const QUOTE_CODE_KEY = 'quote_code';

interface UseCotizacionReturn {
  formData: QuoteFormData;
  setFormData: (data: QuoteFormData) => void;
  updateFormData: (fields: Partial<QuoteFormData>) => void;
  savedFormData: QuoteFormData | null;
  showRecoveryModal: boolean;
  setShowRecoveryModal: (show: boolean) => void;
  handleRecoverForm: () => void;
  handleStartNew: () => void;
  saveFormToStorage: (data: QuoteFormData) => void;
  clearStoredForm: () => void;
  isFormDirty: boolean;
  initialFormData: QuoteFormData;
  // New properties for cotización state
  cotizacionData: HealthPlan[];
  isLoading: boolean;
  fetchCotizacion: (formData?: QuoteFormData) => Promise<void>;
  hasFetched: boolean;
  // Pre-fetched data when recovery modal shows
  recoveryDataLoading: boolean;
  quoteCode: string | null;
  setQuoteCode: (code: string | null) => void;
}

export const useCotizacion = (): UseCotizacionReturn => {
  const location = useLocation();
  const [formData, setFormDataState] = useState<QuoteFormData>(initialFormData);
  const [savedFormData, setSavedFormData] = useState<QuoteFormData | null>(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);
  
  // New state for cotización data
  const [cotizacionData, setCotizacionData] = useState<HealthPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [recoveryDataLoading, setRecoveryDataLoading] = useState(false);
  const [quoteCode, setQuoteCode] = useState<string | null>(() => {
    try {
      return localStorage.getItem(QUOTE_CODE_KEY);
    } catch {
      return null;
    }
  });
  
  // Ref to track if we should auto-fetch
  const shouldAutoFetch = useRef(true);
  // Track if coming from home page
  const cameFromHome = useRef(false);

  // Fetch cotización from API
const fetchCotizacion = useCallback(async (formDataToUse?: QuoteFormData) => {
    setIsLoading(true);
    const formToSend = formDataToUse || formData;
    try {
        const result = await submitQuote(formToSend);
        
        // Extract the plans array from the nested response structure
        // Response structure: { success: true, data: { data: [...plans], message, success } }
        const plansArray = result.data?.data;
        
        if (result.success && Array.isArray(plansArray)) {
            // Deduplicate plans by _id to prevent duplicates
            const typedPlans = plansArray as HealthPlan[];
            const uniquePlans = typedPlans.reduce((acc: HealthPlan[], plan: HealthPlan) => {
              if (!acc.find(p => p._id === plan._id)) {
                acc.push(plan);
              }
              return acc;
            }, []);
            
            // SUCCESS: Handle data and state updates
            setCotizacionData(uniquePlans);
            setHasFetched(true);
            
            console.log('✅ Cotización fetched successfully:', uniquePlans.length, 'planes (deduplicados de', typedPlans.length, ')');

            // Save the form data used for this fetch
            if (formToSend.group !== null) {
                setFormDataState(formToSend);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(formToSend));
            }
        } else {
            // FAILURE: Handle API response error
            console.error('Error fetching cotización: Respuesta API inválida o fallida.', result.error);
        }

    } catch (error) {
        // CATCH: Handle network or service exception
        console.error('Error en fetchCotizacion (Network or API Exception):', error);
        throw error;
    } finally {
        setIsLoading(false);
    }
}, [formData]); // Dependencies remain the same
  // Check localStorage on mount - handle different navigation scenarios
  useEffect(() => {
    if (hasCheckedStorage) return;
    
    // Check if coming from quote modal with fresh data
    const fromQuote = location.state?.fromQuote === true;
    const formDataFromState = location.state?.formData as QuoteFormData | undefined;
    
    if (fromQuote && formDataFromState) {
      // Coming from quote modal - fetch with that data immediately
      setFormDataState(formDataFromState);
      shouldAutoFetch.current = false;
      fetchCotizacion(formDataFromState);
      setHasCheckedStorage(true);
      return;
    }
    
    // Check if user navigated from home page
    const referrer = document.referrer;
    const isFromHome = referrer.includes('/') && !referrer.includes('/resultados') && 
                       !referrer.includes('/comparar') || 
                       location.state?.fromHome === true;
    cameFromHome.current = isFromHome;
    
    try {
      const storedForm = localStorage.getItem(STORAGE_KEY);
      if (storedForm && isFromHome) {
        const parsedForm = JSON.parse(storedForm) as QuoteFormData;
        // Validate that the stored form has essential data
        if (parsedForm.group !== null && parsedForm.group !== undefined) {
          setSavedFormData(parsedForm);
          setShowRecoveryModal(true);
          // NO bloquear ni auto-fetch aquí - solo mostrar modal como bienvenida
          // El fetch se hace cuando el usuario elige "Continuar"
        }
      }
    } catch (error) {
      console.error('Error reading stored form:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
    setHasCheckedStorage(true);
  }, [hasCheckedStorage, location.state, fetchCotizacion]);

  // Auto-fetch on mount if no saved form
  useEffect(() => {
    if (hasCheckedStorage && shouldAutoFetch.current && !hasFetched && cotizacionData.length === 0) {
      fetchCotizacion(initialFormData);
    }
  }, [hasCheckedStorage, hasFetched, cotizacionData.length, fetchCotizacion]);

  // Save form to localStorage
  const saveFormToStorage = useCallback((data: QuoteFormData) => {
    try {
      // Only save if form has meaningful data
      if (data.group !== null) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setIsFormDirty(true);
      }
    } catch (error) {
      console.error('Error saving form to storage:', error);
    }
  }, []);

  // Clear stored form
  const clearStoredForm = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setSavedFormData(null);
      setIsFormDirty(false);
    } catch (error) {
      console.error('Error clearing stored form:', error);
    }
  }, []);

  // Set form data and optionally save to storage
  const setFormData = useCallback((data: QuoteFormData) => {
    setFormDataState(data);
    saveFormToStorage(data);
  }, [saveFormToStorage]);

  // Update partial form data
  const updateFormData = useCallback((fields: Partial<QuoteFormData>) => {
    setFormDataState(prev => {
      const updated = { ...prev, ...fields };
      saveFormToStorage(updated);
      return updated;
    });
  }, [saveFormToStorage]);

  // Recover saved form - fetch when user confirms
  const handleRecoverForm = useCallback(() => {
    if (savedFormData) {
      setFormDataState(savedFormData);
      setShowRecoveryModal(false);
      shouldAutoFetch.current = false;
      // Fetch con los datos guardados cuando el usuario confirma
      setRecoveryDataLoading(true);
      fetchCotizacion(savedFormData).finally(() => {
        setRecoveryDataLoading(false);
      });
    }
  }, [savedFormData, fetchCotizacion]);

  // Start with new form and fetch initial cotización
  const handleStartNew = useCallback(() => {
    clearStoredForm();
    setFormDataState(initialFormData);
    setShowRecoveryModal(false);
    // Fetch with initial form data
    fetchCotizacion(initialFormData);
  }, [clearStoredForm, fetchCotizacion]);
  
  // Save quote code to localStorage
  const handleSetQuoteCode = useCallback((code: string | null) => {
    setQuoteCode(code);
    if (code) {
      localStorage.setItem(QUOTE_CODE_KEY, code);
    } else {
      localStorage.removeItem(QUOTE_CODE_KEY);
    }
  }, []);

  return {
    formData,
    setFormData,
    updateFormData,
    savedFormData,
    showRecoveryModal,
    setShowRecoveryModal,
    handleRecoverForm,
    handleStartNew,
    saveFormToStorage,
    clearStoredForm,
    isFormDirty,
    initialFormData,
    // New returns
    cotizacionData,
    isLoading,
    fetchCotizacion,
    hasFetched,
    recoveryDataLoading,
    quoteCode,
    setQuoteCode: handleSetQuoteCode
  };
};

// Helper to get group description
export const getGroupDescription = (group: number | null): string => {
  switch (group) {
    case 1: return 'Individual';
    case 2: return 'Titular + Hijos';
    case 3: return 'Pareja';
    case 4: return 'Pareja + Hijos';
    default: return 'Sin definir';
  }
};

// Helper to get family summary
export const getFamilySummary = (formData: QuoteFormData): string => {
  const parts: string[] = [];
  
  if (formData.edad_1 > 0) {
    parts.push(`Titular: ${formData.edad_1} años`);
  }
  
  if (formData.edad_2 > 0 && (formData.group === 3 || formData.group === 4)) {
    parts.push(`Pareja: ${formData.edad_2} años`);
  }
  
  if (formData.numkids > 0) {
    const childAges: number[] = [];
    if (formData.edadHijo1) childAges.push(formData.edadHijo1);
    if (formData.edadHijo2) childAges.push(formData.edadHijo2);
    if (formData.edadHijo3) childAges.push(formData.edadHijo3);
    if (formData.edadHijo4) childAges.push(formData.edadHijo4);
    if (formData.edadHijo5) childAges.push(formData.edadHijo5);
    
    if (childAges.length > 0) {
      parts.push(`${childAges.length} hijo${childAges.length > 1 ? 's' : ''}: ${childAges.join(', ')} años`);
    }
  }
  
  return parts.join(' • ');
};

export default useCotizacion;
