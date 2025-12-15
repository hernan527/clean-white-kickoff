export interface Company {
  id: string;
  name: string;
  slug: string | null;
  logo_url: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  cuit: string | null;
  primary_color: string;
  secondary_color: string;
  custom_domain: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: 'admin' | 'vendor';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  invited_by: string | null;
  // Joined fields
  user_email?: string;
  user_first_name?: string;
  user_last_name?: string;
  user_avatar_url?: string;
}

export interface CompanyWithStats extends Company {
  member_count?: number;
  quote_count?: number;
}

export interface CreateCompanyInput {
  name: string;
  slug?: string;
  logo_url?: string;
  email?: string;
  phone?: string;
  address?: string;
  cuit?: string;
  primary_color?: string;
  secondary_color?: string;
  custom_domain?: string;
}

export interface CreateCompanyMemberInput {
  company_id: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'vendor';
}
