-- Extend app_role enum to include company_admin
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'company_admin';

-- Create companies table (multi-tenant organizations)
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  logo_url TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  cuit TEXT,
  primary_color TEXT DEFAULT '#0C8CE9',
  secondary_color TEXT DEFAULT '#2DB87B',
  custom_domain TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create company_members table (links users to companies with roles)
CREATE TABLE public.company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'vendor')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  invited_by UUID REFERENCES auth.users(id),
  UNIQUE(company_id, user_id)
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- Helper function: Check if user is admin of a specific company
CREATE OR REPLACE FUNCTION public.is_company_admin(_user_id UUID, _company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members
    WHERE user_id = _user_id 
      AND company_id = _company_id 
      AND role = 'admin'
      AND is_active = true
  )
$$;

-- Helper function: Get user's company ID
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.company_members
  WHERE user_id = _user_id AND is_active = true
  LIMIT 1
$$;

-- Companies RLS policies
CREATE POLICY "Super admins can do everything on companies"
ON public.companies
FOR ALL
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Company admins can view their company"
ON public.companies
FOR SELECT
USING (
  id IN (
    SELECT company_id FROM public.company_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Company admins can update their company"
ON public.companies
FOR UPDATE
USING (public.is_company_admin(auth.uid(), id));

-- Company members RLS policies
CREATE POLICY "Super admins can manage all members"
ON public.company_members
FOR ALL
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Company admins can view their members"
ON public.company_members
FOR SELECT
USING (public.is_company_admin(auth.uid(), company_id));

CREATE POLICY "Company admins can insert members to their company"
ON public.company_members
FOR INSERT
WITH CHECK (public.is_company_admin(auth.uid(), company_id));

CREATE POLICY "Company admins can update their members"
ON public.company_members
FOR UPDATE
USING (public.is_company_admin(auth.uid(), company_id));

CREATE POLICY "Company admins can delete their members"
ON public.company_members
FOR DELETE
USING (public.is_company_admin(auth.uid(), company_id));

CREATE POLICY "Users can view their own membership"
ON public.company_members
FOR SELECT
USING (user_id = auth.uid());

-- Update saved_quotes to support multi-tenant
ALTER TABLE public.saved_quotes 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- Add RLS policy for company quotes visibility
CREATE POLICY "Company admins can view company quotes"
ON public.saved_quotes
FOR SELECT
USING (
  company_id IS NOT NULL 
  AND public.is_company_admin(auth.uid(), company_id)
);

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_members_updated_at
BEFORE UPDATE ON public.company_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();