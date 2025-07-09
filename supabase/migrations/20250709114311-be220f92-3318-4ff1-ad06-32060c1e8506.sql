
-- Add a function to check if user can create polls (admins and super_admins)
CREATE OR REPLACE FUNCTION public.can_create_polls()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role);
$$;

-- Update polls table policies to allow admins to create polls
DROP POLICY IF EXISTS "Admins can manage polls" ON public.polls;

CREATE POLICY "Admins can manage polls" 
ON public.polls 
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Allow authenticated users who can create polls to insert
CREATE POLICY "Admins can create polls" 
ON public.polls 
FOR INSERT 
WITH CHECK (can_create_polls());
