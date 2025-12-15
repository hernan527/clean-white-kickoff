import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { hasRole } from '@/services/roles.service';

interface AdminAuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
}

export const useAdminAuth = () => {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    session: null,
    isAdmin: false,
    isLoading: true,
  });

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));

        // Check admin role after auth state change
        if (session?.user) {
          setTimeout(async () => {
            const isAdmin = await hasRole(session.user.id, 'admin');
            setState(prev => ({
              ...prev,
              isAdmin,
              isLoading: false,
            }));
          }, 0);
        } else {
          setState(prev => ({
            ...prev,
            isAdmin: false,
            isLoading: false,
          }));
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
      }));

      if (session?.user) {
        const isAdmin = await hasRole(session.user.id, 'admin');
        setState(prev => ({
          ...prev,
          isAdmin,
          isLoading: false,
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    ...state,
    signOut,
  };
};
