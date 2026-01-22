import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RegisterVendorRequest {
  business_name?: string;
  phone?: string;
  whatsapp?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Create client with user's token to get their ID
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false }
      }
    );

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    
    if (userError || !user) {
      console.error('Failed to get user:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Registering vendor for user:', user.id);

    // Parse and validate request body
    const body: RegisterVendorRequest = await req.json();
    
    // Validate input lengths
    if (body.business_name && body.business_name.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Business name too long (max 100 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (body.phone && body.phone.length > 20) {
      return new Response(
        JSON.stringify({ error: 'Phone number too long (max 20 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already has vendor role
    const { data: existingRole } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .eq('role', 'vendor')
      .maybeSingle();

    if (existingRole) {
      return new Response(
        JSON.stringify({ error: 'User is already a vendor' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique slug
    const baseSlug = body.business_name
      ? body.business_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      : `vendedor-${user.id.slice(0, 8)}`;
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    // Create vendor profile using admin client (bypasses RLS)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('vendor_profiles')
      .insert({
        user_id: user.id,
        business_name: body.business_name?.trim(),
        phone: body.phone?.trim(),
        whatsapp: body.whatsapp?.trim(),
        slug,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Failed to create vendor profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to create vendor profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Assign vendor role using admin client (bypasses RLS)
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: user.id, role: 'vendor' });

    if (roleError) {
      console.error('Failed to assign vendor role:', roleError);
      // Rollback: delete the profile we just created
      await supabaseAdmin
        .from('vendor_profiles')
        .delete()
        .eq('id', profile.id);
      
      return new Response(
        JSON.stringify({ error: 'Failed to assign vendor role' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully registered vendor:', user.id);

    return new Response(
      JSON.stringify({ success: true, profile }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in register-vendor:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
