-- Allow users to create poll requests (with 'requested' status)
CREATE POLICY "Users can create poll requests" 
ON public.polls 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by AND status = 'requested'
);