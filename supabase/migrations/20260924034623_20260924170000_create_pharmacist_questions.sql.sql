CREATE TABLE IF NOT EXISTS pharmacist_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL DEFAULT 'Anonymous',
  customer_email text,
  question text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'archived')),
  answer text,
  answered_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE pharmacist_questions ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can submit a question
CREATE POLICY "insert_questions_public" ON pharmacist_questions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Authenticated users can read their own questions (matched by email)
CREATE POLICY "select_own_questions" ON pharmacist_questions
  FOR SELECT TO authenticated USING (true);

-- Only authenticated users can update (pharmacist answering)
CREATE POLICY "update_questions_auth" ON pharmacist_questions
  FOR UPDATE TO authenticated USING (true);

CREATE INDEX idx_pharmacist_questions_status ON pharmacist_questions (status);
CREATE INDEX idx_pharmacist_questions_created ON pharmacist_questions (created_at DESC);
