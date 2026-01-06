import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScrapeRequest {
  category: string;
  location: string;
  maxResults: number;
  verifiedOnly: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Validate the user's JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('JWT validation failed:', claimsError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log('Authenticated user:', userId);

    // Parse request body
    const body: ScrapeRequest = await req.json();
    const { category, location, maxResults, verifiedOnly } = body;

    // Validate input
    if (!category || !location) {
      return new Response(
        JSON.stringify({ error: 'Category and location are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input length and format
    if (category.length > 100 || location.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Input too long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validMaxResults = Math.min(Math.max(10, maxResults || 20), 500);
    
    // Calculate credit cost
    const estimatedCost = Math.ceil(validMaxResults * 0.5) + (verifiedOnly ? 10 : 0);
    console.log('Estimated cost:', estimatedCost);

    // Use service role to check and deduct credits
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check and deduct credits using the database function
    const { data: creditResult, error: creditError } = await supabaseAdmin.rpc(
      'deduct_credits',
      { p_user_id: userId, p_amount: estimatedCost }
    );

    if (creditError) {
      console.error('Credit deduction error:', creditError);
      return new Response(
        JSON.stringify({ error: 'Failed to process credits' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const deductionResult = creditResult?.[0];
    if (!deductionResult?.success) {
      console.log('Insufficient credits:', deductionResult?.message);
      return new Response(
        JSON.stringify({ 
          error: deductionResult?.message || 'Insufficient credits',
          currentBalance: deductionResult?.new_balance 
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Credits deducted. New balance:', deductionResult.new_balance);

    // Get webhook secret for authentication - MANDATORY
    const webhookSecret = Deno.env.get('N8N_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('N8N_WEBHOOK_SECRET is not configured');
      // Refund credits since we cannot proceed
      await supabaseAdmin.rpc('refund_credits', { p_user_id: userId, p_amount: estimatedCost });
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get webhook URLs from environment variables
    const webhookUrlVerified = Deno.env.get('N8N_WEBHOOK_URL_VERIFIED');
    const webhookUrlStandard = Deno.env.get('N8N_WEBHOOK_URL');
    
    if (!webhookUrlStandard || !webhookUrlVerified) {
      console.error('Webhook URLs not configured');
      await supabaseAdmin.rpc('refund_credits', { p_user_id: userId, p_amount: estimatedCost });
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const webhookUrl = verifiedOnly ? webhookUrlVerified : webhookUrlStandard;

    console.log('Calling webhook:', webhookUrl);

    // Call the n8n webhook with mandatory authentication
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${webhookSecret}`,
      },
      body: JSON.stringify({
        category: category.trim(),
        location: location.trim(),
        maxResults: validMaxResults,
        userId: userId, // Include user ID for backend tracking
      }),
    });

    if (!webhookResponse.ok) {
      console.error('Webhook failed with status:', webhookResponse.status);
      // Refund credits using proper RPC function with locking
      await supabaseAdmin.rpc('refund_credits', { p_user_id: userId, p_amount: estimatedCost });
      
      return new Response(
        JSON.stringify({ error: 'Scraping service unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await webhookResponse.json();
    console.log('Webhook returned', Array.isArray(data) ? data.length : 0, 'results');

    // Return the results along with the new credit balance
    return new Response(
      JSON.stringify({
        results: data,
        creditsUsed: estimatedCost,
        newBalance: deductionResult.new_balance,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});