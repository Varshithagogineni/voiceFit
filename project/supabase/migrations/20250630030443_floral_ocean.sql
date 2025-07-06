/*
  # Create VoiceFit Workout Tracking Schema

  1. New Tables
    - `workout_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `date` (date, workout date)
      - `muscle_group` (text, target muscle groups)
      - `mood_pre` (text, pre-workout mood)
      - `notes` (text, session notes)
      - `timestamp` (timestamptz, created at)
    
    - `exercises`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references workout_sessions)
      - `name` (text, exercise name)
    
    - `exercise_sets`
      - `id` (uuid, primary key)
      - `exercise_id` (uuid, references exercises)
      - `set_number` (integer, set number within exercise)
      - `weight` (numeric, weight used)
      - `reps` (integer, repetitions performed)
      - `timestamp` (timestamptz, when set was logged)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Users can only access their own workout data

  3. Indexes
    - Add indexes for common queries (user_id, date, session_id)
*/

-- Create workout_sessions table
CREATE TABLE IF NOT EXISTS workout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  muscle_group text,
  mood_pre text,
  notes text,
  timestamp timestamptz DEFAULT now()
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES workout_sessions(id) ON DELETE CASCADE,
  name text NOT NULL
);

-- Create exercise_sets table
CREATE TABLE IF NOT EXISTS exercise_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE,
  set_number integer NOT NULL DEFAULT 1,
  weight numeric,
  reps integer NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;

-- Create policies for workout_sessions
CREATE POLICY "Users can view own workout sessions"
  ON workout_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout sessions"
  ON workout_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout sessions"
  ON workout_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout sessions"
  ON workout_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for exercises
CREATE POLICY "Users can view own exercises"
  ON exercises
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE workout_sessions.id = exercises.session_id 
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own exercises"
  ON exercises
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE workout_sessions.id = exercises.session_id 
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own exercises"
  ON exercises
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE workout_sessions.id = exercises.session_id 
      AND workout_sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE workout_sessions.id = exercises.session_id 
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own exercises"
  ON exercises
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE workout_sessions.id = exercises.session_id 
      AND workout_sessions.user_id = auth.uid()
    )
  );

-- Create policies for exercise_sets
CREATE POLICY "Users can view own exercise sets"
  ON exercise_sets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercises 
      JOIN workout_sessions ON workout_sessions.id = exercises.session_id
      WHERE exercises.id = exercise_sets.exercise_id 
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own exercise sets"
  ON exercise_sets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises 
      JOIN workout_sessions ON workout_sessions.id = exercises.session_id
      WHERE exercises.id = exercise_sets.exercise_id 
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own exercise sets"
  ON exercise_sets
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercises 
      JOIN workout_sessions ON workout_sessions.id = exercises.session_id
      WHERE exercises.id = exercise_sets.exercise_id 
      AND workout_sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises 
      JOIN workout_sessions ON workout_sessions.id = exercises.session_id
      WHERE exercises.id = exercise_sets.exercise_id 
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own exercise sets"
  ON exercise_sets
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exercises 
      JOIN workout_sessions ON workout_sessions.id = exercises.session_id
      WHERE exercises.id = exercise_sets.exercise_id 
      AND workout_sessions.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_date ON workout_sessions(date);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date ON workout_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_exercises_session_id ON exercises(session_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_exercise_id ON exercise_sets(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_timestamp ON exercise_sets(timestamp);