import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get the authorization header to verify the calling user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the calling user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: callingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !callingUser) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if calling user is super admin or company admin
    const { data: isSuperAdmin } = await supabaseAdmin.rpc('is_super_admin', { _user_id: callingUser.id });
    
    const body = await req.json();
    const { email, password, first_name, last_name, company_id, role } = body;

    // Validate required fields
    if (!email || !password || !company_id || !role) {
      return new Response(
        JSON.stringify({ error: 'Email, password, company_id, and role are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if calling user has permission (super admin or company admin)
    if (!isSuperAdmin) {
      const { data: isCompanyAdmin } = await supabaseAdmin.rpc('is_company_admin', { 
        _user_id: callingUser.id, 
        _company_id: company_id 
      });

      if (!isCompanyAdmin) {
        return new Response(
          JSON.stringify({ error: 'Permission denied. Only super admins or company admins can create members.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create the user account
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        first_name,
        last_name,
      },
    });

    if (createUserError) {
      console.error('Error creating user:', createUserError);
      return new Response(
        JSON.stringify({ error: createUserError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create company membership
    const { data: member, error: memberError } = await supabaseAdmin
      .from('company_members')
      .insert({
        company_id,
        user_id: newUser.user.id,
        role,
        invited_by: callingUser.id,
      })
      .select()
      .single();

    if (memberError) {
      console.error('Error creating membership:', memberError);
      // Rollback: delete the created user
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ error: memberError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Also assign vendor role in user_roles table
    await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: role === 'admin' ? 'company_admin' : 'vendor',
      });

    console.log(`Created company member: ${email} for company ${company_id} with role ${role}`);

    return new Response(
      JSON.stringify({ 
        member: {
          ...member,
          user_email: email,
          user_first_name: first_name,
          user_last_name: last_name,
        },
        message: 'Company member created successfully' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-company-member:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
