import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExportRequest {
  results: Array<{
    company_name: string;
    verified: boolean;
    phone?: string;
    email?: string;
    website?: string;
    rating?: number;
    rating_count?: number;
  }>;
  format: 'csv' | 'json';
}

const EXPORT_COST = 5;

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
    console.log('Authenticated user for export:', userId);

    // Parse request body
    const body: ExportRequest = await req.json();
    const { results, format } = body;

    // Validate input
    if (!results || !Array.isArray(results)) {
      return new Response(
        JSON.stringify({ error: 'Results array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (results.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No results to export' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (format !== 'csv' && format !== 'json') {
      return new Response(
        JSON.stringify({ error: 'Invalid format. Use csv or json' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate results array size (prevent abuse)
    if (results.length > 10000) {
      return new Response(
        JSON.stringify({ error: 'Too many results. Maximum 10000 allowed.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role to deduct credits
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Deduct credits using the database function
    const { data: creditResult, error: creditError } = await supabaseAdmin.rpc(
      'deduct_credits',
      { p_user_id: userId, p_amount: EXPORT_COST }
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
      console.log('Insufficient credits for export:', deductionResult?.message);
      return new Response(
        JSON.stringify({ 
          error: deductionResult?.message || 'Insufficient credits',
          currentBalance: deductionResult?.new_balance 
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Export credits deducted. New balance:', deductionResult.new_balance);

    // Generate export content
    let content: string;
    let mimeType: string;
    let filename: string;

    if (format === 'csv') {
      const headers = ['Company Name', 'Verified', 'Phone', 'Email', 'Website', 'Rating', 'Rating Count'];
      const rows = results.map((r) => [
        escapeCsvField(r.company_name || ''),
        r.verified ? 'Yes' : 'No',
        escapeCsvField(r.phone || ''),
        escapeCsvField(r.email || ''),
        escapeCsvField(r.website || ''),
        r.rating?.toString() || '',
        r.rating_count?.toString() || '',
      ]);
      content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      mimeType = 'text/csv';
      filename = 'scrapewave-results.csv';
    } else {
      content = JSON.stringify(results, null, 2);
      mimeType = 'application/json';
      filename = 'scrapewave-results.json';
    }

    // Return the export data and new balance
    return new Response(
      JSON.stringify({
        content,
        mimeType,
        filename,
        creditsUsed: EXPORT_COST,
        newBalance: deductionResult.new_balance,
        resultCount: results.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in export:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to escape CSV fields
function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
