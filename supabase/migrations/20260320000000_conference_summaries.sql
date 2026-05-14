-- Conference Summaries table for tracking meetings with opposing counsel
CREATE TABLE IF NOT EXISTS conference_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  conference_type TEXT NOT NULL, -- rule_26f, scheduling, pretrial, settlement, status, other
  conference_date DATE NOT NULL,
  conference_time TEXT,
  conference_location TEXT,
  your_name TEXT NOT NULL,
  opposing_counsel TEXT,
  attendees JSONB DEFAULT '[]',
  topics_discussed JSONB DEFAULT '[]',
  agreements JSONB DEFAULT '[]',
  disagreements JSONB DEFAULT '[]',
  follow_up_items JSONB DEFAULT '[]',
  next_conference JSONB,
  additional_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conference_summaries_case_id ON conference_summaries(case_id);
CREATE INDEX IF NOT EXISTS idx_conference_summaries_date ON conference_summaries(conference_date);

-- RLS
ALTER TABLE conference_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conference summaries" ON conference_summaries
  FOR SELECT USING (
    case_id IN (
      SELECT id FROM cases WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own conference summaries" ON conference_summaries
  FOR INSERT WITH CHECK (
    case_id IN (
      SELECT id FROM cases WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own conference summaries" ON conference_summaries
  FOR UPDATE USING (
    case_id IN (
      SELECT id FROM cases WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own conference summaries" ON conference_summaries
  FOR DELETE USING (
    case_id IN (
      SELECT id FROM cases WHERE user_id = auth.uid()
    )
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conference_summaries_updated_at
  BEFORE UPDATE ON conference_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
