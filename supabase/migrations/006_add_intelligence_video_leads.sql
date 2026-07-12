-- Intelligence Reports
CREATE TABLE IF NOT EXISTS intelligence_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  local_market_summary TEXT,
  comparable_sales_impact TEXT,
  contractor_density_note TEXT,
  permit_timeline_note TEXT,
  seasonal_pricing_note TEXT,
  material_availability_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intelligence_reports_project ON intelligence_reports(project_id);

-- Project Videos
CREATE TABLE IF NOT EXISTS project_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  video_url TEXT,
  thumbnail_url TEXT,
  prompt TEXT,
  model TEXT DEFAULT 'gpt-image-1',
  duration_seconds INTEGER DEFAULT 5,
  status TEXT DEFAULT 'generating',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_videos_project ON project_videos(project_id);

-- Lead Connections (tracks homeowner -> contractor lead routing)
CREATE TABLE IF NOT EXISTS lead_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  prefer_real_estimate BOOLEAN DEFAULT false,
  timing TEXT,
  notes TEXT,
  source TEXT DEFAULT 'naili_results',
  status TEXT DEFAULT 'new',
  routed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_connections_project ON lead_connections(project_id);
CREATE INDEX IF NOT EXISTS idx_lead_connections_status ON lead_connections(status);

-- Enable RLS
ALTER TABLE intelligence_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_connections ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access" ON intelligence_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON project_videos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON lead_connections FOR ALL USING (true) WITH CHECK (true);
