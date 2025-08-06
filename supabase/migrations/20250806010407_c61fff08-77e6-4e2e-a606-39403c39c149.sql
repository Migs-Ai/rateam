-- Add phone field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN phone text;

-- Drop existing function and recreate with phone field
DROP FUNCTION IF EXISTS public.get_vendor_reviews_with_profiles(uuid);

CREATE OR REPLACE FUNCTION public.get_vendor_reviews_with_profiles(p_vendor_id uuid)
RETURNS TABLE(
    id uuid,
    user_id uuid,
    vendor_id uuid,
    rating integer,
    comment text,
    status text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    vendor_reply text,
    vendor_reply_at timestamp with time zone,
    customer_contact_visible boolean,
    profile_full_name text,
    profile_email text,
    profile_whatsapp text,
    profile_phone text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
    SELECT 
        r.id,
        r.user_id,
        r.vendor_id,
        r.rating,
        r.comment,
        r.status,
        r.created_at,
        r.updated_at,
        r.vendor_reply,
        r.vendor_reply_at,
        r.customer_contact_visible,
        p.full_name as profile_full_name,
        p.email as profile_email,
        p.whatsapp as profile_whatsapp,
        p.phone as profile_phone
    FROM reviews r
    LEFT JOIN profiles p ON r.user_id = p.id
    WHERE r.vendor_id = p_vendor_id 
      AND r.status = 'approved'
    ORDER BY r.created_at DESC;
$function$