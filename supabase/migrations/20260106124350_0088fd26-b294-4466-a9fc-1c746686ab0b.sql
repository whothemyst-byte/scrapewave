-- Create a dedicated refund_credits function with proper locking
CREATE OR REPLACE FUNCTION public.refund_credits(p_user_id UUID, p_amount INTEGER)
RETURNS TABLE(success BOOLEAN, new_balance INTEGER, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
BEGIN
  -- Lock the row for update to prevent race conditions
  SELECT balance INTO v_current_balance
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 'User credits record not found'::TEXT;
    RETURN;
  END IF;

  -- Add the refund amount
  UPDATE user_credits
  SET balance = balance + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT TRUE, v_current_balance + p_amount, 'Credits refunded successfully'::TEXT;
END;
$$;

-- Update avatars bucket to be private (remove public access)
UPDATE storage.buckets SET public = false WHERE id = 'avatars';

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;

-- Create policy for authenticated users to view their own avatars
CREATE POLICY "Users can view their own avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);