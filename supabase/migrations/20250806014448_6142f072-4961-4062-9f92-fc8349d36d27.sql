-- Fix vendor review count discrepancy by recalculating stats
UPDATE vendors 
SET 
    rating = (
        SELECT COALESCE(AVG(rating::numeric), 0) 
        FROM reviews 
        WHERE vendor_id = vendors.id AND status = 'approved'
    ),
    review_count = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE vendor_id = vendors.id AND status = 'approved'
    ),
    updated_at = now()
WHERE id IN (
    SELECT vendor_id 
    FROM reviews 
    WHERE status = 'approved' 
    GROUP BY vendor_id
);