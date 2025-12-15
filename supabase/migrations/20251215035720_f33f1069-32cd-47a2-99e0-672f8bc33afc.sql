-- Drop the problematic view that exposes auth.users
DROP VIEW IF EXISTS public.admin_dashboard_stats;

-- Create a security definer function instead (safer approach)
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Only allow admins to call this function
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_vendors', (SELECT COUNT(*) FROM user_roles WHERE role = 'vendor'),
    'total_quotes', (SELECT COUNT(*) FROM saved_quotes),
    'total_quote_views', (SELECT COUNT(*) FROM quote_views),
    'active_sessions_24h', (SELECT COUNT(DISTINCT session_id) FROM user_activity WHERE created_at > NOW() - INTERVAL '24 hours'),
    'quotes_last_7_days', (SELECT COUNT(*) FROM user_activity WHERE event_type = 'quote_created' AND created_at > NOW() - INTERVAL '7 days')
  ) INTO result;

  RETURN result;
END;
$$;

-- Create function to get all users for admin
CREATE OR REPLACE FUNCTION public.get_admin_users_list()
RETURNS TABLE (
  id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    au.email::TEXT,
    p.first_name,
    p.last_name,
    p.phone,
    p.avatar_url,
    COALESCE(ur.role::TEXT, 'user') as role,
    p.created_at,
    au.last_sign_in_at as last_sign_in
  FROM profiles p
  LEFT JOIN auth.users au ON au.id = p.id
  LEFT JOIN user_roles ur ON ur.user_id = p.id
  ORDER BY p.created_at DESC;
END;
$$;

-- Create function to get user activity for admin
CREATE OR REPLACE FUNCTION public.get_admin_user_activity(
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_email TEXT,
  session_id TEXT,
  event_type TEXT,
  event_data JSONB,
  page_url TEXT,
  ip_address TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  time_on_page INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    ua.id,
    ua.user_id,
    COALESCE(au.email::TEXT, 'Anonymous') as user_email,
    ua.session_id,
    ua.event_type,
    ua.event_data,
    ua.page_url,
    ua.ip_address,
    ua.device_type,
    ua.browser,
    ua.os,
    ua.country,
    ua.city,
    ua.time_on_page,
    ua.created_at
  FROM user_activity ua
  LEFT JOIN auth.users au ON au.id = ua.user_id
  WHERE (p_user_id IS NULL OR ua.user_id = p_user_id)
  ORDER BY ua.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;