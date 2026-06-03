-- Updated schema to match the current app structure
-- This adds new fields needed for the upload feature

-- Add new columns to schedule_updates table
ALTER TABLE schedule_updates 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS vehicle_type vehicle_type,
ADD COLUMN IF NOT EXISTS origin TEXT,
ADD COLUMN IF NOT EXISTS destination TEXT,
ADD COLUMN IF NOT EXISTS route_name TEXT,
ADD COLUMN IF NOT EXISTS status_note TEXT,
ADD COLUMN IF NOT EXISTS phone_numbers JSONB DEFAULT '[]'::jsonb;

-- Update RLS policies to allow anonymous inserts (for public contributions)
DROP POLICY IF EXISTS "Authenticated users can insert schedule updates" ON schedule_updates;
CREATE POLICY "Anyone can insert schedule updates" ON schedule_updates 
  FOR INSERT WITH CHECK (true);

-- Create index on company_name and origin/destination for better search
CREATE INDEX IF NOT EXISTS idx_schedule_updates_company ON schedule_updates(company_name);
CREATE INDEX IF NOT EXISTS idx_schedule_updates_origin_dest ON schedule_updates(origin, destination);

-- Update routes table to be optional (not required for direct schedule uploads)
ALTER TABLE schedule_updates ALTER COLUMN route_id DROP NOT NULL;
