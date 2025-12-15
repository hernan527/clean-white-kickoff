import { supabase } from '@/integrations/supabase/client';
import type { Company, CompanyMember, CompanyWithStats, CreateCompanyInput, CreateCompanyMemberInput } from '../types/company';

/**
 * Get all companies (super admin only)
 */
export const getCompanies = async (): Promise<Company[]> => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching companies:', error);
    return [];
  }

  return data as Company[];
};

/**
 * Get company by ID
 */
export const getCompanyById = async (companyId: string): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching company:', error);
    return null;
  }

  return data as Company | null;
};

/**
 * Create a new company
 */
export const createCompany = async (input: CreateCompanyInput): Promise<{ company: Company | null; error: string | null }> => {
  const { data: userData } = await supabase.auth.getUser();
  
  const slug = input.slug || input.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const { data, error } = await supabase
    .from('companies')
    .insert({
      ...input,
      slug,
      created_by: userData.user?.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating company:', error);
    return { company: null, error: error.message };
  }

  return { company: data as Company, error: null };
};

/**
 * Update a company
 */
export const updateCompany = async (companyId: string, input: Partial<CreateCompanyInput>): Promise<{ company: Company | null; error: string | null }> => {
  const { data, error } = await supabase
    .from('companies')
    .update(input)
    .eq('id', companyId)
    .select()
    .single();

  if (error) {
    console.error('Error updating company:', error);
    return { company: null, error: error.message };
  }

  return { company: data as Company, error: null };
};

/**
 * Delete a company
 */
export const deleteCompany = async (companyId: string): Promise<{ success: boolean; error: string | null }> => {
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', companyId);

  if (error) {
    console.error('Error deleting company:', error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
};

/**
 * Get company members
 */
export const getCompanyMembers = async (companyId: string): Promise<CompanyMember[]> => {
  const { data, error } = await supabase
    .from('company_members')
    .select(`
      *,
      profiles:user_id (
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching company members:', error);
    return [];
  }

  // Get user emails from auth (requires function call since we can't query auth.users directly)
  const members = data.map((member: any) => ({
    ...member,
    user_first_name: member.profiles?.first_name,
    user_last_name: member.profiles?.last_name,
    user_avatar_url: member.profiles?.avatar_url,
  }));

  return members as CompanyMember[];
};

/**
 * Create a company member (vendor) with new user account
 */
export const createCompanyMember = async (input: CreateCompanyMemberInput): Promise<{ member: CompanyMember | null; error: string | null }> => {
  // First, create the user account via edge function
  const { data: functionData, error: functionError } = await supabase.functions.invoke('create-company-member', {
    body: {
      email: input.email,
      password: input.password,
      first_name: input.first_name,
      last_name: input.last_name,
      company_id: input.company_id,
      role: input.role
    }
  });

  if (functionError) {
    console.error('Error creating company member:', functionError);
    return { member: null, error: functionError.message };
  }

  if (functionData?.error) {
    return { member: null, error: functionData.error };
  }

  return { member: functionData.member as CompanyMember, error: null };
};

/**
 * Update a company member
 */
export const updateCompanyMember = async (
  memberId: string,
  input: { role?: 'admin' | 'vendor'; is_active?: boolean }
): Promise<{ success: boolean; error: string | null }> => {
  const { error } = await supabase
    .from('company_members')
    .update(input)
    .eq('id', memberId);

  if (error) {
    console.error('Error updating company member:', error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
};

/**
 * Delete a company member
 */
export const deleteCompanyMember = async (memberId: string): Promise<{ success: boolean; error: string | null }> => {
  const { error } = await supabase
    .from('company_members')
    .delete()
    .eq('id', memberId);

  if (error) {
    console.error('Error deleting company member:', error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
};

/**
 * Get companies with stats (member count, quote count)
 */
export const getCompaniesWithStats = async (): Promise<CompanyWithStats[]> => {
  const companies = await getCompanies();
  
  // Get member counts
  const { data: memberCounts } = await supabase
    .from('company_members')
    .select('company_id')
    .eq('is_active', true);

  // Get quote counts
  const { data: quoteCounts } = await supabase
    .from('saved_quotes')
    .select('company_id')
    .not('company_id', 'is', null);

  const memberCountMap = new Map<string, number>();
  const quoteCountMap = new Map<string, number>();

  memberCounts?.forEach((m: any) => {
    memberCountMap.set(m.company_id, (memberCountMap.get(m.company_id) || 0) + 1);
  });

  quoteCounts?.forEach((q: any) => {
    quoteCountMap.set(q.company_id, (quoteCountMap.get(q.company_id) || 0) + 1);
  });

  return companies.map(company => ({
    ...company,
    member_count: memberCountMap.get(company.id) || 0,
    quote_count: quoteCountMap.get(company.id) || 0
  }));
};

const CompanyService = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyMembers,
  createCompanyMember,
  updateCompanyMember,
  deleteCompanyMember,
  getCompaniesWithStats
};

export default CompanyService;
