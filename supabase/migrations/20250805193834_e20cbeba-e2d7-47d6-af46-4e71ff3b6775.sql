-- Create a function to update vendor statistics
CREATE OR REPLACE FUNCTION update_vendor_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update vendor rating and review count when a review is approved
    IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
        UPDATE vendors 
        SET 
            rating = (
                SELECT COALESCE(AVG(rating::numeric), 0) 
                FROM reviews 
                WHERE vendor_id = NEW.vendor_id AND status = 'approved'
            ),
            review_count = (
                SELECT COUNT(*) 
                FROM reviews 
                WHERE vendor_id = NEW.vendor_id AND status = 'approved'
            ),
            updated_at = now()
        WHERE id = NEW.vendor_id;
        
    ELSIF TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved' THEN
        -- Review was just approved
        UPDATE vendors 
        SET 
            rating = (
                SELECT COALESCE(AVG(rating::numeric), 0) 
                FROM reviews 
                WHERE vendor_id = NEW.vendor_id AND status = 'approved'
            ),
            review_count = (
                SELECT COUNT(*) 
                FROM reviews 
                WHERE vendor_id = NEW.vendor_id AND status = 'approved'
            ),
            updated_at = now()
        WHERE id = NEW.vendor_id;
        
    ELSIF TG_OP = 'UPDATE' AND OLD.status = 'approved' AND NEW.status != 'approved' THEN
        -- Review was unapproved/rejected
        UPDATE vendors 
        SET 
            rating = (
                SELECT COALESCE(AVG(rating::numeric), 0) 
                FROM reviews 
                WHERE vendor_id = NEW.vendor_id AND status = 'approved'
            ),
            review_count = (
                SELECT COUNT(*) 
                FROM reviews 
                WHERE vendor_id = NEW.vendor_id AND status = 'approved'
            ),
            updated_at = now()
        WHERE id = NEW.vendor_id;
        
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
        -- Approved review was deleted
        UPDATE vendors 
        SET 
            rating = (
                SELECT COALESCE(AVG(rating::numeric), 0) 
                FROM reviews 
                WHERE vendor_id = OLD.vendor_id AND status = 'approved'
            ),
            review_count = (
                SELECT COUNT(*) 
                FROM reviews 
                WHERE vendor_id = OLD.vendor_id AND status = 'approved'
            ),
            updated_at = now()
        WHERE id = OLD.vendor_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER update_vendor_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_vendor_stats();

-- Fix the current vendor statistics by recalculating them
UPDATE vendors 
SET 
    rating = COALESCE((
        SELECT AVG(rating::numeric) 
        FROM reviews 
        WHERE vendor_id = vendors.id AND status = 'approved'
    ), 0),
    review_count = COALESCE((
        SELECT COUNT(*) 
        FROM reviews 
        WHERE vendor_id = vendors.id AND status = 'approved'
    ), 0),
    updated_at = now()
WHERE id IN (
    SELECT DISTINCT vendor_id 
    FROM reviews 
    WHERE status = 'approved'
);