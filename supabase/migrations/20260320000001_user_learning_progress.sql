-- Migration: Add user learning progress table for tracking educational content
-- Date: 2026-03-20
-- Purpose: Store user learning progress (streaks, achievements, quiz scores, etc.)

-- Create the user_learning_progress table
CREATE TABLE IF NOT EXISTS user_learning_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    progress_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create unique constraint on user_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_learning_progress_user_id 
ON user_learning_progress(user_id);

-- Enable Row Level Security
ALTER TABLE user_learning_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own progress
CREATE POLICY "Users can access own learning progress"
ON user_learning_progress
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can insert their own progress
CREATE POLICY "Users can insert own learning progress"
ON user_learning_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own progress
CREATE POLICY "Users can update own learning progress"
ON user_learning_progress
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own progress
CREATE POLICY "Users can delete own learning progress"
ON user_learning_progress
FOR DELETE
USING (auth.uid() = user_id);

-- Add comment for documentation
COMMENT ON TABLE user_learning_progress IS 'Stores user learning progress including streaks, achievements, quiz scores, and completed lessons';
COMMENT ON COLUMN user_learning_progress.progress_data IS 'JSON object containing: streak, achievements, quizScores, completedLessons, watchedVideos, flashcardsReviewed';

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_user_learning_progress_updated_at ON user_learning_progress;
CREATE TRIGGER update_user_learning_progress_updated_at
    BEFORE UPDATE ON user_learning_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create upsert function for convenience
CREATE OR REPLACE FUNCTION upsert_user_learning_progress(
    p_user_id UUID,
    p_progress_data JSONB
)
RETURNS user_learning_progress AS $$
DECLARE
    v_result user_learning_progress;
BEGIN
    INSERT INTO user_learning_progress (user_id, progress_data)
    VALUES (p_user_id, p_progress_data)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        progress_data = p_progress_data,
        updated_at = now()
    RETURNING * INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute on upsert function
GRANT EXECUTE ON FUNCTION upsert_user_learning_progress(UUID, JSONB) TO authenticated;
