-- User profiles
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  preferred_name text,
  default_claude_model text DEFAULT 'sonnet',
  enable_audio_mode boolean DEFAULT true,
  enable_deepgram boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Interview types
CREATE TABLE interview_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  total_duration_minutes int,
  num_stations int NOT NULL,
  station_time_limit_seconds int,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

INSERT INTO interview_types (name, slug, description, total_duration_minutes, num_stations, station_time_limit_seconds)
VALUES (
  '7-Min PA MMI (5 Stations)',
  'pa-mmi-7min',
  'Standard PA school MMI with 5 stations, 7 minutes per station',
  35,
  5,
  420
);

ALTER TABLE interview_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Interview types are public" ON interview_types
  FOR SELECT USING (is_active = true);

-- Questions
CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_type_id uuid NOT NULL REFERENCES interview_types(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  station_number int,
  category text,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX idx_questions_interview_type ON questions(interview_type_id);
CREATE INDEX idx_questions_category ON questions(category);

WITH interview_type AS (
  SELECT id FROM interview_types WHERE slug = 'pa-mmi-7min'
)
INSERT INTO questions (interview_type_id, prompt, station_number, category)
SELECT
  (SELECT id FROM interview_type),
  prompt,
  station_number,
  category
FROM (VALUES
  ('A fellow student asks to copy your homework. What do you do?', 1, 'ethics'),
  ('Describe a time you had to work with someone difficult. How did you handle it?', 2, 'teamwork'),
  ('Should healthcare be free for everyone? Discuss both sides.', 3, 'healthcare-policy'),
  ('You notice a colleague making a mistake with a patient. What do you do?', 4, 'ethics'),
  ('Why do you want to become a Physician Assistant?', 5, 'motivation')
) AS data(prompt, station_number, category);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View active questions" ON questions
  FOR SELECT USING (is_active = true);

-- Interviews
CREATE TABLE interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interview_type_id uuid NOT NULL REFERENCES interview_types(id) ON DELETE RESTRICT,
  school_name text,
  status text NOT NULL DEFAULT 'not_started',
  current_station_index int DEFAULT 0,
  started_at timestamp,
  completed_at timestamp,
  last_activity_at timestamp DEFAULT now(),
  settings jsonb,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX idx_interviews_user_id ON interviews(user_id);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_interviews_created_at ON interviews(created_at DESC);

ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own interviews" ON interviews
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own interviews" ON interviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own interviews" ON interviews
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own interviews" ON interviews
  FOR DELETE USING (auth.uid() = user_id);

-- Responses
CREATE TABLE responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
  station_number int NOT NULL,
  response_text text NOT NULL,
  audio_duration_seconds int,
  transcription_status text,
  transcription_error text,
  transcribed_at timestamp,
  time_spent_seconds int,
  started_at timestamp,
  completed_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(interview_id, station_number)
);

CREATE INDEX idx_responses_interview_id ON responses(interview_id);

ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own responses" ON responses
  FOR SELECT USING (interview_id IN (SELECT id FROM interviews WHERE user_id = auth.uid()));
CREATE POLICY "Users can create own responses" ON responses
  FOR INSERT WITH CHECK (interview_id IN (SELECT id FROM interviews WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own responses" ON responses
  FOR UPDATE USING (interview_id IN (SELECT id FROM interviews WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own responses" ON responses
  FOR DELETE USING (interview_id IN (SELECT id FROM interviews WHERE user_id = auth.uid()));

-- Evaluations
CREATE TABLE evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  feedback_text text NOT NULL,
  claude_model text NOT NULL,
  claude_model_version text,
  input_tokens int,
  output_tokens int,
  estimated_cost_usd numeric(10, 6),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(interview_id)
);

CREATE INDEX idx_evaluations_interview_id ON evaluations(interview_id);

ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own evaluations" ON evaluations
  FOR SELECT USING (interview_id IN (SELECT id FROM interviews WHERE user_id = auth.uid()));
CREATE POLICY "Users can create own evaluations" ON evaluations
  FOR INSERT WITH CHECK (interview_id IN (SELECT id FROM interviews WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own evaluations" ON evaluations
  FOR UPDATE USING (interview_id IN (SELECT id FROM interviews WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own evaluations" ON evaluations
  FOR DELETE USING (interview_id IN (SELECT id FROM interviews WHERE user_id = auth.uid()));
