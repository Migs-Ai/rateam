-- Remove the unique constraint that prevents multiple reviews per business by the same user
ALTER TABLE public.reviews 
DROP CONSTRAINT IF EXISTS reviews_user_id_vendor_id_key;