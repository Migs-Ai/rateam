
-- Add reply functionality to reviews table
ALTER TABLE public.reviews 
ADD COLUMN vendor_reply TEXT,
ADD COLUMN vendor_reply_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN customer_contact_visible BOOLEAN DEFAULT false;

-- Add RLS policy for vendors to reply to their business reviews
CREATE POLICY "Vendors can reply to reviews on their business" 
ON public.reviews 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.vendors 
    WHERE vendors.id = reviews.vendor_id 
    AND vendors.user_id = auth.uid()
  )
);
