-- Drop the existing check constraint and recreate it with 'requested' status
ALTER TABLE public.polls DROP CONSTRAINT IF EXISTS polls_status_check;

-- Add the updated check constraint that includes 'requested' status
ALTER TABLE public.polls ADD CONSTRAINT polls_status_check 
CHECK (status IN ('active', 'inactive', 'requested'));