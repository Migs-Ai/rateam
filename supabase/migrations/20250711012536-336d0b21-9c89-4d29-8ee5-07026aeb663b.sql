
-- First, let's update Bello Samuel's role from 'user' to 'vendor'
UPDATE public.user_roles 
SET role = 'vendor' 
WHERE user_id = 'b50f9ccc-222c-4c86-b498-8e0ec5921afc';

-- Create a vendor record for Bello Samuel
INSERT INTO public.vendors (
  user_id,
  business_name,
  category,
  location,
  description,
  phone,
  email,
  status,
  preferred_contact
) VALUES (
  'b50f9ccc-222c-4c86-b498-8e0ec5921afc',
  'Bello Samuel Business',
  'Professional Services',
  'Lagos, Nigeria',
  'Professional business services',
  '+234-000-000-0000',
  'lekan@limpiar.online',
  'approved',
  'email'
);
