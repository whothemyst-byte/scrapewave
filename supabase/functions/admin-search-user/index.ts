import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('Missing authorization header');
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token to verify identity
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user from token
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.log('Invalid user token:', userError);
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role client to check admin status
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if caller is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      console.log('Not an admin:', user.id);
      return new Response(
        JSON.stringify({ success: false, message: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ success: false, message: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin searching for user:', email);

    // Search for user by email using admin API
    const { data: userData, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (searchError) {
      console.error('Error searching users:', searchError);
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to search users' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const targetUser = userData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!targetUser) {
      return new Response(
        JSON.stringify({ success: false, message: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's credits
    const { data: creditsData, error: creditsError } = await supabaseAdmin
      .from('user_credits')
      .select('balance')
      .eq('user_id', targetUser.id)
      .single();

    if (creditsError) {
      console.error('Error fetching credits:', creditsError);
      return new Response(
        JSON.stringify({ success: false, message: 'User credits record not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found user:', targetUser.id, 'with balance:', creditsData.balance);

    return new Response(
      JSON.stringify({
        success: true,
        user_id: targetUser.id,
        email: targetUser.email,
        balance: creditsData.balance,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Admin search error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
