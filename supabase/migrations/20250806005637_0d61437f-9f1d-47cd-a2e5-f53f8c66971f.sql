-- Create function to get vendor reviews with profile data
CREATE OR REPLACE FUNCTION get_vendor_reviews_with_profiles(p_vendor_id UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    vendor_id UUID,
    rating INTEGER,
    comment TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    vendor_reply TEXT,
    vendor_reply_at TIMESTAMPTZ,
    customer_contact_visible BOOLEAN,
    profile_full_name TEXT,
    profile_email TEXT,
    profile_whatsapp TEXT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
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
        p.whatsapp as profile_whatsapp
    FROM reviews r
    LEFT JOIN profiles p ON r.user_id = p.id
    WHERE r.vendor_id = p_vendor_id 
      AND r.status = 'approved'
    ORDER BY r.created_at DESC;
$$;