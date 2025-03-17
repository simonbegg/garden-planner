-- Fix RLS policies for profiles table to allow users to create their own profile
-- This is needed for user registration and profile creation

-- Drop existing RLS policies for profiles table
DROP POLICY IF EXISTS profiles_select_own ON profiles;
DROP POLICY IF EXISTS profiles_update_own ON profiles;

-- Create new RLS policies for profiles table
-- Allow users to select their own profile
CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile (this was missing)
CREATE POLICY profiles_insert_own ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow service role to manage all profiles (for admin functions)
CREATE POLICY profiles_service_role ON profiles USING (auth.jwt()->>'role' = 'service_role');
