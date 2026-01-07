-- Add deleted_at column to profiles for soft delete
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create API keys table
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL, -- First 8 chars for display (sk_live_xxxx...)
  name TEXT DEFAULT 'Default',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on api_keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Users can view their own API keys
CREATE POLICY "Users can view their own API keys"
ON public.api_keys
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own API keys
CREATE POLICY "Users can insert their own API keys"
ON public.api_keys
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own API keys (for revocation)
CREATE POLICY "Users can update their own API keys"
ON public.api_keys
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own API keys
CREATE POLICY "Users can delete their own API keys"
ON public.api_keys
FOR DELETE
USING (auth.uid() = user_id);

-- Function to generate API key (returns full key once, stores only hash)
-- Note: The actual key generation will be done client-side for security
-- This function validates and stores the key hash
CREATE OR REPLACE FUNCTION public.create_api_key(
  p_user_id UUID,
  p_key_hash TEXT,
  p_key_prefix TEXT,
  p_name TEXT DEFAULT 'Default'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key_id UUID;
BEGIN
  -- Verify the caller is the user
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  INSERT INTO api_keys (user_id, key_hash, key_prefix, name)
  VALUES (p_user_id, p_key_hash, p_key_prefix, p_name)
  RETURNING id INTO v_key_id;

  RETURN v_key_id;
END;
$$;

-- Function to revoke an API key
CREATE OR REPLACE FUNCTION public.revoke_api_key(p_key_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE api_keys
  SET revoked_at = now()
  WHERE id = p_key_id AND user_id = auth.uid() AND revoked_at IS NULL;
  
  RETURN FOUND;
END;
$$;
