-- Add restrictive policies to prevent users from manipulating their own credits
-- Only the deduct_credits function (SECURITY DEFINER) should modify credits

-- Policy to prevent any INSERT from users (only trigger can create)
CREATE POLICY "Users cannot insert credits directly"
ON public.user_credits
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Policy to prevent any UPDATE from users (only function can update)
CREATE POLICY "Users cannot update credits directly"
ON public.user_credits
FOR UPDATE
TO authenticated
USING (false);

-- Policy to prevent any DELETE from users
CREATE POLICY "Users cannot delete credits"
ON public.user_credits
FOR DELETE
TO authenticated
USING (false);