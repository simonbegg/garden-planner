-- Create schema for garden management application

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create plants table
CREATE TABLE IF NOT EXISTS plants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  variety TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('vegetable', 'fruit', 'herb', 'flower', 'tree')),
  color TEXT NOT NULL,
  spacing NUMERIC(5, 2) NOT NULL,
  planting_time TEXT NOT NULL,
  harvest_time TEXT NOT NULL,
  planting_date DATE,
  care_instructions TEXT[] DEFAULT '{}',
  growth_stage INTEGER CHECK (growth_stage >= 0 AND growth_stage <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create garden_layouts table
CREATE TABLE IF NOT EXISTS garden_layouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rows INTEGER NOT NULL CHECK (rows > 0),
  columns INTEGER NOT NULL CHECK (columns > 0),
  grid JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create activities table for logging gardening activities
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_date DATE NOT NULL,
  notes TEXT,
  plant_id UUID REFERENCES plants(id) ON DELETE SET NULL,
  garden_layout_id UUID REFERENCES garden_layouts(id) ON DELETE SET NULL,
  weather_conditions TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_plants_updated_at
BEFORE UPDATE ON plants
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_garden_layouts_updated_at
BEFORE UPDATE ON garden_layouts
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create indexes for performance
CREATE INDEX idx_plants_user_id ON plants(user_id);
CREATE INDEX idx_plants_type ON plants(type);
CREATE INDEX idx_garden_layouts_user_id ON garden_layouts(user_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_activity_date ON activities(activity_date);
CREATE INDEX idx_activities_plant_id ON activities(plant_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: users can only read/update their own profile
CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (auth.uid() = id);

-- Plants: users can CRUD their own plants
CREATE POLICY plants_select_own ON plants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY plants_insert_own ON plants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY plants_update_own ON plants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY plants_delete_own ON plants FOR DELETE USING (auth.uid() = user_id);

-- Garden Layouts: users can CRUD their own layouts
CREATE POLICY garden_layouts_select_own ON garden_layouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY garden_layouts_insert_own ON garden_layouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY garden_layouts_update_own ON garden_layouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY garden_layouts_delete_own ON garden_layouts FOR DELETE USING (auth.uid() = user_id);

-- Activities: users can CRUD their own activities
CREATE POLICY activities_select_own ON activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY activities_insert_own ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY activities_update_own ON activities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY activities_delete_own ON activities FOR DELETE USING (auth.uid() = user_id);
