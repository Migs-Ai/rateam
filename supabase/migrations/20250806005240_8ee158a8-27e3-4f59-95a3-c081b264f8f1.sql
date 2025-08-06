-- Update vendor stats to correct values
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
WHERE id = '834b2421-bb74-4d03-8a6d-4a9689087935';

-- Create the trigger to keep stats updated
DROP TRIGGER IF EXISTS update_vendor_stats_trigger ON reviews;
CREATE TRIGGER update_vendor_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_vendor_stats();