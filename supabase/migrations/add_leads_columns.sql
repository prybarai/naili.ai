-- Add missing columns to the leads table
-- These columns are used by the leads/create API for enriched lead data

ALTER TABLE leads ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'website';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS project_type TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS scope_summary TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS photo_urls TEXT[];
ALTER TABLE leads ADD COLUMN IF NOT EXISTS estimate_low NUMERIC;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS estimate_mid NUMERIC;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS estimate_high NUMERIC;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS brief_summary TEXT;
