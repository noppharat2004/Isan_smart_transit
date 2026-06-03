-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for vehicle types
CREATE TYPE vehicle_type AS ENUM ('songthaew', 'tour_bus', 'minibus');

-- Create enum for schedule status
CREATE TYPE schedule_status AS ENUM ('active', 'delayed', 'canceled');

-- Routes table
CREATE TABLE routes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  vehicle_type vehicle_type NOT NULL,
  identifier TEXT NOT NULL, -- Color for songthaew, company name for bus/minibus
  origin_station TEXT NOT NULL,
  destination_station TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schedule updates table
CREATE TABLE schedule_updates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  departure_time TIMESTAMP WITH TIME ZONE, -- Can be null if frequency-based
  image_url TEXT, -- Proof from Supabase Storage
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  status schedule_status DEFAULT 'active',
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Driver contacts table
CREATE TABLE driver_contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  label TEXT NOT NULL, -- e.g., "Queue Manager"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_routes_vehicle_type ON routes(vehicle_type);
CREATE INDEX idx_schedule_updates_route_id ON schedule_updates(route_id);
CREATE INDEX idx_schedule_updates_created_at ON schedule_updates(created_at DESC);
CREATE INDEX idx_driver_contacts_route_id ON driver_contacts(route_id);

-- Enable Row Level Security (RLS)
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for routes (public read, authenticated write)
CREATE POLICY "Routes are viewable by everyone" ON routes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert routes" ON routes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update routes" ON routes FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for schedule_updates (public read, authenticated write)
CREATE POLICY "Schedule updates are viewable by everyone" ON schedule_updates FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert schedule updates" ON schedule_updates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update schedule updates" ON schedule_updates FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for driver_contacts (public read, authenticated write)
CREATE POLICY "Driver contacts are viewable by everyone" ON driver_contacts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert driver contacts" ON driver_contacts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update driver contacts" ON driver_contacts FOR UPDATE USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_updates_updated_at BEFORE UPDATE ON schedule_updates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_contacts_updated_at BEFORE UPDATE ON driver_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
