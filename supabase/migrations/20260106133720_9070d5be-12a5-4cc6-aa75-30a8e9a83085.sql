-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (bypasses RLS, prevents recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin function to modify credits (SECURITY DEFINER, only callable by admins)
CREATE OR REPLACE FUNCTION public.admin_set_credits(p_target_user_id UUID, p_new_balance INTEGER)
RETURNS TABLE(success BOOLEAN, new_balance INTEGER, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN QUERY SELECT FALSE, 0, 'Unauthorized: Admin access required'::TEXT;
    RETURN;
  END IF;

  -- Check if target user has credits record
  IF NOT EXISTS (SELECT 1 FROM user_credits WHERE user_id = p_target_user_id) THEN
    RETURN QUERY SELECT FALSE, 0, 'User credits record not found'::TEXT;
    RETURN;
  END IF;

  -- Update credits
  UPDATE user_credits
  SET balance = p_new_balance,
      updated_at = now()
  WHERE user_id = p_target_user_id;

  RETURN QUERY SELECT TRUE, p_new_balance, 'Credits updated successfully'::TEXT;
END;
$$;