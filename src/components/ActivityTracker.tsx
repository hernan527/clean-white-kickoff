import { useActivityTracker } from '@/hooks/useActivityTracker';

/**
 * Component that enables activity tracking throughout the app.
 * Place this inside BrowserRouter to track page views automatically.
 */
export const ActivityTracker = () => {
  useActivityTracker();
  return null;
};
