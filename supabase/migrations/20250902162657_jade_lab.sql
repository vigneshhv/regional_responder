/*
  # Create user profiles and emergency data schema

  1. New Tables
    - `user_profiles` - Extended user information beyond auth
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `phone` (text)
      - `medical_info` (text, optional)
      - `created_at`, `updated_at` (timestamps)
    - `emergency_contacts` - User emergency contacts
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `name`, `phone`, `relationship` (text)
      - `is_primary` (boolean)
      - `created_at` (timestamp)
    - `sos_events` - Emergency events
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `type` (enum: Health, Fire, Theft/Threat, Other)
      - `latitude`, `longitude` (coordinates)
      - `address` (text, optional)
      - `status` (enum: active, resolved, cancelled)
      - `description` (text, optional)
      - `created_at`, `resolved_at` (timestamps)
    - `volunteers` - Volunteer registrations
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `is_available` (boolean)
      - `max_range_meters` (integer)
      - `skills` (text array, optional)
      - `created_at` (timestamp)
    - `volunteer_responses` - Responses to SOS events
      - `id` (uuid, primary key)
      - `sos_event_id` (uuid, references sos_events)
      - `volunteer_id` (uuid, references volunteers)
      - `response_type` (enum: accepted, declined)
      - `estimated_arrival`, `message` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for volunteers to see nearby active SOS events
    - Add policies for SOS event responses
*/

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  medical_info text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Emergency contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  relationship text NOT NULL DEFAULT 'Friend',
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- SOS events table
CREATE TABLE IF NOT EXISTS sos_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('Health', 'Fire', 'Theft/Threat', 'Other')),
  latitude double precision NOT NULL DEFAULT 0,
  longitude double precision NOT NULL DEFAULT 0,
  address text DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz NULL
);

-- Volunteers table
CREATE TABLE IF NOT EXISTS volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  is_available boolean DEFAULT true,
  max_range_meters integer DEFAULT 1000 CHECK (max_range_meters BETWEEN 10 AND 3000),
  skills text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Volunteer responses table
CREATE TABLE IF NOT EXISTS volunteer_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sos_event_id uuid NOT NULL REFERENCES sos_events(id) ON DELETE CASCADE,
  volunteer_id uuid NOT NULL REFERENCES volunteers(user_id) ON DELETE CASCADE,
  response_type text NOT NULL CHECK (response_type IN ('accepted', 'declined')),
  estimated_arrival text DEFAULT '',
  message text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(sos_event_id, volunteer_id)
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for emergency_contacts
CREATE POLICY "Users can manage own emergency contacts"
  ON emergency_contacts
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for sos_events
CREATE POLICY "Users can manage own SOS events"
  ON sos_events
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Volunteers can read active SOS events"
  ON sos_events
  FOR SELECT
  TO authenticated
  USING (status = 'active');

-- RLS Policies for volunteers
CREATE POLICY "Users can manage own volunteer status"
  ON volunteers
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can read volunteer info"
  ON volunteers
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for volunteer_responses
CREATE POLICY "Volunteers can manage own responses"
  ON volunteer_responses
  FOR ALL
  TO authenticated
  USING (volunteer_id = auth.uid());

CREATE POLICY "SOS event creators can read responses"
  ON volunteer_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sos_events 
      WHERE sos_events.id = volunteer_responses.sos_event_id 
      AND sos_events.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user_profiles updated_at
CREATE OR REPLACE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sos_events_location ON sos_events (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_sos_events_status ON sos_events (status);
CREATE INDEX IF NOT EXISTS idx_sos_events_created_at ON sos_events (created_at);
CREATE INDEX IF NOT EXISTS idx_volunteers_available ON volunteers (is_available);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts (user_id);