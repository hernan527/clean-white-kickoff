import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

interface ActivityData {
  event_type: string;
  event_data?: Json;
  page_url?: string;
  time_on_page?: number;
}

// Generate or get session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('activity_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('activity_session_id', sessionId);
  }
  return sessionId;
};

// Detect device type
const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

// Get browser name
const getBrowser = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('SamsungBrowser')) return 'Samsung';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  if (ua.includes('Trident')) return 'IE';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Unknown';
};

// Get OS
const getOS = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Mac')) return 'MacOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown';
};

export const useActivityTracker = () => {
  const location = useLocation();
  const pageStartTime = useRef<number>(Date.now());
  const lastTrackedPath = useRef<string>('');

  const trackActivity = useCallback(async (data: ActivityData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const activityRecord = {
        user_id: user?.id || null,
        session_id: getSessionId(),
        event_type: data.event_type,
        event_data: data.event_data || {},
        page_url: data.page_url || window.location.pathname,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        device_type: getDeviceType(),
        browser: getBrowser(),
        os: getOS(),
        time_on_page: data.time_on_page || null,
        session_start: new Date(parseInt(getSessionId().split('-')[0])).toISOString(),
      };

      await supabase.from('user_activity').insert([activityRecord]);
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }, []);

  // Track page views
  useEffect(() => {
    // Don't track the same path twice in a row
    if (location.pathname === lastTrackedPath.current) return;
    
    // Track time on previous page before navigating
    if (lastTrackedPath.current) {
      const timeOnPage = Math.round((Date.now() - pageStartTime.current) / 1000);
      if (timeOnPage > 0 && timeOnPage < 3600) { // Cap at 1 hour
        trackActivity({
          event_type: 'page_exit',
          page_url: lastTrackedPath.current,
          time_on_page: timeOnPage,
        });
      }
    }

    // Track new page view
    pageStartTime.current = Date.now();
    lastTrackedPath.current = location.pathname;
    
    trackActivity({
      event_type: 'page_view',
      page_url: location.pathname,
    });
  }, [location.pathname, trackActivity]);

  // Track page exit on unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      const timeOnPage = Math.round((Date.now() - pageStartTime.current) / 1000);
      if (timeOnPage > 0 && timeOnPage < 3600) {
        // Use sendBeacon for reliable tracking on page exit
        const data = {
          user_id: null,
          session_id: getSessionId(),
          event_type: 'page_exit',
          page_url: window.location.pathname,
          time_on_page: timeOnPage,
          device_type: getDeviceType(),
          browser: getBrowser(),
          os: getOS(),
        };
        
        navigator.sendBeacon(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_activity`,
          JSON.stringify(data)
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Custom event tracking
  const trackEvent = useCallback((eventType: string, eventData?: Json) => {
    trackActivity({
      event_type: eventType,
      event_data: eventData,
    });
  }, [trackActivity]);

  return { trackEvent };
};

// Standalone function for tracking without hook
export const trackActivityEvent = async (
  eventType: string, 
  eventData?: Json
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('user_activity').insert([{
      user_id: user?.id || null,
      session_id: getSessionId(),
      event_type: eventType,
      event_data: eventData || {},
      page_url: window.location.pathname,
      user_agent: navigator.userAgent,
      device_type: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
    }]);
  } catch (error) {
    console.error('Error tracking activity:', error);
  }
};
