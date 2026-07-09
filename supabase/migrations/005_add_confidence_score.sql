-- Add confidence_score column to estimates table
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS confidence_score DECIMAL DEFAULT 0.75;
