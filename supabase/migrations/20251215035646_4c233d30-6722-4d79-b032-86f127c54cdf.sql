-- Create user activity tracking table
CREATE TABLE public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_type TEXT NOT NULL, -- 'page_view', 'quote_created', 'plan_viewed', 'login', 'logout', etc.
  event_data JSONB DEFAULT '{}',
  page_url TEXT,
  referrer TEXT,
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  session_start TIMESTAMPTZ,
  time_on_page INTEGER, -- seconds
  scroll_depth INTEGER, -- percentage 0-100
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for common queries
CREATE INDEX idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX idx_user_activity_event_type ON public.user_activity(event_type);
CREATE INDEX idx_user_activity_created_at ON public.user_activity(created_at DESC);
CREATE INDEX idx_user_activity_session_id ON public.user_activity(session_id);

-- Enable RLS
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Only admins can view all activity
CREATE POLICY "Admins can view all activity"
ON public.user_activity
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Anyone can insert activity (for anonymous tracking)
CREATE POLICY "Anyone can insert activity"
ON public.user_activity
FOR INSERT
WITH CHECK (true);

-- Create admin activity summary view for dashboard
CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.user_roles WHERE role = 'vendor') as total_vendors,
  (SELECT COUNT(*) FROM public.saved_quotes) as total_quotes,
  (SELECT COUNT(*) FROM public.quote_views) as total_quote_views,
  (SELECT COUNT(DISTINCT session_id) FROM public.user_activity WHERE created_at > NOW() - INTERVAL '24 hours') as active_sessions_24h,
  (SELECT COUNT(*) FROM public.user_activity WHERE event_type = 'quote_created' AND created_at > NOW() - INTERVAL '7 days') as quotes_last_7_days;

-- Grant access to the view for admins
CREATE POLICY "Admins can view dashboard stats"
ON public.user_activity
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Add admin role to user_roles if not exists
-- This will be used to grant admin access
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'admin@mejorplan.com'
ON CONFLICT DO NOTHING;