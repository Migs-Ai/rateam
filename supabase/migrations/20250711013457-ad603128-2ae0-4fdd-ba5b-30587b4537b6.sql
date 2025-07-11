
-- First, let's see what vendor records exist for Bello Samuel and clean them up
-- Delete duplicate/older vendor records for Bello Samuel, keeping only the most recent one
DELETE FROM public.vendors 
WHERE user_id = 'b50f9ccc-222c-4c86-b498-8e0ec5921afc' 
AND id NOT IN (
  SELECT id 
  FROM public.vendors 
  WHERE user_id = 'b50f9ccc-222c-4c86-b498-8e0ec5921afc' 
  ORDER BY created_at DESC 
  LIMIT 1
);

-- Make sure the remaining vendor record is approved
UPDATE public.vendors 
SET status = 'approved' 
WHERE user_id = 'b50f9ccc-222c-4c86-b498-8e0ec5921afc';
